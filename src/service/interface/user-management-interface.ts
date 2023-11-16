import { RolesReqDto } from "../../model/dto/roles-req-dto";
import { RegisterUserDto } from "../../model/dto/register-user-dto";
import { UserProfile } from "../../model/dto/user-profile-dto";
import { RoleDto } from "../../model/dto/roles-dto";
import { LoginDto } from "../../model/dto/login-dto";
import { ProjectGroupRoleDto } from "../../model/dto/project-group-role-dto";

export interface IUserManagement {
    /**
     * Reissues the new access token in the case of valid refresh token input
     * @param refreshToken refresh token
     */
    refreshToken(refreshToken: string): Promise<any>;
    /**
     * Creates new user in TDEI system
     * @param user user details model
     */
    registerUser(user: RegisterUserDto): Promise<UserProfile>;
    /**
    * Assigns the user permissions
    * @param rolesReq roles to be assigned
    * @param requestingUserId userd id for which roles to be assigned
    * @returns boolean flag
    */
    updatePermissions(permissionReq: RolesReqDto, userId: string): Promise<boolean>;
    /**
     * Gets the TDEI system roles.
     */
    getRoles(): Promise<RoleDto[]>;
    /**
     * Authenticates the user
     * @param loginModel User credentials
     * @returns Access token
     */
    login(loginModel: LoginDto): Promise<any>;
    /**
     * Get user associated project groups and roles.
     * @param userId user id 
     * @param page_no page number
     * @param page_size page size
     * @returns List of User project groups with roles
     */
    getUserProjectGroupsWithRoles(userId: string, page_no: number, page_size: number): Promise<ProjectGroupRoleDto[]>;
    /**
     * Revokes the user permissions
     * @param rolesReq roles to be revoked
     * @param requestingUserId userd id for which roles to be revoked
     * @returns boolean flag
     */
    revokeUserPermissions(rolesReq: RolesReqDto, requestingUserId: string): Promise<boolean>;

    /**
     * Fetch user profile details
     * @param userName user name
     * @returns 
     */
    getUserProfile(userName: string): Promise<UserProfile>;
}