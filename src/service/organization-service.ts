import dbClient from "../database/data-source";
import UniqueKeyDbException from "../exceptions/db/database-exceptions";
import { OrganizationDto } from "../model/dto/organization-dto";
import { DuplicateException } from "../exceptions/http/http-exceptions";
import { QueryConfig } from "pg";
import { IOrganizationService } from "./interface/organization-interface";
import { OrgQueryParams } from "../model/params/organization-get-query-params";
import { PolygonDto } from "../model/polygon-model";
import { OrganizationPOCDto } from "../model/dto/organization-poc-dto";


class OrganizationService implements IOrganizationService {

    async setOrganizationStatus(orgId: string, status: boolean): Promise<boolean> {
        const query = {
            text: `UPDATE organization set is_active = $1 WHERE org_id = $2`,
            values: [status, orgId],
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                throw e;
            });
    }

    async createOrganization(organization: OrganizationDto): Promise<String> {

        return await dbClient.query(organization.getInsertQuery())
            .then(res => {
                return res.rows[0].org_id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(organization.name);
                }
                throw e;
            });
    }

    async updateOrganization(organization: OrganizationDto): Promise<boolean> {

        return await dbClient.query(organization.getUpdateQuery())
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(organization.name);
                }
                throw e;
            });
    }

    async getOrganizations(params: OrgQueryParams): Promise<OrganizationDto[]> {
        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }
        let list: OrganizationDto[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let org = OrganizationDto.from(x);
                    if (org.polygon)
                        org.polygon = new PolygonDto({ coordinates: JSON.parse(x.polygon).coordinates });

                    org.poc = [];
                    if (x.userdetails.length > 0) {
                        x.userdetails.forEach((u: any) => {
                            org.poc.push(OrganizationPOCDto.from(u));
                        });
                    }

                    list.push(org);
                });
                return list;
            })
            .catch(e => {
                throw e;
            });
    }
}

const organizationService: IOrganizationService = new OrganizationService();
export default organizationService;