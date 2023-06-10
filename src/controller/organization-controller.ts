import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { OrganizationDto } from "../model/dto/organization-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import organizationService from "../service/organization-service";
import { OrgQueryParams } from "../model/params/organization-get-query-params";
import { OrgUserQueryParams } from "../model/params/organization-user-query-params";
import { Utility } from "../utility/utility";

class OrganizationController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.put(`${this.path}/api/v1/organization`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(OrganizationDto), this.updateOrganization);
        this.router.post(`${this.path}/api/v1/organization`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(OrganizationDto), this.createOrganization);
        this.router.get(`${this.path}/api/v1/organization`, authorizationMiddleware([]), this.getOrganization);
        this.router.get(`${this.path}/api/v1/organization/:orgId/users`, authorizationMiddleware([]), this.getOrganizationUsers);
        this.router.delete(`${this.path}/api/v1/organization/:orgId/active/:status`, authorizationMiddleware([Role.TDEI_ADMIN]), this.deleteService);
    }

    public deleteService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let orgId = request.params.orgId;
            let status = JSON.parse(request.params.status);

            return organizationService.setOrganizationStatus(orgId, status)
                .then((success) => {
                    Ok(response, success);
                }).catch((error: any) => {
                    let errorMessage = "Error updating the organization.";
                    Utility.handleError(response, next, error, errorMessage);
                });
        } catch (error) {
            let errorMessage = "Error updating the organization.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public getOrganizationUsers = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            var params = OrgUserQueryParams.from(request.query);
            params.orgId = request.params.orgId;

            params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            return organizationService.getOrganizationUsers(params).then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the organization users.";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the organization users.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public getOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            var params = OrgQueryParams.from(request.query);

            params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            return organizationService.getOrganizations(params).then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the organizations";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the organizations";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public createOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Model validation happens at the middleware.
            //Transform the body to DTO
            let organization = OrganizationDto.from(request.body);
            return organizationService.createOrganization(organization).then((org) => {
                Ok(response, { data: org });
            }).catch((error: any) => {
                let errorMessage = "Error creating the organization";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error creating the organization";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public updateOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Model validation happens at the middleware.
            //Transform the body to DTO
            let organization = OrganizationDto.from(request.body);

            //Check for Organization Id for update
            if (!organization.tdei_org_id || organization.tdei_org_id == "0")
                BadRequest(response, "Organization Id not provided.")

            return organizationService.updateOrganization(organization).then((org) => {
                Ok(response, true);
            }).catch((error: any) => {
                let errorMessage = "Error updating the organization";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error updating the organization";
            Utility.handleError(response, next, error, errorMessage);
        }
    }
}

const organizationController = new OrganizationController();
export default organizationController;


