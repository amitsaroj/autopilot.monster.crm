import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { MetaWhatsappProvider } from './whatsapp-provider';
import type { WhatsappCredentials } from './whatsapp-provider';

const provider = (env: Record<string, string> = { META_APP_ID: '42', META_APP_SECRET: 's3cret' }) =>
  new MetaWhatsappProvider({ get: (key: string) => env[key] } as unknown as ConfigService);

const credentials: WhatsappCredentials = {
  provider: 'meta',
  phoneNumberId: '100',
  businessAccountId: '200',
  accessToken: 'EAAG-token',
};

function respond(data: unknown) {
  return { data, status: 200 } as AxiosResponse;
}

function httpError(status: number): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('fail', String(status), config, undefined, {
    status,
    statusText: 'err',
    data: { error: { message: 'Invalid verification code format.' } },
    headers: {},
    config,
  });
}

describe('MetaWhatsappProvider onboarding calls', () => {
  let request: jest.SpyInstance;
  beforeEach(() => {
    request = jest.spyOn(axios, 'request');
  });
  afterEach(() => jest.restoreAllMocks());

  const call = (index = 0) => request.mock.calls[index][0] as AxiosRequestConfig;

  it('exchanges the signup code with app credentials and no bearer token', async () => {
    request.mockResolvedValue(respond({ access_token: 'EAAG-new', token_type: 'bearer' }));
    await expect(provider().exchangeSignupCode('AQB-code')).resolves.toBe('EAAG-new');
    expect(call()).toMatchObject({
      url: 'https://graph.facebook.com/v23.0/oauth/access_token',
      method: 'GET',
      params: { client_id: '42', client_secret: 's3cret', code: 'AQB-code' },
      maxRedirects: 0,
    });
    expect(call().headers).not.toHaveProperty('Authorization');
  });

  it('maps a rejected code to a sanitized BadRequest', async () => {
    request.mockRejectedValue(httpError(400));
    const promise = provider().exchangeSignupCode('AQB-code');
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(/expired or already used/);
  });

  it('requires META_APP_ID and META_APP_SECRET', async () => {
    await expect(provider({}).exchangeSignupCode('AQB-code')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it('subscribes, unsubscribes and registers via the documented edges', async () => {
    request.mockResolvedValue(respond({ success: true }));
    const meta = provider();
    await meta.subscribeApp(credentials);
    await meta.unsubscribeApp(credentials);
    await meta.registerPhone(credentials, '123456');
    expect(call(0)).toMatchObject({
      url: 'https://graph.facebook.com/v23.0/200/subscribed_apps',
      method: 'POST',
    });
    expect(call(1)).toMatchObject({
      url: 'https://graph.facebook.com/v23.0/200/subscribed_apps',
      method: 'DELETE',
    });
    expect(call(2)).toMatchObject({
      url: 'https://graph.facebook.com/v23.0/100/register',
      method: 'POST',
      data: { messaging_product: 'whatsapp', pin: '123456' },
    });
    expect(call(0).headers).toMatchObject({ Authorization: 'Bearer EAAG-token' });
  });

  it('reads diagnostics, checking that this app is the subscribed one', async () => {
    request.mockImplementation(async (config: AxiosRequestConfig) => {
      const url = String(config.url);
      if (url.endsWith('/200/subscribed_apps'))
        return respond({ data: [{ whatsapp_business_api_data: { id: '42' } }] });
      if (url.endsWith('/200/phone_numbers')) return respond({ data: [{ id: '100' }] });
      if (url.endsWith('/200')) return respond({ id: '200' });
      const fields = String((config.params as { fields: string }).fields);
      return respond(
        fields.startsWith('name_status')
          ? { name_status: 'APPROVED', messaging_limit_tier: 'TIER_1K' }
          : { id: '100', quality_rating: 'GREEN', code_verification_status: 'VERIFIED' },
      );
    });
    await expect(provider().readHealth(credentials)).resolves.toMatchObject({
      qualityRating: 'GREEN',
      nameStatus: 'APPROVED',
      messagingLimitTier: 'TIER_1K',
      webhookSubscribed: true,
    });
  });
});
