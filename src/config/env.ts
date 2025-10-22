import 'dotenv/config';
/**
* Centralized environment parsing. Fails fast if required values are missing.
*/
const required = (name: string): string => {
    const v = process.env[name];
    if (!v) throw new Error(`Missing ENV var: ${name}`);
    return v;
};
5
export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 3001),
    DATABASE_URL: required('DATABASE_URL'),
};
