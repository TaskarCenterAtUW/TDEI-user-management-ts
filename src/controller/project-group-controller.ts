import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { ProjectGroupDto } from "../model/dto/project-group-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import projectGroupService from "../service/project-group-service";
import { ProjectGroupQueryParams } from "../model/params/project-group-get-query-params";
import { ProjectGroupUserQueryParams } from "../model/params/project-group-user-query-params";
import { Utility } from "../utility/utility";
import queryValidationMiddleware from "../middleware/query-params-validation-middleware";
import { listRequestValidation } from "../middleware/list-request-validation-middleware";

class ProjectGroupController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.put(`${this.path}/api/v1/project-group`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(ProjectGroupDto), this.updateProjectGroup);
        this.router.post(`${this.path}/api/v1/project-group`, authorizationMiddleware([Role.TDEI_ADMIN]), validationMiddleware(ProjectGroupDto), this.createProjectGroup);
        this.router.get(`${this.path}/api/v1/project-group`, listRequestValidation, authorizationMiddleware([]), queryValidationMiddleware(ProjectGroupQueryParams), this.getProjectGroup);
        this.router.get(`${this.path}/api/v1/project-group/:projectGroupId/users`, authorizationMiddleware([Role.TDEI_ADMIN, Role.POC], true), this.getProjectGroupUsers);
        this.router.put(`${this.path}/api/v1/project-group/:projectGroupId/active/:status`, authorizationMiddleware([Role.TDEI_ADMIN]), this.deleteProjectGroup);
    }

    public deleteProjectGroup = async (request: Request, response: express.Response, next: NextFunction) => {
        let projectGroupId = request.params.projectGroupId;
        let status = JSON.parse(request.params.status);

        return projectGroupService.setProjectGroupStatus(projectGroupId, status)
            .then((success) => {
                Ok(response, success);
            }).catch((error: any) => {
                let errorMessage = "Error updating the project group.";
                Utility.handleError(response, next, error, errorMessage);
            });
    }

    public getProjectGroupUsers = async (request: Request, response: express.Response, next: NextFunction) => {
        var params = ProjectGroupUserQueryParams.from(request.query);
        params.tdei_project_group_id = request.params.projectGroupId;

        params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
        params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

        return projectGroupService.getProjectGroupUsers(params).then((result) => {
            Ok(response, result);
        }).catch((error: any) => {
            let errorMessage = "Error fetching the project group users.";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public getProjectGroup = async (request: Request, response: express.Response, next: NextFunction) => {
        var params = ProjectGroupQueryParams.from(request.query);

        params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
        params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

        return projectGroupService.getProjectGroups(params).then((result) => {
            Ok(response, result);
        }).catch((error: any) => {
            let errorMessage = "Error fetching the project groups";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public createProjectGroup = async (request: Request, response: express.Response, next: NextFunction) => {
        //Model validation happens at the middleware.
        //Transform the body to DTO
        let projectGroup = ProjectGroupDto.from(request.body);
        return projectGroupService.createProjectGroup(projectGroup).then((pgrp) => {
            Ok(response, { data: pgrp });
        }).catch((error: any) => {
            let errorMessage = "Error creating the project group";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public updateProjectGroup = async (request: Request, response: express.Response, next: NextFunction) => {
        //Model validation happens at the middleware.
        //Transform the body to DTO
        let projectGroup = ProjectGroupDto.from(request.body);

        //Check for ProjectGroup Id for update
        if (!projectGroup.tdei_project_group_id || projectGroup.tdei_project_group_id == "0")
            BadRequest(response, "tdei_project_group_id not provided.")

        return projectGroupService.updateProjectGroup(projectGroup).then((pgrp) => {
            Ok(response, true);
        }).catch((error: any) => {
            let errorMessage = "Error updating the project group";
            Utility.handleError(response, next, error, errorMessage);
        });

    }
}

const projectGroupController = new ProjectGroupController();
export default projectGroupController;


