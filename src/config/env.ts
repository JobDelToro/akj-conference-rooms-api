import 'dotenv/config';

/**
* Centralized environment parsing. Fails fast if required values are missing.
*/
const required = (name: string): string => {
    const v = process.env[name];
    if (!v) throw new Error(`Missing ENV var: ${name}`);
    return v;
};

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 3001),
    DATABASE_URL: process.env.DATABASE_URL,
    // Individual DB config (optional if DATABASE_URL is provided)
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: Number(process.env.DB_PORT ?? 5432),
    DB_NAME: process.env.DB_NAME ?? 'akj_conference_rooms',
    DB_USER: process.env.DB_USER ?? 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DB_POOL_MIN: Number(process.env.DB_POOL_MIN ?? 2),
    DB_POOL_MAX: Number(process.env.DB_POOL_MAX ?? 10),
};
