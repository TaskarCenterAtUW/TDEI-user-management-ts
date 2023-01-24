import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { ServiceDto } from "../model/dto/service-dto";
import { DuplicateException, ForeignKeyException } from "../exceptions/http/http-exceptions";
import { Polygon } from "../model/polygon-model";
import { IFlexService } from "./interface/flex-service-interface";
import { DynamicQueryObject, SqlORder } from "../database/query-object";
import { QueryConfig } from "pg";

class FlexService implements IFlexService {

    async setServiceStatus(serviceId: string, status: boolean): Promise<boolean> {
        const query = {
            text: `UPDATE service set is_active = $1 WHERE service_id = $2`,
            values: [status, serviceId],
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                throw e;
            });
    }

    async createService(service: ServiceDto): Promise<String> {
        let polygonExists = service.coordinates ? true : false;
        const query = {
            text: `INSERT INTO service(name, owner_org ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2 ${polygonExists ? ', ST_GeomFromGeoJSON($3) ' : ''})  RETURNING service.service_id`,
            values: [service.name, service.org_id],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(service.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
            .then(res => {
                return res.rows[0].service_id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(service.name);
                }
                else if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                throw e;
            });
    }

    async updateService(service: ServiceDto): Promise<boolean> {
        let polygonExists = service.coordinates ? true : false;
        const query = {
            text: `UPDATE service set name = $1 ${polygonExists ? ', polygon = $3 ' : ''} WHERE service_id = $2`,
            values: [service.name, service.service_id],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(service.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(service.name);
                }
                throw e;
            });
    }

    async getService(serviceId: string, searchText: string, page_no: number, page_size: number): Promise<ServiceDto[]> {
        let serviceList: ServiceDto[] = [];
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("service", ["service_id", "name", "owner_org", "ST_AsGeoJSON(polygon) as polygon"]);
        queryObject.buildPagination(page_no, page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        //Add conditions
        if (searchText != undefined && searchText.length != 0) {
            queryObject.condition(` name LIKE $${queryObject.paramCouter++} `, searchText + '%');
        }
        if (serviceId != undefined && serviceId.length != 0) {
            queryObject.condition(` service_id = $${queryObject.paramCouter++} `, serviceId);
        }
        queryObject.condition(` is_active = $${queryObject.paramCouter++} `, true);

        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let service: ServiceDto = new ServiceDto();
                    service.name = x.name;
                    service.org_id = x.owner_org;
                    service.service_id = x.service_id;
                    service.coordinates = x.polygon != null ? (new Polygon(JSON.parse(x.polygon))).getCoordinatePoints() : [];
                    serviceList.push(service);
                });
                return serviceList;
            })
            .catch(e => {
                throw e;
            });

    }
}

const flexService: IFlexService = new FlexService();
export default flexService;