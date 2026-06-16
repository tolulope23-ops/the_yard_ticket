import { DataSource } from "typeorm";
import 'dotenv/config';
import { buildTypeOrmOptions } from "./typeorm.config";

export default new DataSource({
    ...buildTypeOrmOptions(
        process.env.DATABASE_URL!,
        process.env.NODE_ENV === 'production'
    ),

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});