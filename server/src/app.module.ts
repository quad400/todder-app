import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './common/config/config.module';
import { DatabaseModule } from './common/config/database.module';
import { AuthModule } from './auth/auth.module';
import { ModelModule } from './common/module/model.module';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './common/guards/jwt.guard';

@Module({
  imports: [
    DatabaseModule,
    ModelModule,
    ConfigurationModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
