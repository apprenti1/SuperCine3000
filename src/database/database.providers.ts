import { APPDATA_PROVIDER } from 'src/common/constants';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: APPDATA_PROVIDER,
    useFactory: async () => {
      const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined
      const sync = process.env.DB_SYNCHRONIZE === 'true'

      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: port,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: sync,
      });

      return dataSource.initialize();
    },
  },
];
