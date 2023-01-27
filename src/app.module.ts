import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import * as config from 'config';
import { WinstonModule } from 'nest-winston';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nJsonParser,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import * as path from 'path';
import { AppController } from 'src/app.controller';
import { CustomThrottlerGuard } from 'src/common/guard/custom-throttle.guard';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { I18nExceptionFilterPipe } from 'src/common/pipes/i18n-exception-filter.pipe';
import * as throttleConfig from 'src/config/throttle-config';
import winstonConfig from 'src/config/winston';

import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailTemplateModule } from './modules/email-template/email-template.module';
import { MailModule } from './modules/mail/mail.module';
import { PermissionsModule } from './modules/permission/permissions.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { TwofaModule } from './modules/twofa/twofa.module';

const appConfig = config.get('app');

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig,
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: appConfig.fallbackLanguage,
        parserOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      parser: I18nJsonParser,
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang', 'locale', 'l'],
        },
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(['lang', 'locale', 'l']),
        AcceptLanguageResolver,
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    InfraModule,
    AuthModule,
    PermissionsModule,
    EmailTemplateModule,
    MailModule,
    RefreshTokenModule,
    TwofaModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilterPipe,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
