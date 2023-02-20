import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { ServiceDto } from "../model/dto/service-dto";
import { DuplicateException, ForeignKeyException } from "../exceptions/http/http-exceptions";
import { Polygon, PolygonDto } from "../model/polygon-model";
import { IFlexService } from "./interface/flex-service-interface";
import { DynamicQueryObject, SqlORder } from "../database/query-object";
import { QueryConfig } from "pg";
import { ServiceQueryParams } from "../model/params/service-get-query-params";

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

        return await dbClient.query(service.getInsertQuery())
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

        return await dbClient.query(service.getUpdateQuery())
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

    async getService(params: ServiceQueryParams): Promise<ServiceDto[]> {
        let queryObject = params.getQueryObject();

        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        let list: ServiceDto[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let service = ServiceDto.from(x);
                    if (service.polygon)
                        service.polygon = new PolygonDto({ coordinates: JSON.parse(x.polygon).coordinates });
                    list.push(service);
                });
                return list;
            })
            .catch(e => {
                throw e;
            });

    }
}

const flexService: IFlexService = new FlexService();
export default flexService;