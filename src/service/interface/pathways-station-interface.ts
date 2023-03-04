import { StationDto } from "../../model/dto/station-dto";
import { StationUpdateDto } from "../../model/dto/station-update-dto";
import { StationQueryParams } from "../../model/params/station-get-query-params";

export interface IPathwaysStationService {
    createStation(station: StationDto): Promise<String>;
    updateStation(station: StationUpdateDto): Promise<boolean>;
    getStation(params: StationQueryParams): Promise<StationDto[]>;
    setStationStatus(stationId: string, status: boolean): Promise<boolean>;
}