import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { PocRequestDto } from "../model/dto/poc-req";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import userManagementService from "../service/user-management-service";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import { LoginDto } from "../model/dto/login-dto";
import HttpException from "../exceptions/http/http-base-exception";
import { Utility } from "../utility/utility";
import jwt_decode from 'jwt-decode';

class UserManagementController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/register`, validationMiddleware(RegisterUserDto), this.registerUser);
        this.router.post(`${this.path}/api/v1/permission`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(RolesReqDto), this.assignPermissions);
        this.router.put(`${this.path}/api/v1/permission/revoke`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(RolesReqDto), this.revokePermissions);
        this.router.post(`${this.path}/api/v1/poc`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(PocRequestDto), this.assignPOC);
        this.router.get(`${this.path}/api/v1/roles`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), this.getRoles);
        this.router.get(`${this.path}/api/v1/org-roles/:userId`, authorizationMiddleware([]), this.orgRoles);
        this.router.post(`${this.path}/api/v1/authenticate`, validationMiddleware(LoginDto), this.login);
        this.router.post(`${this.path}/api/v1/refresh-token`, this.refreshToken);
    }

    public refreshToken = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            if (request.headers.refresh_token == undefined || request.headers.refresh_token == "")
                BadRequest(response);

            let token = request.headers.refresh_token?.toString();

            userManagementService.refreshToken(token ?? "").then((token) => {
                response.send(token)
            }).catch((error: Error) => {
                console.error(error.message);
                next(error);
            });
        } catch (error) {
            console.error('Error refreshing the user token');
            next(error);
        }
    }

    public orgRoles = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let authToken = Utility.extractToken(request);
            var decoded: any = jwt_decode(authToken);

            let userId = request.params.userId;

            if (decoded.sub != userId) throw new HttpException(403, "Not authorized.");
            let page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            let page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");
            if (userId == undefined || userId == null) throw new HttpException(400, "UserId missing");

            userManagementService.getUserOrgsWithRoles(userId.toString(), page_no, page_size).then((result) => {
                response.send(result);
            }).catch((error: any) => {
                console.error('Error fetching the user org & roles');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public login = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let loginBody = new LoginDto(request.body);
            userManagementService.login(loginBody).then((token) => {
                response.send(token)
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
            userManagementService.assignUserPermissions(permissonObj, request.userId).catch((error: any) => {
                console.error('Error assigning the permissions to the user');
                console.error(error);
                next(error);
            }).then((flag) => {
                Ok(response, { data: "Successful!" });
            });
        } catch (error) {
            next(error);
        }
    }

    public revokePermissions = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let permissonObj = new RolesReqDto(request.body);
            userManagementService.revokeUserPermissions(permissonObj, request.userId).catch((error: any) => {
                console.error('Error revoking the permissions of the user');
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


