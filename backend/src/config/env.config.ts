export const env = {
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isProduction: process.env['NODE_ENV'] === 'production',

  app: {
    port: Number.parseInt(process.env['APP_PORT'] ?? process.env['PORT'] ?? '8000', 10),
    host: process.env['APP_HOST'] ?? '0.0.0.0',
    url: process.env['APP_URL'] ?? 'http://localhost:8000',
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    secret: process.env['APP_SECRET'] ?? '',
    logLevel: process.env['LOG_LEVEL'] ?? 'debug',
    logFormat: process.env['LOG_FORMAT'] ?? 'json',
    publishOpenApi: (process.env['PUBLISH_OPENAPI'] ?? 'false') === 'true',
  },

  database: {
    url: process.env['DATABASE_URL'] ?? '',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number.parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME'] ?? 'autopilot_crm',
    username: process.env['DB_USER'] ?? 'autopilot',
    password: process.env['DB_PASSWORD'] ?? '',
    ssl: process.env['DB_SSL'] === 'true',
    logging: process.env['DB_LOGGING'] === 'true',
    synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
    poolSize: Number.parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
  },

  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: Number.parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? '',
    db: Number.parseInt(process.env['REDIS_DB'] ?? '0', 10),
    tls: process.env['REDIS_TLS'] === 'true',
    ttl: Number.parseInt(process.env['REDIS_TTL'] ?? '3600', 10),
  },

  qdrant: {
    url: process.env['QDRANT_URL'] ?? 'http://localhost:6333',
    apiKey: process.env['QDRANT_API_KEY'] ?? '',
    collectionCrm: process.env['QDRANT_COLLECTION_CRM'] ?? 'crm-vectors',
    collectionAi: process.env['QDRANT_COLLECTION_AI'] ?? 'ai-vectors',
  },

  minio: {
    endpoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
    port: Number.parseInt(process.env['MINIO_PORT'] ?? '9000', 10),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY'] ?? 'minioadmin',
    secretKey: process.env['MINIO_SECRET_KEY'] ?? 'minioadmin',
    bucketAssets: process.env['MINIO_BUCKET_ASSETS'] ?? 'autopilot-assets',
    bucketBackups: process.env['MINIO_BUCKET_BACKUPS'] ?? 'autopilot-backups',
  },

  jwt: {
    algorithm: process.env['JWT_ALGORITHM'] ?? undefined,
    secret: process.env['JWT_SECRET'] ?? '',
    privateKey: process.env['JWT_PRIVATE_KEY'] ?? '',
    publicKey: process.env['JWT_PUBLIC_KEY'] ?? '',
    previousPublicKey: process.env['JWT_PUBLIC_KEY_PREVIOUS'] ?? '',
    keyId: process.env['JWT_KEY_ID'] ?? '',
    previousKeyId: process.env['JWT_PREVIOUS_KEY_ID'] ?? '',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? process.env['JWT_SECRET'] ?? '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  },

  throttle: {
    ttl: Number.parseInt(process.env['THROTTLE_TTL'] ?? '60', 10),
    limit: Number.parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
  },

  sentry: {
    dsn: process.env['SENTRY_DSN'] ?? '',
    tracesSampleRate: Number.parseFloat(process.env['SENTRY_TRACES_SAMPLE_RATE'] ?? '0.1'),
    profilesSampleRate: Number.parseFloat(process.env['SENTRY_PROFILES_SAMPLE_RATE'] ?? '0.1'),
  },

  social: {
    facebookPageToken: process.env['FACEBOOK_PAGE_TOKEN'] ?? '',
    facebookPageId: process.env['FACEBOOK_PAGE_ID'] ?? '',
    twitterBearerToken: process.env['TWITTER_BEARER_TOKEN'] ?? '',
    linkedinAccessToken: process.env['LINKEDIN_ACCESS_TOKEN'] ?? '',
    linkedinAuthorUrn: process.env['LINKEDIN_AUTHOR_URN'] ?? '',
  },

  whatsapp: {
    token: process.env['WHATSAPP_TOKEN'] ?? '',
    businessAccountId: process.env['WHATSAPP_BUSINESS_ACCOUNT_ID'] ?? '',
    verifyToken: process.env['META_WEBHOOK_VERIFY_TOKEN'] ?? '',
    appSecret: process.env['META_APP_SECRET'] ?? '',
  },

  oauth: {
    googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
    googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
    googleCallbackUrl:
      process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/google/callback',
    facebookAppId: process.env['FACEBOOK_APP_ID'] ?? '',
    facebookAppSecret: process.env['FACEBOOK_APP_SECRET'] ?? '',
    facebookCallbackUrl:
      process.env['FACEBOOK_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/facebook/callback',
    githubClientId: process.env['GITHUB_CLIENT_ID'] ?? '',
    githubClientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
    githubCallbackUrl:
      process.env['GITHUB_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/github/callback',
    appleClientId: process.env['APPLE_CLIENT_ID'] ?? '',
    appleTeamId: process.env['APPLE_TEAM_ID'] ?? '',
    appleKeyId: process.env['APPLE_KEY_ID'] ?? '',
    applePrivateKey: process.env['APPLE_PRIVATE_KEY'] ?? '',
    appleCallbackUrl:
      process.env['APPLE_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/apple/callback',
  },

  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'] ?? '',
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
    priceStarterMonthly: process.env['STRIPE_PRICE_STARTER_MONTHLY'] ?? '',
    priceStarterAnnual: process.env['STRIPE_PRICE_STARTER_ANNUAL'] ?? '',
    priceProMonthly: process.env['STRIPE_PRICE_PRO_MONTHLY'] ?? '',
    priceProAnnual: process.env['STRIPE_PRICE_PRO_ANNUAL'] ?? '',
    priceEnterpriseMonthly: process.env['STRIPE_PRICE_ENTERPRISE_MONTHLY'] ?? '',
    priceEnterpriseAnnual: process.env['STRIPE_PRICE_ENTERPRISE_ANNUAL'] ?? '',
  },

  paypal: {
    clientId: process.env['PAYPAL_CLIENT_ID'] ?? '',
    clientSecret: process.env['PAYPAL_CLIENT_SECRET'] ?? '',
    webhookId: process.env['PAYPAL_WEBHOOK_ID'] ?? '',
  },

  razorpay: {
    keyId: process.env['RAZORPAY_KEY_ID'] ?? '',
    keySecret: process.env['RAZORPAY_KEY_SECRET'] ?? '',
    webhookSecret: process.env['RAZORPAY_WEBHOOK_SECRET'] ?? '',
  },

  health: {
    diskThreshold: Number.parseFloat(process.env['HEALTH_DISK_THRESHOLD'] ?? '0.98'),
  },
};
