// import { ConfigService } from '@nestjs/config';
//
// export const typeOrmConfig = (
//   configService: ConfigService,
// ): TypeOrmModuleOptions => {
//   const isProduction = configService.get<string>('NODE_ENV') === 'production';
//
//   return {
//     type: 'postgres',
//     host: configService.get<string>('DB_HOST'),
//     port: configService.get<number>('DB_PORT'),
//     username: configService.get<string>('DB_USERNAME'),
//     password: configService.get<string>('DB_PASSWORD'),
//     database: configService.get<string>('DB_NAME'),
//     entities: ['dist/**/*.entity{.ts,.js}'],
//     synchronize: !isProduction,
//   };
// };
