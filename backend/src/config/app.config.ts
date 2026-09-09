import { registerAs } from '@nestjs/config';

import { env } from './env.config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  url: string;
  frontendUrl: string;
  secret: string;
  logLevel: string;
  logFormat: string;
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
    callbackUrl: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  apple: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    callbackUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    prices: {
      starterMonthly: string;
      starterAnnual: string;
      proMonthly: string;
      proAnnual: string;
      enterpriseMonthly: string;
      enterpriseAnnual: string;
    };
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    webhookId: string;
  };
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  publishOpenApi?: boolean;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: env.nodeEnv,
    port: env.app.port,
    host: env.app.host,
    url: env.app.url,
    frontendUrl: env.app.frontendUrl,
    secret: env.app.secret,
    logLevel: env.app.logLevel,
    logFormat: env.app.logFormat,
    google: {
      clientId: env.oauth.googleClientId,
      clientSecret: env.oauth.googleClientSecret,
      callbackUrl: env.oauth.googleCallbackUrl,
    },
    facebook: {
      appId: env.oauth.facebookAppId,
      appSecret: env.oauth.facebookAppSecret,
      callbackUrl: env.oauth.facebookCallbackUrl,
    },
    github: {
      clientId: env.oauth.githubClientId,
      clientSecret: env.oauth.githubClientSecret,
      callbackUrl: env.oauth.githubCallbackUrl,
    },
    apple: {
      clientId: env.oauth.appleClientId,
      teamId: env.oauth.appleTeamId,
      keyId: env.oauth.appleKeyId,
      privateKey: env.oauth.applePrivateKey,
      callbackUrl: env.oauth.appleCallbackUrl,
    },
    stripe: {
      secretKey: env.stripe.secretKey,
      webhookSecret: env.stripe.webhookSecret,
      prices: {
        starterMonthly: env.stripe.priceStarterMonthly,
        starterAnnual: env.stripe.priceStarterAnnual,
        proMonthly: env.stripe.priceProMonthly,
        proAnnual: env.stripe.priceProAnnual,
        enterpriseMonthly: env.stripe.priceEnterpriseMonthly,
        enterpriseAnnual: env.stripe.priceEnterpriseAnnual,
      },
    },
    paypal: {
      clientId: env.paypal.clientId,
      clientSecret: env.paypal.clientSecret,
      webhookId: env.paypal.webhookId,
    },
    razorpay: {
      keyId: env.razorpay.keyId,
      keySecret: env.razorpay.keySecret,
      webhookSecret: env.razorpay.webhookSecret,
    },
    publishOpenApi: env.app.publishOpenApi,
  }),
);
