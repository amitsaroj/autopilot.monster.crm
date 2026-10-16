import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { LessThan, MoreThan, Repository } from 'typeorm';
import type { AppConfig } from '../../config/app.config';
import { ShopifyConnection } from '../../database/entities/shopify-connection.entity';
import { ShopifyOAuthState } from '../../database/entities/shopify-oauth-state.entity';
import { SHOPIFY_TOPICS } from './shopify-webhook-topics';

interface ShopifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  scope: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
}

interface ShopifyGraphqlResponse {
  data?: {
    orders?: {
      nodes?: Array<{
        name: string;
        displayFinancialStatus: string | null;
        displayFulfillmentStatus: string | null;
        processedAt: string | null;
        phone: string | null;
        customer?: { phone: string | null } | null;
        shippingAddress?: { phone: string | null } | null;
        fulfillments?: Array<{
          trackingInfo?: Array<{ number: string | null; url: string | null; company: string | null }>;
        }>;
      }>;
    };
    webhookSubscriptions?: {
      edges?: Array<{
        node: { id: string; topic: string; endpoint: { callbackUrl: string } };
      }>;
    };
    webhookSubscriptionCreate?: {
      webhookSubscription?: { id: string } | null;
      userErrors?: Array<{ field?: string[]; message: string }>;
    };
  };
  errors?: unknown[];
}

const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const KEY_ID = /^[A-Za-z0-9_-]{1,32}$/;

function parseKey(value: string): Buffer | null {
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, 'hex');
  const decoded = Buffer.from(value, 'base64');
  return decoded.length === 32 && decoded.toString('base64') === value ? decoded : null;
}

@Injectable()
export class ShopifyIntegrationService {
  private readonly logger = new Logger(ShopifyIntegrationService.name);
  private readonly keys = new Map<string, Buffer>();
  private readonly currentKeyId: string;

  constructor(
    @InjectRepository(ShopifyConnection)
    private readonly connections: Repository<ShopifyConnection>,
    @InjectRepository(ShopifyOAuthState)
    private readonly states: Repository<ShopifyOAuthState>,
    private readonly config: ConfigService,
  ) {
    const settings = this.settings();
    const legacyKey = parseKey(settings.legacyTokenKey);
    if (legacyKey) this.keys.set('v1', legacyKey);
    for (const entry of settings.tokenKeys.split(',')) {
      const value = entry.trim();
      if (!value) continue;
      const separator = value.indexOf(':');
      const id = value.slice(0, separator);
      const key = parseKey(value.slice(separator + 1));
      if (separator > 0 && KEY_ID.test(id) && key) this.keys.set(id, key);
      else this.logger.warn('Ignoring invalid SHOPIFY_TOKEN_KEYS entry');
    }
    this.currentKeyId = settings.tokenKeyId || 'v1';
  }

  private settings(): AppConfig['shopify'] {
    return (
      this.config.get<AppConfig['shopify']>('app.shopify') ?? {
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        webhookUrl: '',
        apiVersion: '2026-10',
        scopes: 'read_orders,read_products',
        tokenKeyId: 'v1',
        tokenKeys: '',
        legacyTokenKey: '',
      }
    );
  }

  private encryptionConfigured(): boolean {
    return this.keys.has(this.currentKeyId);
  }

  private isConfigured(): boolean {
    const settings = this.settings();
    return !!(
      settings.clientId &&
      settings.clientSecret &&
      settings.callbackUrl &&
      settings.webhookUrl &&
      settings.apiVersion &&
      this.encryptionConfigured()
    );
  }

  private requireConfigured(): AppConfig['shopify'] {
    const settings = this.settings();
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Shopify requires app credentials, callback/webhook URLs, API version and a 32-byte encryption key',
      );
    }
    if (!/^\d{4}-\d{2}$/.test(settings.apiVersion))
      throw new ServiceUnavailableException('Shopify API version is invalid');
    return settings;
  }

  async status(tenantId: string) {
    const connection = await this.connections.findOne({ where: { tenantId } });
    const webhookOutOfDate =
      connection?.webhookStatus === 'READY' &&
      connection.webhookSubscriptionIds.length !== SHOPIFY_TOPICS.length;
    return {
      configured: this.isConfigured(),
      connected: connection?.status === 'CONNECTED' || connection?.status === 'DEGRADED',
      shop: connection?.shopDomain ?? null,
      scopes: connection?.scopes ?? [],
      webhookStatus: webhookOutOfDate ? 'DEGRADED' : (connection?.webhookStatus ?? null),
      lastError: webhookOutOfDate
        ? 'Webhook subscriptions changed; sync webhook setup to enable the current triggers.'
        : (connection?.lastError ?? null),
    };
  }

  async beginConnect(tenantId: string, input: string): Promise<{ authorizationUrl: string }> {
    const settings = this.requireConfigured();
    const shop = input.trim().toLowerCase();
    if (!SHOP_DOMAIN.test(shop))
      throw new BadRequestException('Enter the exact store domain, such as example.myshopify.com');

    const state = randomBytes(32).toString('base64url');
    await this.states.manager.transaction(async (manager) => {
      await manager.getRepository(ShopifyOAuthState).delete({
        tenantId,
        expiresAt: LessThan(new Date()),
      });
      await manager.getRepository(ShopifyOAuthState).save({
        tenantId,
        shopDomain: shop,
        stateHash: createHash('sha256').update(state).digest('hex'),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    });

    const url = new URL(`https://${shop}/admin/oauth/authorize`);
    url.searchParams.set('client_id', settings.clientId);
    url.searchParams.set('scope', settings.scopes);
    url.searchParams.set('redirect_uri', settings.callbackUrl);
    url.searchParams.set('state', state);
    return { authorizationUrl: url.toString() };
  }

  async completeCallback(searchParams: URLSearchParams): Promise<string> {
    const settings = this.requireConfigured();
    this.verifyOAuthHmac(searchParams, settings.clientSecret);
    const shopInput = this.single(searchParams, 'shop');
    const state = this.single(searchParams, 'state');
    const shop = shopInput.toLowerCase();
    if (!SHOP_DOMAIN.test(shop)) throw new BadRequestException('Invalid Shopify shop domain');

    const consumed = await this.states.manager.transaction(async (manager) => {
      const stateRepo = manager.getRepository(ShopifyOAuthState);
      const record = await stateRepo.findOne({
        where: {
          stateHash: createHash('sha256').update(state).digest('hex'),
          shopDomain: shop,
          expiresAt: MoreThan(new Date()),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record)
        throw new ForbiddenException('Shopify authorization state is invalid or expired');
      await stateRepo.delete({ id: record.id, tenantId: record.tenantId });
      return { tenantId: record.tenantId };
    });

    if (searchParams.has('error')) return this.frontendRedirect('cancelled');
    const code = this.single(searchParams, 'code');
    const token = await this.exchangeCode(shop, code, settings);
    const now = Date.now();
    if (
      !token.access_token ||
      !token.refresh_token ||
      !token.expires_in ||
      !token.refresh_token_expires_in
    ) {
      throw new BadGatewayException('Shopify did not return an expiring offline token pair');
    }
    const tenantId = consumed.tenantId;
    const encryptedAccessToken = this.encrypt(token.access_token, tenantId, shop, 'access');
    const encryptedRefreshToken = this.encrypt(token.refresh_token, tenantId, shop, 'refresh');
    await this.connections.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`shopify-owner:${shop}`]);
      const repository = manager.getRepository(ShopifyConnection);
      const existing = await repository
        .createQueryBuilder('connection')
        .withDeleted()
        .setLock('pessimistic_write')
        .where('connection.shopDomain = :shop', { shop })
        .getOne();
      if (existing && existing.tenantId !== tenantId && existing.status !== 'DISCONNECTED')
        throw new ConflictException('This Shopify store is already connected to another workspace');
      if (existing?.deletedAt)
        await repository.restore({ id: existing.id, tenantId: existing.tenantId });
      const connection = existing ?? repository.create({ tenantId, shopDomain: shop });
      connection.tenantId = tenantId;
      connection.status = 'CONNECTED';
      connection.encryptedAccessToken = encryptedAccessToken;
      connection.encryptedRefreshToken = encryptedRefreshToken;
      connection.scopes = token.scope
        .split(',')
        .map((scope) => scope.trim())
        .filter(Boolean);
      connection.accessTokenExpiresAt = new Date(now + token.expires_in! * 1000);
      connection.refreshTokenExpiresAt = new Date(now + token.refresh_token_expires_in! * 1000);
      connection.webhookStatus = 'NOT_CONFIGURED';
      connection.lastError = null;
      connection.connectedAt = new Date(now);
      connection.disconnectedAt = null;
      await repository.save(connection);
    });
    await this.syncWebhooks(tenantId);
    return this.frontendRedirect('connected');
  }

  async syncWebhooks(tenantId: string): Promise<{ webhookStatus: 'READY' | 'DEGRADED' }> {
    const connection = await this.connectionWithTokens(tenantId);
    const settings = this.requireConfigured();
    let webhookUrl: URL;
    try {
      webhookUrl = new URL(settings.webhookUrl);
    } catch {
      return this.markWebhookDegraded(connection, 'Set a public HTTPS Shopify webhook URL');
    }
    if (webhookUrl.protocol !== 'https:')
      return this.markWebhookDegraded(connection, 'Set a public HTTPS Shopify webhook URL');

    try {
      const accessToken = await this.getValidAccessToken(connection);
      const existingResponse = await axios.post<ShopifyGraphqlResponse>(
        `https://${connection.shopDomain}/admin/api/${settings.apiVersion}/graphql.json`,
        {
          query: `query ExistingWebhooks {
            webhookSubscriptions(first: 100) {
              edges { node { id topic endpoint { ... on WebhookHttpEndpoint { callbackUrl } } } }
            }
          }`,
        },
        { headers: { 'X-Shopify-Access-Token': accessToken }, timeout: 10000 },
      );
      if (existingResponse.data.errors?.length)
        return this.markWebhookDegraded(
          connection,
          'Could not inspect existing Shopify webhook subscriptions',
        );
      const existingSubscriptions = existingResponse.data.data?.webhookSubscriptions?.edges ?? [];
      const subscriptionIds: string[] = [];
      for (const spec of SHOPIFY_TOPICS) {
        const topic = spec.topic.replaceAll('/', '_').toUpperCase();
        const existing = existingSubscriptions.find(
          ({ node }) => node.topic === topic && node.endpoint.callbackUrl === settings.webhookUrl,
        );
        if (existing) {
          subscriptionIds.push(existing.node.id);
          continue;
        }
        const response = await axios.post<ShopifyGraphqlResponse>(
          `https://${connection.shopDomain}/admin/api/${settings.apiVersion}/graphql.json`,
          {
            query: `mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $input: WebhookSubscriptionInput!) {
              webhookSubscriptionCreate(topic: $topic, webhookSubscription: $input) {
                webhookSubscription { id }
                userErrors { field message }
              }
            }`,
            variables: {
              topic,
              input: { uri: settings.webhookUrl, includeFields: spec.fields },
            },
          },
          { headers: { 'X-Shopify-Access-Token': accessToken }, timeout: 10000 },
        );
        const payload = response.data.data?.webhookSubscriptionCreate;
        if (
          response.data.errors?.length ||
          payload?.userErrors?.length ||
          !payload?.webhookSubscription?.id
        )
          return this.markWebhookDegraded(
            connection,
            'Shopify rejected one or more webhook subscriptions',
          );
        subscriptionIds.push(payload.webhookSubscription.id);
      }
      await this.connections.update(
        { id: connection.id, tenantId },
        {
          status: 'CONNECTED',
          webhookStatus: 'READY',
          webhookSubscriptionIds: subscriptionIds,
          lastError: null,
        },
      );
      return { webhookStatus: 'READY' };
    } catch {
      return this.markWebhookDegraded(
        connection,
        'Shopify webhook setup failed; check permissions and reauthorize',
      );
    }
  }

  async lookupOrderStatus(tenantId: string, orderName: string, senderPhone: string) {
    const normalizedOrderName = orderName.trim().replace(/^#/, '').toLowerCase();
    const phoneDigits = senderPhone.replace(/\D/g, '');
    if (!/^[a-z0-9-]{1,40}$/i.test(normalizedOrderName))
      throw new BadRequestException('Enter a valid Shopify order number');
    if (phoneDigits.length < 8 || phoneDigits.length > 15)
      throw new BadRequestException('The incoming WhatsApp number cannot verify this order');

    const connection = await this.connectionWithTokens(tenantId);
    if (!connection.scopes.includes('read_orders'))
      throw new ServiceUnavailableException('Reconnect Shopify with order read permission');
    const accessToken = await this.getValidAccessToken(connection);
    const settings = this.requireConfigured();
    const escapedName = normalizedOrderName.replaceAll('"', '\\"');
    let response: { data: ShopifyGraphqlResponse };
    try {
      response = await axios.post<ShopifyGraphqlResponse>(
        `https://${connection.shopDomain}/admin/api/${settings.apiVersion}/graphql.json`,
        {
          query: `query OrderStatus($search: String!) {
            orders(first: 10, query: $search) {
              nodes {
                name displayFinancialStatus displayFulfillmentStatus processedAt phone
                customer { phone }
                shippingAddress { phone }
                fulfillments(first: 5) { trackingInfo { number url company } }
              }
            }
          }`,
          variables: { search: `name:"${escapedName}"` },
        },
        { headers: { 'X-Shopify-Access-Token': accessToken }, timeout: 10000 },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Shopify order lookup failed; check store permissions and health',
      );
    }
    if (response.data.errors?.length) {
      throw new ServiceUnavailableException(
        'Shopify could not verify the order; check order access and protected customer data permissions',
      );
    }
    const matchingOrders = (response.data.data?.orders?.nodes ?? []).filter(
      (order) => order.name.replace(/^#/, '').toLowerCase() === normalizedOrderName,
    );
    if (matchingOrders.length !== 1)
      throw new NotFoundException('No unique matching Shopify order was found');
    const order = matchingOrders[0];
    const verifiedPhone = [order.phone, order.customer?.phone, order.shippingAddress?.phone].some(
      (candidate) =>
        typeof candidate === 'string' && candidate.replace(/\D/g, '') === phoneDigits,
    );
    if (!verifiedPhone) throw new NotFoundException('No matching order was found for this sender');

    return {
      orderName: order.name,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      processedAt: order.processedAt,
      trackingInfo: (order.fulfillments ?? []).flatMap((fulfillment) =>
        (fulfillment.trackingInfo ?? []).map(({ number, url, company }) => ({ number, url, company })),
      ),
    };
  }

  private markWebhookDegraded(
    connection: ShopifyConnection,
    lastError: string,
  ): Promise<{ webhookStatus: 'DEGRADED' }> {
    return this.connections
      .update(
        { id: connection.id, tenantId: connection.tenantId },
        { status: 'DEGRADED', webhookStatus: 'DEGRADED', lastError },
      )
      .then(() => ({ webhookStatus: 'DEGRADED' }));
  }

  private async getValidAccessToken(connection: ShopifyConnection): Promise<string> {
    if (
      !connection.accessTokenExpiresAt ||
      connection.accessTokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000
    ) {
      return this.decrypt(
        connection.encryptedAccessToken,
        connection.tenantId,
        connection.shopDomain,
        'access',
      );
    }
    const settings = this.requireConfigured();
    try {
      return await this.connections.manager.transaction(async (manager) => {
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `shopify-token-refresh:${connection.id}`,
        ]);
        const repo = manager.getRepository(ShopifyConnection);
        const current = await repo
          .createQueryBuilder('connection')
          .addSelect(['connection.encryptedAccessToken', 'connection.encryptedRefreshToken'])
          .setLock('pessimistic_write')
          .where('connection.id=:id AND connection.tenantId=:tenantId', {
            id: connection.id,
            tenantId: connection.tenantId,
          })
          .getOne();
        if (!current || current.status === 'DISCONNECTED')
          throw new ServiceUnavailableException('Shopify store is disconnected');
        if (
          !current.accessTokenExpiresAt ||
          current.accessTokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000
        ) {
          return this.decrypt(
            current.encryptedAccessToken,
            current.tenantId,
            current.shopDomain,
            'access',
          );
        }
        if (
          !current.encryptedRefreshToken ||
          !current.refreshTokenExpiresAt ||
          current.refreshTokenExpiresAt <= new Date()
        ) {
          throw new ServiceUnavailableException(
            'Shopify authorization expired; reconnect this store',
          );
        }
        const refreshToken = this.decrypt(
          current.encryptedRefreshToken,
          current.tenantId,
          current.shopDomain,
          'refresh',
        );
        const response = await axios.post<ShopifyTokenResponse>(
          `https://${current.shopDomain}/admin/oauth/access_token`,
          {
            client_id: settings.clientId,
            client_secret: settings.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
          { timeout: 10000 },
        );
        const tokens = response.data;
        if (
          !tokens.access_token ||
          !tokens.refresh_token ||
          !tokens.expires_in ||
          !tokens.refresh_token_expires_in
        ) {
          throw new ServiceUnavailableException(
            'Shopify token refresh returned an incomplete token pair',
          );
        }
        current.encryptedAccessToken = this.encrypt(
          tokens.access_token,
          current.tenantId,
          current.shopDomain,
          'access',
        );
        current.encryptedRefreshToken = this.encrypt(
          tokens.refresh_token,
          current.tenantId,
          current.shopDomain,
          'refresh',
        );
        current.accessTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        current.refreshTokenExpiresAt = new Date(
          Date.now() + tokens.refresh_token_expires_in * 1000,
        );
        if (tokens.scope)
          current.scopes = tokens.scope
            .split(',')
            .map((scope) => scope.trim())
            .filter(Boolean);
        current.status = 'CONNECTED';
        current.lastError = null;
        await repo.save(current);
        return tokens.access_token;
      });
    } catch {
      await this.connections.update(
        { id: connection.id, tenantId: connection.tenantId },
        { status: 'DEGRADED', lastError: 'Shopify authorization expired; reconnect this store' },
      );
      throw new ServiceUnavailableException('Shopify authorization expired; reconnect this store');
    }
  }

  private frontendRedirect(result: string): string {
    const frontendUrl = this.config.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
    const url = new URL('/settings/integrations', frontendUrl);
    url.searchParams.set('shopify', result);
    return url.toString();
  }

  private single(params: URLSearchParams, key: string): string {
    const values = params.getAll(key);
    if (values.length !== 1 || !values[0])
      throw new BadRequestException(`Missing or repeated ${key}`);
    return values[0];
  }

  private verifyOAuthHmac(params: URLSearchParams, secret: string): void {
    const hmac = params.get('hmac');
    if (!hmac || !/^[a-f0-9]{64}$/i.test(hmac))
      throw new ForbiddenException('Invalid Shopify authorization signature');
    const canonical = [...params.entries()]
      .filter(([key]) => key !== 'hmac' && key !== 'signature')
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const expected = createHmac('sha256', secret).update(canonical).digest();
    const received = Buffer.from(hmac, 'hex');
    if (received.length !== expected.length || !timingSafeEqual(received, expected))
      throw new ForbiddenException('Invalid Shopify authorization signature');
  }

  private async exchangeCode(
    shop: string,
    code: string,
    settings: AppConfig['shopify'],
  ): Promise<ShopifyTokenResponse> {
    try {
      const response = await axios.post<ShopifyTokenResponse>(
        `https://${shop}/admin/oauth/access_token`,
        {
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
          code,
          expiring: 1,
        },
        { timeout: 10000 },
      );
      return response.data;
    } catch {
      throw new BadGatewayException('Could not exchange Shopify authorization code');
    }
  }

  private encrypt(value: string, tenantId: string, shop: string, purpose: string): string {
    const key = this.keys.get(this.currentKeyId);
    if (!key) throw new ServiceUnavailableException('Shopify token encryption key is unavailable');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(`${tenantId}:${shop}:${purpose}`));
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [
      this.currentKeyId,
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  private decrypt(value: string, tenantId: string, shop: string, purpose: string): string {
    try {
      const [keyId, ivText, tagText, encryptedText] = value.split('.');
      const key = keyId ? this.keys.get(keyId) : undefined;
      const iv = Buffer.from(ivText ?? '', 'base64');
      const tag = Buffer.from(tagText ?? '', 'base64');
      const encrypted = Buffer.from(encryptedText ?? '', 'base64');
      if (!key || iv.length !== 12 || tag.length !== 16 || !encrypted.length) throw new Error();
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAAD(Buffer.from(`${tenantId}:${shop}:${purpose}`));
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch {
      throw new ServiceUnavailableException(
        'Shopify credentials are unavailable; reconnect this store',
      );
    }
  }

  private async connectionWithTokens(tenantId: string): Promise<ShopifyConnection> {
    const connection = await this.connections
      .createQueryBuilder('connection')
      .addSelect(['connection.encryptedAccessToken', 'connection.encryptedRefreshToken'])
      .where('connection.tenantId = :tenantId', { tenantId })
      .andWhere("connection.status IN ('CONNECTED','DEGRADED')")
      .getOne();
    if (!connection) throw new NotFoundException('Shopify store is not connected');
    return connection;
  }

  async disconnect(tenantId: string): Promise<{ disconnected: true }> {
    const connection = await this.connectionWithTokens(tenantId);
    const accessToken = await this.getValidAccessToken(connection);
    try {
      const response = await axios.post<{
        data?: { appUninstall?: { userErrors?: Array<{ message: string }> } };
        errors?: unknown[];
      }>(
        `https://${connection.shopDomain}/admin/api/${this.settings().apiVersion}/graphql.json`,
        { query: 'mutation { appUninstall { app { id } userErrors { message } } }' },
        { headers: { 'X-Shopify-Access-Token': accessToken }, timeout: 10000 },
      );
      const errors = response.data.data?.appUninstall?.userErrors ?? [];
      if (response.data.errors?.length || errors.length)
        throw new BadGatewayException('Shopify refused to uninstall the app');
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) throw error;
      throw new ServiceUnavailableException(
        'Shopify could not confirm app uninstall; the connection was left active',
      );
    }
    await this.connections.update(
      { id: connection.id, tenantId },
      {
        status: 'DISCONNECTED',
        encryptedAccessToken: '',
        encryptedRefreshToken: null,
        scopes: [],
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        webhookStatus: 'NOT_CONFIGURED',
        disconnectedAt: new Date(),
      },
    );
    return { disconnected: true };
  }
}
