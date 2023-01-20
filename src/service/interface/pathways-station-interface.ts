import { StationDto } from "../../model/dto/station-dto";

export interface IPathwaysStationService {
    createStation(station: StationDto): Promise<String>;
    updateStation(station: StationDto): Promise<boolean>;
    getStation(stationId: string, searchText: string, page_no: number, page_size: number): Promise<StationDto[]>;
    setStationStatus(stationId: string, status: boolean): Promise<boolean>;
}