import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { IUserManagement } from "./interface/user-management-interface";
import { ForeignKeyException, UserNotFoundException } from "../exceptions/http/http-exceptions";
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

const registerUrl: string = config.get('url.register-user');
const userProfileUrl: string = config.get('url.user-profile');
const authenticateUrl: string = config.get('url.authenticate');
const refreshTokenUrl: string = config.get('url.refresh-token');

class UserManagementService implements IUserManagement {
    /**
    * Reissues the new access token in the case of valid refresh token input
    * @param refreshToken refresh token
    */
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
    /**
     * Authenticates the user
     * @param loginModel User credentials
     * @returns Access token
     */
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
    /**
     * Creates new user in TDEI system
     * @param user user details model
     */
    async registerUser(user: RegisterUserDto): Promise<UserProfile> {
        let userProfile = new UserProfile();
        try {
            const result: Response = await fetch(registerUrl, {
                method: 'post',
                body: JSON.stringify(user),
                headers: { 'Content-Type': 'application/json' }
            });

            if (result.status != undefined && result.status != 200)
                throw new HttpException(409, "User already exists with email " + user.email);

            if (result.status != undefined && result.status != 200)
                throw new Error();

            const data = await result.json();
            userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            if (error instanceof HttpException)
                throw error;
            throw new Error("Error registering the user");
        }
        return userProfile;
    }
    /**
     * Gets the TDEI system roles.
     */
    async getRoles(): Promise<RoleDto[]> {

        const query = 'SELECT name, description FROM Roles';
        return await dbClient.query(query)
            .then(res => {
                let roleList = res.rows.filter(f => ![Role.TDEI_ADMIN.toString(), Role.TDEI_USER.toString()].includes(f.name)).map(x => {
                    return new RoleDto(x);
                });
                return roleList;
            })
            .catch(e => {
                throw e;
            });
    }

    private async getRolesByNames(roles: string[]): Promise<Map<string, string>> {
        let roleMap = new Map<string, string>();
        var sql = format('SELECT role_id, name FROM roles WHERE name IN (%L)', roles);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => roleMap.set(x.name, x.role_id));
                return roleMap;
            })
            .catch(e => {
                throw e;
            });
    }

    private async getUserRoles(userId: string): Promise<string[]> {
        let roleMap: string[] = [];
        var sql = format('SELECT name FROM user_roles ur INNER JOIN roles r on r.role_id = ur.role_id WHERE user_id = %L', userId);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => roleMap.push(x.name));
                return roleMap;
            })
            .catch(e => {
                throw e;
            });

    }

    /**
     * Get user associated organizations and roles.
     * @param userId user id 
     * @param page_no page number
     * @param page_size page size
     * @returns List of User organizations with roles
     */
    async getUserOrgsWithRoles(userId: string, page_no: number, page_size: number): Promise<OrgRoleDto[]> {
        let orgRoleList: OrgRoleDto[] = [];

        //Set defaults if not provided
        if (page_no == undefined) page_no = 1;
        if (page_size == undefined) page_size = 10;
        let skip = page_no == 1 ? 0 : (page_no - 1) * page_size;
        let take = page_size > 50 ? 50 : page_size;

        var sql = format('SELECT o.name as org, o.org_id, ARRAY_AGG(r.name) as roles FROM user_roles ur INNER JOIN roles r on r.role_id = ur.role_id INNER JOIN organization o on ur.org_id = o.org_id WHERE user_id = %L GROUP BY o.name,o.org_id LIMIT %L OFFSET %L', userId, take, skip);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => {
                    let orgRole: OrgRoleDto = new OrgRoleDto();
                    orgRole.org_name = x.org;
                    orgRole.tdei_org_id = x.org_id;
                    orgRole.roles = x.roles;

                    orgRoleList.push(orgRole);
                });
                return orgRoleList;
            })
            .catch(e => {
                throw e;
            });

    }

    /**
     * Assigns the user permissions
     * @param rolesReq roles to be assigned
     * @param requestingUserId userd id for which roles to be assigned
     * @returns boolean flag
     */
    async updatePermissions(rolesReq: RolesReqDto, requestingUserId: string): Promise<boolean> {
        let userProfile = new UserProfile();

        //Fetch permissioned user profile from keycloak
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
        if (userId == requestingUserId)
            throw new HttpException(400, "Own account permissions management not allowed.");


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

        let valueArr = rolesReq.roles.map(role => {
            return [userId, rolesReq.tdei_org_id, rolemap.get(role)];
        });
        let queryStr = format('DELETE FROM user_roles WHERE user_id = %L AND org_id = %L; INSERT INTO user_roles (user_id, org_id, role_id) VALUES %L ON CONFLICT ON CONSTRAINT unq_user_role_org DO NOTHING', userId, rolesReq.tdei_org_id, valueArr);
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

    /**
     * Revokes the user permissions
     * @param rolesReq roles to be revoked
     * @param requestingUserId userd id for which roles to be revoked
     * @returns boolean flag
     */
    async revokeUserPermissions(rolesReq: RolesReqDto, requestingUserId: string): Promise<boolean> {
        let userProfile = new UserProfile();

        //Fetch permissioned user profile from keycloak
        try {
            const data: any = await (await fetch(`${userProfileUrl}?userName=${rolesReq.user_name}`)).json();
            if (data.status != undefined && data.status == 404)
                throw new Error("User not found or does not exist.");
            else userProfile = new UserProfile(data);
        } catch (error: any) {
            console.error(error);
            throw new UserNotFoundException(rolesReq.user_name);
        }
        //Get the user_id from user_entity table
        let userId = userProfile.id;

        if (userId == requestingUserId)
            throw new HttpException(400, "Own account permissions management not allowed.");

        //Check requesting user roles
        let userRoles = await this.getUserRoles(requestingUserId);
        let isAdmin = userRoles.findIndex(x => x == Role.TDEI_ADMIN) != -1;

        if (!isAdmin) {
            //Check POC role if exists, as it is restricted to Admin only
            if (rolesReq.roles.findIndex(x => adminRestrictedRoles.indexOf(x.toLocaleLowerCase()) != -1) != -1)
                throw new HttpException(400, "Admin restricted roles cannot be revoked.");
        }

        if (rolesReq.roles.length > 0)
            await this.removeRoles(rolesReq, userId);
        else
            await this.removeUserFromOrg(rolesReq.tdei_org_id, userId);
        return true;
    }

    private async removeUserFromOrg(org_id: string, userId: string) {
        const query = {
            text: 'DELETE FROM user_roles WHERE user_id = $1 AND org_id = $2',
            values: [userId, org_id],
        };
        await dbClient.query(query)
            .catch(e => {
                throw e;
            });
    }

    private async removeRoles(rolesReq: RolesReqDto, userId: string) {
        //Get the role ids for role name provided
        let rolemap = await this.getRolesByNames(rolesReq.roles);


        rolesReq.roles.forEach(async (role) => {
            const query = {
                text: 'DELETE FROM user_roles WHERE user_id = $1 AND org_id = $2 AND role_id = $3 ',
                values: [userId, rolesReq.tdei_org_id, rolemap.get(role)],
            };
            await dbClient.query(query)
                .catch(e => {
                    throw e;
                });
        });
    }
}

const userManagementService: IUserManagement = new UserManagementService();
export default userManagementService;