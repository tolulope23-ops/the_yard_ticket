import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { DataSourceOptions } from 'typeorm';

export function buildTypeOrmOptions(databaseUrl: string, ssl: boolean):DataSourceOptions{
    return {
        type: 'postgres',
        url: databaseUrl,

        synchronize: false,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
        ssl: ssl ? {rejectUnauthorized: false} : false,
    };
};