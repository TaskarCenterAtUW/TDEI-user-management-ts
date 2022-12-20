import App from './app';
import dotenv from 'dotenv';
import "reflect-metadata";
import healthController from './controller/health-controller';
import { environment } from './environment/environment';
import userManagementController from './controller/user-management-controller';

//Load environment variables
dotenv.config()

const PORT: number = environment.appPort;

new App(
    [
        healthController,
        userManagementController
    ],
    PORT,
).listen();

