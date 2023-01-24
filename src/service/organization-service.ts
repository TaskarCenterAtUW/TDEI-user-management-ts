import dbClient from "../database/data-source";
import UniqueKeyDbException from "../exceptions/db/database-exceptions";
import { OrganizationDto } from "../model/dto/organization-dto";
import { DuplicateException } from "../exceptions/http/http-exceptions";
import { QueryConfig } from "pg";
import { DynamicQueryObject, SqlORder } from "../database/query-object";
import { Polygon } from "../model/polygon-model";
import { IOrganizationService } from "./interface/organization-interface";


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
        let polygonExists = organization.coordinates ? true : false;
        const query = {
            text: `INSERT INTO organization(name, phone, url, address ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2, $3, $4 ${polygonExists ? ', ST_GeomFromGeoJSON($5) ' : ''}) RETURNING organization.org_id`,
            values: [organization.name, organization.phone, organization.url, organization.address],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(organization.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
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
        let polygonExists = organization.coordinates ? true : false;
        const query = {
            text: `UPDATE organization set name = $1, phone = $2, url = $3, address = $4 ${polygonExists ? ', polygon = $6 ' : ''} WHERE org_id = $5`,
            values: [organization.name, organization.phone, organization.url, organization.address, organization.org_id],
        }
        if (polygonExists) {
            let polygon = new Polygon();
            polygon.setGeoCords(organization.coordinates);
            query.values.push(JSON.stringify(polygon));
        }
        return await dbClient.query(query)
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

    async getOrganizations(orgId: string, searchText: string, page_no: number, page_size: number): Promise<OrganizationDto[]> {
        let organizationList: OrganizationDto[] = [];
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("organization", ["name", "org_id", "address", "url", "phone", "ST_AsGeoJSON(polygon) as polygon"]);
        queryObject.buildPagination(page_no, page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        //Add conditions
        if (searchText != undefined && searchText.length != 0) {
            queryObject.condition(` name LIKE $${queryObject.paramCouter++} `, searchText + '%');
        }
        if (orgId != undefined && orgId.length != 0) {
            queryObject.condition(` org_id = $${queryObject.paramCouter++} `, orgId);
        }
        queryObject.condition(` is_active = $${queryObject.paramCouter++} `, true);

        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let org: OrganizationDto = new OrganizationDto();
                    org.name = x.name;
                    org.org_id = x.org_id;
                    org.address = x.address;
                    org.url = x.url;
                    org.phone = x.phone;
                    org.coordinates = x.polygon != null ? (new Polygon(JSON.parse(x.polygon)).getCoordinatePoints()) : [];
                    organizationList.push(org);
                });
                return organizationList;
            })
            .catch(e => {
                throw e;
            });

    }
}

const organizationService: IOrganizationService = new OrganizationService();
export default organizationService;