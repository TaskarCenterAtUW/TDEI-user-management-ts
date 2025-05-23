import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { ServiceDto } from "../model/dto/service-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import flexService from "../service/flex-service";
import { ServiceQueryParams } from "../model/params/service-get-query-params";
import { ServiceUpdateDto } from "../model/dto/service-update-dto";
import { Utility } from "../utility/utility";
import { ValidationError, validate } from "class-validator";
import queryValidationMiddleware from "../middleware/query-params-validation-middleware";
import { listRequestValidation } from "../middleware/list-request-validation-middleware";

class FlexServiceController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/service`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceDto), this.createService);
        this.router.put(`${this.path}/api/v1/service/:projectGroupId`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceUpdateDto), this.updateService);
        this.router.get(`${this.path}/api/v1/service`, listRequestValidation, authorizationMiddleware([], true, true), queryValidationMiddleware(ServiceQueryParams), this.getService);
        this.router.put(`${this.path}/api/v1/service/:projectGroupId/:serviceId/active/:status`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), this.deleteService);
    }

    public deleteService = async (request: Request, response: express.Response, next: NextFunction) => {
        let serviceId = request.params.serviceId;
        let status = JSON.parse(request.params.status);

        return flexService.setServiceStatus(serviceId, status)
            .then((success) => {
                Ok(response, success);
            }).catch((error: any) => {
                let errorMessage = "Error deleting the service.";
                Utility.handleError(response, next, error, errorMessage);
            });

    }

    public createService = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let service = ServiceDto.from(request.body);

        let errors = await validate(service);
        if (errors.length > 0) {
            console.log('Input validation failed');
            let message = errors.map((error: ValidationError) => Object.values(<any>error.constraints)).join(', ');
            return BadRequest(response, `Required fields are missing or invalid: ${message}`);
        }

        return flexService.createService(service)
            .then((service) => {
                Ok(response, { data: service });
            }).catch((error: any) => {
                let errorMessage = "Error creating the service.";
                Utility.handleError(response, next, error, errorMessage);
            });

    }

    public updateService = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let station = ServiceUpdateDto.from(request.body);
        //Verify input
        let verifyResult = station.verifyInput();
        if (!verifyResult.valid)
            return BadRequest(response, verifyResult.message);

        return flexService.updateService(station).then((result) => {
            Ok(response, true);
        }).catch((error: any) => {
            let errorMessage = "Error updating the service.";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public getService = async (request: Request, response: express.Response, next: NextFunction) => {

        var params = ServiceQueryParams.from(request.query);

        params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
        params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

        return flexService.getService(params).then((result) => {
            Ok(response, result);
        }).catch((error: any) => {
            let errorMessage = "Error fetching the gtfs flex service.";
            Utility.handleError(response, next, error, errorMessage);
        });

    }
}

const flexServiceController = new FlexServiceController();
export default flexServiceController;


