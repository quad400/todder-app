import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './common/config/config.module';
import { DatabaseModule } from './common/config/database.module';

@Module({
  imports: [
    // DatabaseModule,
     ConfigurationModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


