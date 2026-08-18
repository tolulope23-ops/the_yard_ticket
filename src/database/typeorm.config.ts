import { DataSourceOptions } from 'typeorm';

export function buildTypeOrmOptions(databaseUrl: string, ssl: boolean):DataSourceOptions{
    return {
        type: 'postgres',
        url: databaseUrl,

        synchronize: false,
        logging: false,
        ssl: ssl ? {rejectUnauthorized: false} : false,
    };
};