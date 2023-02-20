import { StationDto } from "../../model/dto/station-dto";
import { StationQueryParams } from "../../model/params/station-get-query-params";

export interface IPathwaysStationService {
    createStation(station: StationDto): Promise<String>;
    updateStation(station: StationDto): Promise<boolean>;
    getStation(params: StationQueryParams): Promise<StationDto[]>;
    setStationStatus(stationId: string, status: boolean): Promise<boolean>;
}