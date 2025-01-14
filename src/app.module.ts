import { Module } from '@nestjs/common';
import * as process from 'node:process';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from '../config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from '@hapi/joi';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app/app.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // Load specific and default env files
      isGlobal: true, // Makes ConfigModule globally available
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(), // Host is required
        DB_PORT: Joi.number().default(5432), // Port defaults to 5432
        DB_USERNAME: Joi.string().required(), // Username is required
        DB_PASSWORD: Joi.string().required(), // Password is required
        DB_NAME: Joi.string().required(), // Database name is required
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'), // NODE_ENV validation
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule for access to ConfigService
      inject: [ConfigService], // Inject ConfigService
      useFactory: typeOrmConfig, // Use the exported typeOrmConfig function
    }),
  ],
  controllers: [],
  providers: [AppResolver],
})
export class AppModule {}
