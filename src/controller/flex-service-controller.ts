import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { ServiceDto } from "../model/dto/service-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import flexService from "../service/flex-service";

class FlexServiceController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/service`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceDto), this.createService);
        this.router.put(`${this.path}/api/v1/service`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(ServiceDto), this.updateService);
        this.router.get(`${this.path}/api/v1/service`, authorizationMiddleware([], true), this.getService);
        this.router.delete(`${this.path}/api/v1/service/:serviceId/active/:status`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), this.deleteService);
    }

    public deleteService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let serviceId = request.params.serviceId;
            let status = JSON.parse(request.params.status);

            flexService.setServiceStatus(serviceId, status)
                .then((success) => {
                    Ok(response);
                }).catch((error: any) => {
                    console.error('Error updating the service.');
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
            flexService.createService(service)
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

    public updateService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let station = new ServiceDto(request.body);
            //Check for station Id for update
            if (!station.service_id || station.service_id == "0")
                BadRequest(response, "Service Id not provided.")
            //Call service to register the user
            flexService.updateService(station).then((result) => {
                Ok(response);
            }).catch((error: any) => {
                console.error('Error updating the flex service');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public getService = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let searchText = request.query.searchText?.toString() ?? "";
            let serviceId = request.query.service_id?.toString() ?? "";
            let page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            let page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            flexService.getService(serviceId, searchText, page_no, page_size).then((result) => {
                response.send(result);
            }).catch((error: any) => {
                console.error('Error fetching the gtfs flex service');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }
}

const flexServiceController = new FlexServiceController();
export default flexServiceController;


