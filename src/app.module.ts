import { Module } from '@nestjs/common';
import * as process from 'node:process';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        return null;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
