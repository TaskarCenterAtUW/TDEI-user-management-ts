import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import userManagementServiceInstance from "../service/user-management-service";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import { LoginDto } from "../model/dto/login-dto";
import HttpException from "../exceptions/http/http-base-exception";
import { Utility } from "../utility/utility";
import jwt_decode from 'jwt-decode';
import { ResetCredentialsDto } from "../model/dto/reset-credentials-dto";

class UserManagementController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/register`, validationMiddleware(RegisterUserDto), this.registerUser);
        this.router.post(`${this.path}/api/v1/permission`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(RolesReqDto), this.updatePermissions);
        this.router.put(`${this.path}/api/v1/permission/revoke`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(RolesReqDto), this.revokePermissions);
        this.router.get(`${this.path}/api/v1/roles`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN]), this.getRoles);
        this.router.get(`${this.path}/api/v1/project-group-roles/:userId`, authorizationMiddleware([], false, true), this.projectGroupRoles);
        this.router.post(`${this.path}/api/v1/authenticate`, validationMiddleware(LoginDto), this.login);
        this.router.post(`${this.path}/api/v1/refresh-token`, this.refreshToken);
        this.router.get(`${this.path}/api/v1/user-profile`, authorizationMiddleware([]), this.getUserProfile);
        this.router.post(`${this.path}/api/v1/reset-credentials`, authorizationMiddleware([]), this.resetCredentials);
        this.router.get(`${this.path}/api/v1/system-metrics`, authorizationMiddleware([]), this.getSystemMetrics);
    }

    public getSystemMetrics = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            return userManagementServiceInstance.getSystemMetrics().then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the system metrics";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the system metrics";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public resetCredentials = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let reqBody = ResetCredentialsDto.from(request.body);
            let authToken = Utility.extractToken(request);
            var decoded: any = authToken != null ? jwt_decode(authToken) : undefined;
            var isTdeiAdmin = false;

            //Check if the user is TDEI Admin, "tdei-admin" is defined in Keycloak roles
            if (decoded && decoded.realm_access.roles.includes("tdei-admin")) isTdeiAdmin = true;

            //Check if the user is trying to reset the credentials of another user
            if (!isTdeiAdmin && decoded && reqBody && decoded.preferred_username != reqBody.username) throw new HttpException(403, "Not authorized to reset the credentials");


            let result = await userManagementServiceInstance.resetCredentials(reqBody);

            return Ok(response, result);
        }
        catch (error) {
            let errorMessage = "Error resetting the user credentials";
            Utility.handleError(response, next, error, errorMessage);
        }

    }

    public refreshToken = async (request: Request, response: express.Response, next: NextFunction) => {
        if (request.headers.refresh_token == undefined || request.headers.refresh_token == "")
            BadRequest(response);

        let token = request.headers.refresh_token?.toString();

        return userManagementServiceInstance.refreshToken(token ?? "").then((token) => {
            Ok(response, token)
        }).catch((error: Error) => {
            let errorMessage = "Error refreshing the user token";
            Utility.handleError(response, next, error, errorMessage);
        });
    }

    public getUserProfile = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let user_name = request.query.user_name;
            if (user_name == undefined || user_name == null) throw new HttpException(400, "user_name query param missing");

            return userManagementServiceInstance.getUserProfile(user_name as string).then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the user profile";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the user profile";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public projectGroupRoles = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let authToken = Utility.extractToken(request);
            var decoded: any = authToken != null ? jwt_decode(authToken) : undefined;

            let userId = request.params.userId;
            if (userId == undefined || userId == null) throw new HttpException(400, "UserId missing");

            if (decoded && decoded.sub != userId) throw new HttpException(403, "Not authorized.");
            let page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            let page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            return userManagementServiceInstance.getUserProjectGroupsWithRoles(userId.toString(), page_no, page_size).then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the user project group & roles";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the user project group & roles";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public login = async (request: Request, response: express.Response, next: NextFunction) => {
        let loginBody = LoginDto.from(request.body);
        return userManagementServiceInstance.login(loginBody).then((token) => {
            Ok(response, token)
        }).catch((error: any) => {
            let errorMessage = "Error authenticating the user";
            Utility.handleError(response, next, error, errorMessage);
        });
    }

    public getRoles = async (request: Request, response: express.Response, next: NextFunction) => {
        return userManagementServiceInstance.getRoles().then((roles) => {
            Ok(response, { data: roles });
        }).catch((error: any) => {
            let errorMessage = "Error fetching the roles";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public registerUser = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let registerUserBody = new RegisterUserDto(request.body);
        //Call service to register the user
        return userManagementServiceInstance.registerUser(registerUserBody).catch((error: any) => {
            let errorMessage = "Error registering the user";
            Utility.handleError(response, next, error, errorMessage);
        }).then((user) => {
            Ok(response, { data: user });
        });

    }

    public updatePermissions = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let permissonObj = new RolesReqDto(request.body);
        return userManagementServiceInstance.updatePermissions(permissonObj, request.userId)
            .catch((error: any) => {
                let errorMessage = "Error assigning the permissions to the user";
                Utility.handleError(response, next, error, errorMessage);
            }).then((flag) => {
                Ok(response, { data: "Successful!" });
            });

    }

    public revokePermissions = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let permissonObj = new RolesReqDto(request.body);
        return userManagementServiceInstance.revokeUserPermissions(permissonObj, request.userId).catch((error: any) => {
            let errorMessage = 'Error revoking the permissions of the user';
            Utility.handleError(response, next, error, errorMessage);
        }).then((flag) => {
            Ok(response, { data: "Successful!" });
        });

    }
}

const userManagementController = new UserManagementController();
export default userManagementController;


