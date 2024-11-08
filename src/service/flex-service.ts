import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { ServiceDto } from "../model/dto/service-dto";
import { DuplicateException, ForeignKeyException } from "../exceptions/http/http-exceptions";
import { IFlexService } from "./interface/flex-service-interface";
import { QueryConfig } from "pg";
import { ServiceQueryParams } from "../model/params/service-get-query-params";
import { ServiceUpdateDto } from "../model/dto/service-update-dto";
import { Feature, Geometry } from "geojson";
import projectgroupService from "./project-group-service";
import HttpException from "../exceptions/http/http-base-exception";

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
                    throw new DuplicateException(service.service_name);
                }
                else if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                throw e;
            });
    }

    async updateService(service: ServiceUpdateDto): Promise<boolean> {

        return await dbClient.query(service.getUpdateQuery())
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(service.service_name);
                }
                throw e;
            });
    }

    async getServiceById(project_group_id: string): Promise<ServiceDto> {
        const query = {
            text: "Select * from service where service_id = $1 limit 1",
            values: [project_group_id],
        }
        var result = await dbClient.query(query);
        if (result.rows.length > 0) {
            let service = ServiceDto.from(result.rows[0]);
            service.service_name = result.rows[0].name;
            service.tdei_service_id = result.rows[0].service_id;
            service.tdei_project_group_id = result.rows[0].owner_project_group;
            return service;
        }
        throw new HttpException(404, "Service not found");
    }

    async getService(params: ServiceQueryParams): Promise<ServiceDto[]> {
        if (params.tdei_service_id) {
            //check if the service exists
            await this.getServiceById(params.tdei_service_id);
        }
        if (params.tdei_project_group_id) {
            //check if the project group exists
            await projectgroupService.getProjectGroupById(params.tdei_project_group_id);
        }

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
                    service.service_name = x.name;
                    service.tdei_service_id = x.service_id;
                    service.service_type = x.service_type;
                    service.tdei_project_group_id = x.owner_project_group;
                    if (service.polygon) {
                        var polygon = JSON.parse(x.polygon) as Geometry;
                        service.polygon = {
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