import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { StationDto } from "../model/dto/station-dto";
import { DuplicateException, ForeignKeyException, NoDataUpdatedException } from "../exceptions/http/http-exceptions";
import { IPathwaysStationService } from "./interface/pathways-station-interface";
import { QueryConfig } from "pg";
import { StationQueryParams } from "../model/params/station-get-query-params";
import { StationUpdateDto } from "../model/dto/station-update-dto";
import { Geometry, Feature } from "geojson";

class PathwaysStationService implements IPathwaysStationService {

    async setStationStatus(stationId: string, status: boolean): Promise<boolean> {
        const query = {
            text: `UPDATE station set is_active = $1 WHERE station_id = $2`,
            values: [status, stationId],
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                throw e;
            });
    }

    async createStation(station: StationDto): Promise<String> {

        return await dbClient.query(station.getInsertQuery())
            .then(res => {
                return res.rows[0].station_id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(station.station_name);
                }
                else if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                throw e;
            });
    }

    async updateStation(station: StationUpdateDto): Promise<boolean> {

        return await dbClient.query(station.getUpdateQuery())
            .then(res => {
                if (res.rowCount == 0)
                    throw new NoDataUpdatedException();
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(station.station_name);
                }
                throw e;
            });
    }

    async getStation(params: StationQueryParams): Promise<StationDto[]> {

        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        let list: StationDto[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let station = StationDto.from(x);
                    station.station_name = x.name;
                    station.tdei_station_id = x.station_id;
                    station.tdei_org_id = x.owner_org;
                    if (station.polygon) {
                        var polygon = JSON.parse(x.polygon) as Geometry;
                        station.polygon = {
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    geometry: polygon,
                                    properties: {}
                                } as Feature
                            ]
                        }
                    }
                    list.push(station);
                });
                return list;
            })
            .catch(e => {
                throw e;
            });

    }
}

const pathwaysStationService: IPathwaysStationService = new PathwaysStationService();
export default pathwaysStationService;