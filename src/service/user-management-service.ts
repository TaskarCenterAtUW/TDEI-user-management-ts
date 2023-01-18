import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { OrganizationDto } from "../model/dto/organization-dto";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { PocRequestDto } from "../model/dto/poc-req";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { ServiceDto } from "../model/dto/service-dto";
import { StationDto } from "../model/dto/station-dto";
import { IUserManagement } from "./interface/user-management-interface";
import { DuplicateException, ForeignKeyException, UserNotFoundException } from "../exceptions/http/http-exceptions";
import format from "pg-format";
import fetch, { Response } from 'node-fetch';
import { UserProfile } from "../model/dto/user-profile-dto";
import config from 'config';
import HttpException from "../exceptions/http/http-base-exception";
import { RoleDto } from "../model/dto/roles-dto";
import { LoginDto } from "../model/dto/login-dto";
import { Role } from "../constants/role-constants";
import { adminRestrictedRoles } from "../constants/admin-restricted-role-constants";
import { OrgRoleDto } from "../model/dto/org-role-dto";
import { QueryConfig } from "pg";
import { DynamicQueryObject, SqlORder } from "../database/query-object";
import { Polygon } from "../model/polygon-model";

const registerUrl: string = config.get('url.register-user');
const userProfileUrl: string = config.get('url.user-profile');
const authenticateUrl: string = config.get('url.authenticate');
const refreshTokenUrl: string = config.get('url.refresh-token');

class UserManagementService implements IUserManagement {

    async refreshToken(refreshToken: string): Promise<any> {
        try {
            const result = await fetch(refreshTokenUrl, {
                method: 'post',
                body: JSON.stringify(refreshToken),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await result.json();

            if (result.status != undefined && result.status != 200)
                throw new Error(data);

            return data;
        } catch (error: any) {
            console.error(error);
            throw new Error("Invalid/Expired refresh token. Please re-authenticate.");
        }
    }

    async login(loginModel: LoginDto): Promise<any> {
        try {
            const result: Response = await fetch(authenticateUrl, {
                method: 'post',
                body: JSON.stringify(loginModel),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await result.json();

            if (result.status != undefined && result.status != 200)
                throw new Error(data);

            return data;
        } catch (error: any) {
            console.error(error);
            throw new Error("Error authenticating the user");
        }
        return {};
    }

    async registerUser(user: RegisterUserDto): Promise<UserProfile> {
        let userProfile = new UserProfile();
        try {
            const result: Response = await fetch(registerUrl, {
                method: 'post',
                body: JSON.stringify(user),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await result.json();

            if (result.status != undefined && result.status != 200)
                throw new Error(data);

            userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            throw new Error("Error registering the user");
        }
        return userProfile;
    }

    async getRoles(): Promise<RoleDto[]> {

        const query = 'SELECT name, description FROM Roles';
        return await dbClient.query(query)
            .then(res => {
                let roleList = res.rows.filter(f => !adminRestrictedRoles.includes(f.name)).map(x => {
                    return new RoleDto(x);
                });
                return roleList;
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
            query.values.push(JSON.stringify(new Polygon(station.coordinates)));
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

    async createService(service: ServiceDto): Promise<String> {
        let polygonExists = service.coordinates ? true : false;
        const query = {
            text: `INSERT INTO service(name, owner_org ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2 ${polygonExists ? ', ST_GeomFromGeoJSON($3) ' : ''})  RETURNING service.service_id`,
            values: [service.name, service.org_id],
        }
        if (polygonExists) {
            query.values.push(JSON.stringify(new Polygon(service.coordinates)));
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

    async createOrganization(organization: OrganizationDto): Promise<String> {
        let polygonExists = organization.coordinates ? true : false;
        const query = {
            text: `INSERT INTO organization(name, phone, url, address ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2, $3, $4 ${polygonExists ? ', ST_GeomFromGeoJSON($5) ' : ''}) RETURNING organization.org_id`,
            values: [organization.name, organization.phone, organization.url, organization.address],
        }
        if (polygonExists) {
            query.values.push(JSON.stringify(new Polygon(organization.coordinates)));
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

    async updateOrganization(organization: OrganizationDto): Promise<String> {
        const query = {
            text: 'UPDATE organization set name = $1, phone = $2, url = $3, address = $4 WHERE org_id = $5',
            values: [organization.name, organization.phone, organization.url, organization.address, organization.id],
        }
        return await dbClient.query(query)
            .then(res => {
                return res.rows[0].id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(organization.name);
                }
                throw e;
            });
    }

    private async getRolesByNames(roles: string[]): Promise<Map<string, string>> {
        let roleMap = new Map<string, string>();
        var sql = format('SELECT id, name FROM roles WHERE name IN (%L)', roles);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => roleMap.set(x.name, x.id));
                return roleMap;
            })
            .catch(e => {
                throw e;
            });
    }

    async assignPocToOrg(pocReq: PocRequestDto): Promise<boolean> {
        //Get the user profile details from keycloak 
        let userProfile = new UserProfile();
        try {
            const data: any = await (await fetch(`${userProfileUrl}?userName=${pocReq.poc_user_name}`)).json();
            if (data.status != undefined && data.status == 404)
                throw new Error();
            else userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            throw new UserNotFoundException(pocReq.poc_user_name);
        }

        //Get the role ids for role name provided
        let rolemap = await this.getRolesByNames([Role.POC]);

        //Check POC exists for the organization, as there can be one and only one POC for the organization
        var pocCheckSql = format('SELECT COUNT(*) FROM user_roles WHERE role_id = %L and org_id= %L', rolemap.get(Role.POC), pocReq.org_id);
        var pocExistsRes = (await dbClient.query(pocCheckSql));
        if (pocExistsRes.rows[0].count > 0)
            throw new HttpException(400, "POC already exists for the organization. Please remove exiting POC before proceeding.")

        //Get the user_id from user_entity table
        let userId = userProfile.id;
        const query = {
            text: 'INSERT INTO public.user_roles(user_id, role_id, org_id)	VALUES ($1, $2, $3)',
            values: [userId, rolemap.get(Role.POC), pocReq.org_id],
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                else if (e instanceof UniqueKeyDbException) {
                    throw new HttpException(400, "User already assigned with the specific roles");
                }
                throw e;
            });
    }

    private async getUserRoles(userId: string): Promise<string[]> {
        let roleMap: string[] = [];
        var sql = format('SELECT name FROM user_roles ur INNER JOIN roles r on r.id = ur.role_id WHERE user_id = %L', userId);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => roleMap.push(x.name));
                return roleMap;
            })
            .catch(e => {
                throw e;
            });

    }

    async getUserOrgsWithRoles(userId: string, page_no: number, page_size: number): Promise<OrgRoleDto[]> {
        let orgRoleList: OrgRoleDto[] = [];

        //Set defaults if not provided
        if (page_no == undefined) page_no = 1;
        if (page_size == undefined) page_size = 10;
        let skip = page_no == 1 ? 0 : (page_no - 1) * page_size;
        let take = page_size > 50 ? 50 : page_size;

        var sql = format('SELECT o.name as org, o.id, ARRAY_AGG(r.name) as roles FROM user_roles ur INNER JOIN roles r on r.id = ur.role_id INNER JOIN organization o on ur.org_id = o.id WHERE user_id = %L GROUP BY o.name,o.id LIMIT %L OFFSET %L', userId, take, skip);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => {
                    let orgRole: OrgRoleDto = new OrgRoleDto();
                    orgRole.orgName = x.org;
                    orgRole.orgId = x.id;
                    orgRole.roles = x.roles;

                    orgRoleList.push(orgRole);
                });
                return orgRoleList;
            })
            .catch(e => {
                throw e;
            });

    }

    async assignUserPermission(rolesReq: RolesReqDto, requestingUserId: string): Promise<boolean> {
        let userProfile = new UserProfile();
        //Fetch user profile from keycloak
        try {
            const data: any = await (await fetch(`${userProfileUrl}?userName=${rolesReq.user_name}`)).json();
            if (data.status != undefined && data.status == 404)
                throw new Error();
            else userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            throw new UserNotFoundException(rolesReq.user_name);
        }

        //Check requesting user roles
        let userRoles = await this.getUserRoles(requestingUserId);
        let isAdmin = userRoles.findIndex(x => x == Role.TDEI_ADMIN) != -1;

        if (!isAdmin) {
            //Check POC role if exists, as it is restricted to Admin only
            if (rolesReq.roles.findIndex(x => adminRestrictedRoles.indexOf(x.toLocaleLowerCase()) != -1) != -1)
                throw new HttpException(400, "Admin restricted roles cannot be assigned");
        }

        //Get the role ids for role name provided
        let rolemap = await this.getRolesByNames(rolesReq.roles);

        //Get the user_id from user_entity table
        let userId = userProfile.id;
        let valueArr = rolesReq.roles.map(role => {
            return [userId, rolesReq.org_id, rolemap.get(role)];
        });
        let queryStr = format('INSERT INTO user_roles (user_id, org_id, role_id) VALUES %L ON CONFLICT ON CONSTRAINT unq_user_role_org DO NOTHING', valueArr);
        console.log(queryStr);
        return await dbClient.query(queryStr)
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                else if (e instanceof UniqueKeyDbException) {
                    throw new HttpException(400, "User already assigned with the specific roles");
                }
                throw e;
            });
    }

    async getOrganizations(searchText: string, page_no: number, page_size: number): Promise<OrganizationDto[]> {
        let organizationList: OrganizationDto[] = [];
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("organization", ["name", "org_id", "address", "url", "phone"]);
        queryObject.buildPagination(page_no, page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        //Add conditions
        if (searchText != undefined && searchText.length != 0) {
            queryObject.condition(` name LIKE $${queryObject.paramCouter++} `, searchText + '%');
        }

        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }

        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let org: OrganizationDto = new OrganizationDto();
                    org.name = x.name;
                    org.id = x.org_id;
                    org.address = x.address;
                    org.url = x.url;
                    org.phone = x.phone;
                    organizationList.push(org);
                });
                return organizationList;
            })
            .catch(e => {
                throw e;
            });

    }
}

const userManagementService: IUserManagement = new UserManagementService();
export default userManagementService;