import dotenv from 'dotenv';
dotenv.config();
/**
 * Contains all the configurations required for setting up the core project
 * While most of the parameters are optional, appInsights connection is 
 * a required parameter since it is auto imported in the `tdei_logger.ts`
 */
export const environment = {
    appName: process.env.npm_package_name,
    database: {
        username: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DB,
        ssl: Boolean(process.env.SSL),
        port: parseInt(process.env.DATABASE_PORT ?? "5432"),
    },
    appPort: parseInt(process.env.APPLICATION_PORT ?? "8080"),
    secretGenerateUrl: process.env.AUTH_SECRET_TOKEN_GENERATE_URL,
    secretVerifyUrl: process.env.AUTH_SECRET_TOKEN_VERIFY_URL
}