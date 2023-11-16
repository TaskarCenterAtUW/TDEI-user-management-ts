import express, { NextFunction, Request } from "express";
import validationMiddleware from "../middleware/dto-validation-middleware";
import { StationDto } from "../model/dto/station-dto";
import { BadRequest, Ok } from "../model/http/http-responses";
import { IController } from "./interface/controller-interface";
import authorizationMiddleware from "../middleware/authorization-middleware";
import { Role } from "../constants/role-constants";
import pathwaysStationService from "../service/pathways-station-service";
import { StationQueryParams } from "../model/params/station-get-query-params";
import { StationUpdateDto } from "../model/dto/station-update-dto";
import { Utility } from "../utility/utility";

class PathwaysStationController implements IController {
    public path = '';
    public router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.post(`${this.path}/api/v1/station`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(StationDto), this.createStation);
        this.router.put(`${this.path}/api/v1/station/:projectGroupId`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), validationMiddleware(StationUpdateDto), this.updateStation);
        this.router.get(`${this.path}/api/v1/station`, authorizationMiddleware([], true, true), this.getStation);
        this.router.delete(`${this.path}/api/v1/station/:projectGroupId/:stationId/active/:status`, authorizationMiddleware([Role.POC, Role.TDEI_ADMIN], true), this.deleteStation);
    }

    public deleteStation = async (request: Request, response: express.Response, next: NextFunction) => {
        let stationId = request.params.stationId;
        let status = JSON.parse(request.params.status);

        return pathwaysStationService.setStationStatus(stationId, status)
            .then((success) => {
                Ok(response, success);
            }).catch((error: any) => {
                let errorMessage = "Error updating the station.";
                Utility.handleError(response, next, error, errorMessage);
            });

    }

    public createStation = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let station = StationDto.from(request.body);
        return pathwaysStationService.createStation(station).then((stationId) => {
            Ok(response, { data: stationId });
        }).catch((error: any) => {
            let errorMessage = "Error creating the station";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public updateStation = async (request: Request, response: express.Response, next: NextFunction) => {
        //Transform the body to DTO
        let station = StationUpdateDto.from(request.body);
        //Verify input
        let verifyResult = station.verifyInput();
        if (!verifyResult.valid)
            return BadRequest(response, verifyResult.message);

        return pathwaysStationService.updateStation(station).then((result) => {
            Ok(response, true);
        }).catch((error: any) => {
            let errorMessage = "Error updating the station";
            Utility.handleError(response, next, error, errorMessage);
        });

    }

    public getStation = async (request: Request, response: express.Response, next: NextFunction) => {

        var params = StationQueryParams.from(request.query);

        params.page_no = Number.parseInt(request.query.page_no?.toString() ?? "1");
        params.page_size = Number.parseInt(request.query.page_size?.toString() ?? "10");

        return pathwaysStationService.getStation(params).then((result) => {
            Ok(response, result);
        }).catch((error: any) => {
            let errorMessage = "Error fetching the gtfs pathways stations";
            Utility.handleError(response, next, error, errorMessage);
        });

    }
}

const pathwaysStationController = new PathwaysStationController();
export default pathwaysStationController;


