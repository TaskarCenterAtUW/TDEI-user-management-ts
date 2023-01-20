import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { StationDto } from "../model/dto/station-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import pathwaysStationService from "../service/pathways-station-service";

class PathwaysStationController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/station`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(StationDto), this.createStation);
        this.router.put(`${this.path}/api/v1/station`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(StationDto), this.updateStation);
        this.router.get(`${this.path}/api/v1/station`, authorizationMiddleware([], true), this.getStation);
        this.router.delete(`${this.path}/api/v1/station/:stationId/active/:status`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), this.deleteStation);
    }

    public deleteStation = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            let stationId = request.params.stationId;
            let status = JSON.parse(request.params.status);

            pathwaysStationService.setStationStatus(stationId, status)
                .then((success) => {
                    Ok(response);
                }).catch((error: any) => {
                    console.error('Error updating the station.');
                    console.error(error);
                    next(error);
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
            pathwaysStationService.createStation(station).then((user) => {
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

    public updateStation = async (request: Request, response: express.Response, next: NextFunction) => {
        try {
            //Transform the body to DTO
            let station = new StationDto(request.body);
            //Check for station Id for update
            if (!station.station_id || station.station_id == "0")
                BadRequest(response, "Station Id not provided.")
            //Call service to register the user
            pathwaysStationService.updateStation(station).then((result) => {
                Ok(response);
            }).catch((error: any) => {
                console.error('Error updating the station');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }

    public getStation = async (request: Request, response: express.Response, next: NextFunction) => {
        try {

            let searchText = request.query.searchText?.toString() ?? "";
            let stationId = request.query.station_id?.toString() ?? "";
            let page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
            let page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

            pathwaysStationService.getStation(stationId, searchText, page_no, page_size).then((result) => {
                response.send(result);
            }).catch((error: any) => {
                console.error('Error fetching the gtfs pathways stations');
                console.error(error);
                next(error);
            });
        } catch (error) {
            next(error);
        }
    }
}

const pathwaysStationController = new PathwaysStationController();
export default pathwaysStationController;


