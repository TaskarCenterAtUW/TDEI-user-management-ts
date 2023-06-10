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

class FlexServiceController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/service`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceDto), this.createService);
        this.router.put(`${this.path}/api/v1/service/:orgId`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceUpdateDto), this.updateService);
        this.router.get(`${this.path}/api/v1/service`, authorizationMiddleware([], true, true), this.getService);
        this.router.delete(`${this.path}/api/v1/service/:orgId/:serviceId/active/:status`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), this.deleteService);
    }

    public deleteService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let serviceId = request.params.serviceId;
            let status = JSON.parse(request.params.status);

            return flexService.setServiceStatus(serviceId, status)
                .then((success) => {
                    Ok(response);
                }).catch((error: any) => {
                    let errorMessage = "Error deleting the service.";
                    Utility.handleError(response, next, error, errorMessage);
                });
        } catch (error) {
            let errorMessage = "Error deleting the service.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public createService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let service = ServiceDto.from(request.body);
            return flexService.createService(service)
                .then((service) => {
                    Ok(response, { data: service });
                }).catch((error: any) => {
                    let errorMessage = "Error creating the service.";
                    Utility.handleError(response, next, error, errorMessage);
                });
        } catch (error) {
            let errorMessage = "Error creating the service.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public updateService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
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
        } catch (error) {
            let errorMessage = "Error updating the service.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }

    public getService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            var params = ServiceQueryParams.from(request.query);

            params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            return flexService.getService(params).then((result) => {
                Ok(response, result);
            }).catch((error: any) => {
                let errorMessage = "Error fetching the gtfs flex service.";
                Utility.handleError(response, next, error, errorMessage);
            });
        } catch (error) {
            let errorMessage = "Error fetching the gtfs flex service.";
            Utility.handleError(response, next, error, errorMessage);
        }
    }
}

const flexServiceController = new FlexServiceController();
export default flexServiceController;


