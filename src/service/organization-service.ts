import dbClient from "../database/data-source";
import UniqueKeyDbException from "../exceptions/db/database-exceptions";
import { OrganizationDto } from "../model/dto/organization-dto";
import { DuplicateException } from "../exceptions/http/http-exceptions";
import { QueryConfig } from "pg";
import { IOrganizationService } from "./interface/organization-interface";
import { OrgQueryParams } from "../model/params/organization-get-query-params";
import { OrgUserQueryParams } from "../model/params/organization-user-query-params";
import { OrgUserDto } from "../model/dto/org-user-dto";
import { OrganizationListResponse, PocDetails } from "../model/dto/poc-details-dto";
import { Geometry, Feature } from "geojson";


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
                    throw new DuplicateException(organization.org_name);
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
                    throw new DuplicateException(organization.org_name);
                }
                throw e;
            });
    }

    async getOrganizations(params: OrgQueryParams): Promise<OrganizationListResponse[]> {
        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }
        let list: OrganizationListResponse[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let org = OrganizationListResponse.from(x);
                    org.tdei_org_id = x.org_id;
                    org.org_name = x.name;
                    if (org.polygon) {
                        var polygon = JSON.parse(x.polygon) as Geometry;
                        org.polygon = {
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
                    org.poc = [];
                    if (x.userdetails.length > 0) {
                        x.userdetails.forEach((u: any) => {
                            org.poc.push(PocDetails.from(u));
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

    async getOrganizationUsers(params: OrgUserQueryParams): Promise<OrgUserDto[]> {
        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }
        let list: OrgUserDto[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let user = OrgUserDto.from(x);
                    if (x.attributes && x.attributes.length > 0) {
                        let phoneObj = x.attributes.find((a: any) => a.name = "phone");
                        if (phoneObj) {
                            user.phone = phoneObj.value;
                        }
                    }
                    list.push(user);
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