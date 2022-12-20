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
import { RoleId } from "../constants/role-id-constants";
import format from "pg-format";
import fetch, { Response } from 'node-fetch';
import { UserProfile } from "../model/dto/user-profile-dto";
import config from 'config';
import HttpException from "../exceptions/http/http-base-exception";

const registerUrl: string = config.get('url.register-user');
const userProfileUrl: string = config.get('url.user-profile');

class UserManagementService implements IUserManagement {

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

    async createStation(station: StationDto): Promise<StationDto> {

        const query = {
            text: 'INSERT INTO station(org_id, stop_name, stop_code, stop_lat, stop_lon) VALUES($1, $2, $3, $4, $5)',
            values: [station.org_id, station.stop_name, station.stop_code, station.stop_lat, station.stop_lon],
        }
        return await dbClient.query(query)
            .then(res => {
                return new StationDto(res.rows[0]);
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(station.stop_name);
                }
                else if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                throw e;
            });
    }

    async createService(service: ServiceDto): Promise<ServiceDto> {
        const query = {
            text: 'INSERT INTO service(name, description, org_id) VALUES($1, $2, $3)',
            values: [service.name, service.description, service.org_id],
        }
        return await dbClient.query(query)
            .then(res => {
                return new ServiceDto(res.rows[0]);
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

    async createOrganization(organization: OrganizationDto): Promise<OrganizationDto> {
        const query = {
            text: 'INSERT INTO organization(name, phone, url, address) VALUES($1, $2, $3, $4)',
            values: [organization.name, organization.phone, organization.url, organization.address],
        }
        return await dbClient.query(query)
            .then(res => {
                return new OrganizationDto(res.rows[0]);
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(organization.name);
                }
                throw e;
            });
    }

    async assignPocToOrg(pocReq: PocRequestDto): Promise<boolean> {
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

        //Get the user_id from user_entity table
        let userId = userProfile.id;
        const query = {
            text: 'INSERT INTO public.user_roles(user_id, role_id, org_id)	VALUES ($1, $2, $3)',
            values: [userId, RoleId.POC, pocReq.org_id],
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

    async assignUserPermission(rolesReq: RolesReqDto): Promise<boolean> {
        let userProfile = new UserProfile();
        try {
            const data: any = await (await fetch(`${userProfileUrl}?userName=${rolesReq.user_name}`)).json();
            if (data.status != undefined && data.status == 404)
                throw new Error();
            else userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            throw new UserNotFoundException(rolesReq.user_name);
        }

        //Get the user_id from user_entity table
        let userId = userProfile.id;
        let valueArr = rolesReq.roles.map(role => {
            return [userId, rolesReq.org_id, role];
        });
        let queryStr = format('INSERT INTO user_roles (user_id, org_id, role_id) VALUES %L', valueArr);
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

}

const userManagementService = new UserManagementService();
export default userManagementService;