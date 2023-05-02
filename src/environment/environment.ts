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
    appPort: parseInt(process.env.PORT ?? "8080"),
    secretGenerateUrl: `${process.env.AUTH_SERVICE_BASE_URL}/generateSecret`,
    secretVerifyUrl: `${process.env.AUTH_SERVICE_BASE_URL}/validateSecret`,
    apiKeyVerifyUrl: `${process.env.AUTH_SERVICE_BASE_URL}/validateApiKey`,
    registerUserUrl: `${process.env.AUTH_SERVICE_BASE_URL}/registerUser`,
    userProfileUrl: `${process.env.AUTH_SERVICE_BASE_URL}/getUserByUsername`,
    permissionUrl: `${process.env.AUTH_SERVICE_BASE_URL}/hasPermission`,
    authenticateUrl: `${process.env.AUTH_SERVICE_BASE_URL}/authenticate`,
    validateAccessTokenUrl: `${process.env.AUTH_SERVICE_BASE_URL}/validateAccessToken`,
    refreshUrl: `${process.env.AUTH_SERVICE_BASE_URL}/refreshToken`

}