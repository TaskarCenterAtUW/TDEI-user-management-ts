import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { OrganizationDto } from "../model/dto/organization-dto";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { PocRequestDto } from "../model/dto/poc-req";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { ServiceDto } from "../model/dto/service-dto";
import { StationDto } from "../model/dto/station-dto";
import { Ok } from "../model/http/http-responses";
import userManagementService from "../service/user-management-service";
import { IController } from "./interface/IController";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import { LoginDto } from "../model/dto/login-dto";

class UserManagementController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(RegisterUserDto), this.registerUser);
        this.router.post(`${this.path}/station`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), validationMiddleware(StationDto), this.createStation);
        this.router.post(`${this.path}/service`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), validationMiddleware(ServiceDto), this.createStation);
        this.router.post(`${this.path}/organization`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(OrganizationDto), this.createOrganization);
        this.router.post(`${this.path}/permission`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), validationMiddleware(RolesReqDto), this.assignPermissions);
        this.router.post(`${this.path}/poc`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(PocRequestDto), this.assignPOC);
        this.router.get(`${this.path}/roles`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), this.getRoles);
        this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.login);
    }

    public login = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let loginBody = new LoginDto(request.body);
            //Call service to register the user
            userManagementService.login(loginBody).then((roles) => {
                Ok(response, { data: roles });
            }).catch((error: any) => {
                console.error('Error authenticating the user');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public getRoles = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            //Call service to register the user
            userManagementService.getRoles().then((roles) => {
                Ok(response, { data: roles });
            }).catch((error: any) => {
                console.error('Error fetching the roles');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public registerUser = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let registerUserBody = new RegisterUserDto(request.body);
            //Call service to register the user
            userManagementService.registerUser(registerUserBody).catch((error: any) => {
                console.error('Error registering the user');
                console.log(error);
                next(error);
            }).then((user) => {
                Ok(response, { data: user });
            });
        } catch (error) {
            next(error);
        }
    }

    public createStation = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let station = new StationDto(request.body);
            //Call service to register the user
            userManagementService.createStation(station).then((user) => {
                Ok(response, { data: user });
            }).catch((error: any) => {
                console.error('Error creating the station');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public createService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let service = new ServiceDto(request.body);
            //Call service to register the user
            userManagementService.createService(service)
                .then((service) => {
                    Ok(response, { data: service });
                }).catch((error: any) => {
                    console.error('Error creating the service');
                    console.error(error);
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }

    public createOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Model validation happens at the middleware.
            //Transform the body to DTO
            let organization = new OrganizationDto(request.body);
            //Call service to register the user
            userManagementService.createOrganization(organization).then((user) => {
                Ok(response, { data: user });
            }).catch((error: any) => {
                console.error('Error creating the organization');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public assignPOC = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let pocReqObj = new PocRequestDto(request.body);
            //Call service to register the user
            userManagementService.assignPocToOrg(pocReqObj).catch((error: any) => {
                console.error('Error assigning the POC to the Org');
                console.error(error);
                next(error);
            }).then((user) => {
                Ok(response, { data: user });
            });
        } catch (error) {
            next(error);
        }
    }

    public assignPermissions = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let permissonObj = new RolesReqDto(request.body);
            //Call service to register the user
            userManagementService.assignUserPermission(permissonObj).catch((error: any) => {
                console.error('Error assigning the permission to the user');
                console.error(error);
                next(error);
            }).then((flag) => {
                Ok(response, { data: "Successful!" });
            });
        } catch (error) {
            next(error);
        }
    }
}

const userManagementController = new UserManagementController();
export default userManagementController;


