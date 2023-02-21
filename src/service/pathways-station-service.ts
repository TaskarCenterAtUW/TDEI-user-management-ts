import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { StationDto } from "../model/dto/station-dto";
import { DuplicateException, ForeignKeyException } from "../exceptions/http/http-exceptions";
import { PolygonDto } from "../model/polygon-model";
import { IPathwaysStationService } from "./interface/pathways-station-interface";
import { QueryConfig } from "pg";
import { StationQueryParams } from "../model/params/station-get-query-params";

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

        return await dbClient.query(station.getUpdateQuery())
            .then(res => {
                return res.rows[0].station_id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(station.name);
                }
                else if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                throw e;
            });
    }

    async updateStation(station: StationDto): Promise<boolean> {

        return await dbClient.query(station.getInsertQuery())
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(station.name);
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
                    if (station.polygon)
                        station.polygon = new PolygonDto({ coordinates: JSON.parse(x.polygon).coordinates });
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