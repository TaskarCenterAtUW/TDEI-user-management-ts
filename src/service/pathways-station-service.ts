import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { StationDto } from "../model/dto/station-dto";
import { DuplicateException, ForeignKeyException } from "../exceptions/http/http-exceptions";
import { Polygon } from "../model/polygon-model";
import { IPathwaysStationService } from "./interface/pathways-station-interface";
import { QueryConfig } from "pg";
import { DynamicQueryObject, SqlORder } from "../database/query-object";

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
        let polygonExists = station.coordinates ? true : false;

        const query = {
            text: `INSERT INTO station(owner_org, name ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2 ${polygonExists ? ', ST_GeomFromGeoJSON($3) ' : ''})   RETURNING station.station_id`,
            values: [station.org_id, station.name],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(station.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
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
        let polygonExists = station.coordinates ? true : false;
        const query = {
            text: `UPDATE station set name = $1 ${polygonExists ? ', polygon = $3 ' : ''} WHERE station_id = $2`,
            values: [station.name, station.station_id],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(station.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
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

    async getStation(stationId: string, searchText: string, page_no: number, page_size: number): Promise<StationDto[]> {
        let stationList: StationDto[] = [];
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("station", ["station_id", "name", "owner_org", "ST_AsGeoJSON(polygon) as polygon"]);
        queryObject.buildPagination(page_no, page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        //Add conditions
        if (searchText != undefined && searchText.length != 0) {
            queryObject.condition(` name LIKE $${queryObject.paramCouter++} `, searchText + '%');
        }
        if (stationId != undefined && stationId.length != 0) {
            queryObject.condition(` station_id = $${queryObject.paramCouter++} `, stationId);
        }
        queryObject.condition(` is_active = $${queryObject.paramCouter++} `, true);

        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let station: StationDto = new StationDto();
                    station.name = x.name;
                    station.org_id = x.owner_org;
                    station.station_id = x.station_id;
                    station.coordinates = x.polygon != null ? (new Polygon(JSON.parse(x.polygon))).getCoordinatePoints() : [];
                    stationList.push(station);
                });
                return stationList;
            })
            .catch(e => {
                throw e;
            });

    }
}

const pathwaysStationService: IPathwaysStationService = new PathwaysStationService();
export default pathwaysStationService;