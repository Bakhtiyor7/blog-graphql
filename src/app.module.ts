import { Module } from '@nestjs/common';
import * as process from 'node:process';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from '../config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PostsModule } from './posts/posts.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: true,
        playground: configService.get<string>('NODE_ENV') !== 'production',
        introspection: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: typeOrmConfig,
    // }),
    PostsModule,
    UserModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'DEBUG_CONFIG',
      useFactory: (configService: ConfigService) => {
        console.log('Loaded NODE_ENV:', configService.get('NODE_ENV'));
        console.log('Loaded DATABASE_URL:', configService.get('DATABASE_URL'));
        return null;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
