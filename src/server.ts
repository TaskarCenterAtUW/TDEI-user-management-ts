import App from './app';
import dotenv from 'dotenv';
import "reflect-metadata";
import healthController from './controller/health-controller';
import { environment } from './environment/environment';
import userManagementController from './controller/user-management-controller';
import projectGroupController from './controller/project-group-controller';
import flexServiceController from './controller/flex-service-controller';
import pathwaysStationController from './controller/pathways-station-controller';

//Load environment variables
dotenv.config()

const PORT: number = environment.appPort;

new App(
    [
        healthController,
        userManagementController,
        projectGroupController,
        flexServiceController,
        pathwaysStationController
    ],
    PORT,
).listen();

