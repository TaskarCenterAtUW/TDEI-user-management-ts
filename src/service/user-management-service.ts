import dbClient from "../database/data-source";
import UniqueKeyDbException, { ForeignKeyDbException } from "../exceptions/db/database-exceptions";
import { RolesReqDto } from "../model/dto/roles-req-dto";
import { RegisterUserDto } from "../model/dto/register-user-dto";
import { IUserManagement } from "./interface/user-management-interface";
import { ForeignKeyException, UnAuthenticated, UserNotFoundException } from "../exceptions/http/http-exceptions";
import format from "pg-format";
import fetch, { Response } from 'node-fetch';
import { UserProfile } from "../model/dto/user-profile-dto";
import HttpException from "../exceptions/http/http-base-exception";
import { RoleDto } from "../model/dto/roles-dto";
import { LoginDto } from "../model/dto/login-dto";
import { Role } from "../constants/role-constants";
import { adminRestrictedRoles } from "../constants/admin-restricted-role-constants";
import { ProjectGroupRoleDto } from "../model/dto/project-group-role-dto";
import { environment } from "../environment/environment";


export class UserManagementService implements IUserManagement {
    /**
    * Reissues the new access token in the case of valid refresh token input
    * @param refreshToken refresh token
    */
    async refreshToken(refreshToken: string): Promise<any> {
        try {
            const result = await fetch(environment.refreshUrl as string, {
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
            const result: Response = await fetch(environment.authenticateUrl as string, {
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
            throw new UnAuthenticated();
        }
    }
    /**
     * Creates new user in TDEI system
     * @param user user details model
     */
    async registerUser(user: RegisterUserDto): Promise<UserProfile> {
        let userProfile = new UserProfile();
        try {
            const result: Response = await fetch(environment.registerUserUrl as string, {
                method: 'post',
                body: JSON.stringify(user),
                headers: { 'Content-Type': 'application/json' }
            });

            if (result.status != undefined && result.status == 409)
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
     * Get user associated project groups and roles.
     * @param userId user id 
     * @param page_no page number
     * @param page_size page size
     * @returns List of User project groups with roles
     */
    async getUserProjectGroupsWithRoles(userId: string, page_no: number, page_size: number): Promise<ProjectGroupRoleDto[]> {
        let projectGroupRoleList: ProjectGroupRoleDto[] = [];

        //Set defaults if not provided
        if (page_no == undefined) page_no = 1;
        if (page_size == undefined) page_size = 10;
        let skip = page_no == 1 ? 0 : (page_no - 1) * page_size;
        let take = page_size > 50 ? 50 : page_size;

        var sql = format('SELECT o.name as project_group_name, o.project_group_id, ARRAY_AGG(r.name) as roles FROM user_roles ur INNER JOIN roles r on r.role_id = ur.role_id INNER JOIN project_group o on ur.project_group_id = o.project_group_id AND o.is_active = true WHERE user_id = %L GROUP BY o.name,o.project_group_id LIMIT %L OFFSET %L', userId, take, skip);

        return await dbClient.query(sql)
            .then(res => {
                res.rows.forEach(x => {
                    let projectGroupRole: ProjectGroupRoleDto = new ProjectGroupRoleDto();
                    projectGroupRole.project_group_name = x.project_group_name;
                    projectGroupRole.tdei_project_group_id = x.project_group_id;
                    projectGroupRole.roles = x.roles;

                    projectGroupRoleList.push(projectGroupRole);
                });
                return projectGroupRoleList;
            })
            .catch(e => {
                throw e;
            });

    }

    /**
     * Fetch user profile details
     * @param userName user name
     * @returns 
     */
    async getUserProfile(userName: string): Promise<UserProfile> {
        //Fetch permissioned user profile from keycloak
        try {
            let response = await fetch(`${environment.userProfileUrl as string}?userName=${userName}`)
            const data: any = await response.json();
            if (response.status != undefined && response.status != 200)
                throw new Error();
            let result = new UserProfile(data);
            return result;
        } catch (error: any) {
            console.error(error);
            throw new UserNotFoundException(userName);
        }
    }

    /**
     * Assigns the user permissions
     * @param rolesReq roles to be assigned
     * @param requestingUserId userd id for which roles to be assigned
     * @returns boolean flag
     */
    async updatePermissions(rolesReq: RolesReqDto, requestingUserId: string): Promise<boolean> {

        //Fetch permissioned user profile from keycloak
        let userProfile = await this.getUserProfile(rolesReq.user_name);

        //Get the user_id from user_entity table
        let userId = userProfile.id;
        if (userId == requestingUserId)
            throw new HttpException(400, "Own account permissions management not allowed.");


        //Check requesting user roles
        let userRoles = await this.getUserRoles(requestingUserId);
        let isAdmin = userRoles.findIndex(x => x == Role.TDEI_ADMIN) != -1;

        if (!isAdmin) {
            //Check admin role if exists, as it is restricted to Admin only
            if (rolesReq.roles.findIndex(x => adminRestrictedRoles.indexOf(x.toLocaleLowerCase()) != -1) != -1)
                throw new HttpException(400, "Admin restricted roles cannot be assigned");
        }

        //Get the role ids for role name provided
        let rolemap = await this.getRolesByNames(rolesReq.roles);

        let valueArr = rolesReq.roles.map(role => {
            return [userId, rolesReq.tdei_project_group_id, rolemap.get(role)];
        });
        let queryStr = format('DELETE FROM user_roles WHERE user_id = %L AND project_group_id = %L; INSERT INTO user_roles (user_id, project_group_id, role_id) VALUES %L ON CONFLICT ON CONSTRAINT unq_user_role_project_group DO NOTHING', userId, rolesReq.tdei_project_group_id, valueArr);
        return await dbClient.query(queryStr)
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof ForeignKeyDbException) {
                    throw new ForeignKeyException((e as ForeignKeyDbException).message);
                }
                // else if (e instanceof UniqueKeyDbException) {
                //     throw new HttpException(400, "User already assigned with the specific roles");
                // }
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
        let userProfile = await this.getUserProfile(rolesReq.user_name);

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
            await this.removeUserFromProjectGroup(rolesReq.tdei_project_group_id, userId);
        return true;
    }

    private async removeUserFromProjectGroup(project_group_id: string, userId: string) {
        const query = {
            text: 'DELETE FROM user_roles WHERE user_id = $1 AND project_group_id = $2',
            values: [userId, project_group_id],
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
                text: 'DELETE FROM user_roles WHERE user_id = $1 AND project_group_id = $2 AND role_id = $3 ',
                values: [userId, rolesReq.tdei_project_group_id, rolemap.get(role)],
            };
            await dbClient.query(query)
                .catch(e => {
                    throw e;
                });
        });
    }
}

const userManagementServiceInstance: IUserManagement = new UserManagementService();
export default userManagementServiceInstance;