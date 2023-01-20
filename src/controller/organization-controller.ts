import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { OrganizationDto } from "../model/dto/organization-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import organizationService from "../service/organization-service";

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
        this.router.delete(`${this.path}/api/v1/organization/:orgId/active/:status`, authorizationMiddleware([Role.TDEI_ADMIN]), this.deleteService);
    }

    public deleteService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let orgId = request.params.orgId;
            let status = JSON.parse(request.params.status);

            organizationService.setOrganizationStatus(orgId, status)
                .then((success) => {
                    Ok(response);
                }).catch((error: any) => {
                    console.error('Error updating the organization.');
                    console.error(error);
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }

    public getOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let searchText = request.query.searchText?.toString() ?? "";
            let orgId = request.query.org_id?.toString() ?? "";
            let page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            let page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            organizationService.getOrganizations(orgId, searchText, page_no, page_size).then((result) => {
                response.send(result);
            }).catch((error: any) => {
                console.error('Error fetching the organizations');
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
            organizationService.createOrganization(organization).then((org) => {
                Ok(response, { data: org });
            }).catch((error: any) => {
                console.error('Error creating the organization');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public updateOrganization = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Model validation happens at the middleware.
            //Transform the body to DTO
            let organization = new OrganizationDto(request.body);

            //Check for Organization Id for update
            if (!organization.org_id || organization.org_id == "0")
                BadRequest(response, "Organization Id not provided.")
            organizationService.updateOrganization(organization).then((org) => {
                Ok(response);
            }).catch((error: any) => {
                console.error('Error updating the organization');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }
}

const organizationController = new OrganizationController();
export default organizationController;


