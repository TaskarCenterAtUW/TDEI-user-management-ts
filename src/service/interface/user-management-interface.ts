import { RolesReqDto } from "../../model/dto/roles-req-dto";
import { RegisterUserDto } from "../../model/dto/register-user-dto";
import { UserProfile } from "../../model/dto/user-profile-dto";
import { RoleDto } from "../../model/dto/roles-dto";
import { LoginDto } from "../../model/dto/login-dto";
import { ProjectGroupRoleDto } from "../../model/dto/project-group-role-dto";
import { ResetCredentialsDto } from "../../model/dto/reset-credentials-dto";
import { ReferralCodeDto } from "../../model/dto/referral-code-dto";

export interface IUserManagement {

    /**
     * Applies the referral code to the user
     * @param userId User ID
     * @param referralCode Referral code
     * @returns boolean flag
     */
    applyReferralCode(userId: string, referralCode: string): Promise<boolean>;

    /**
     * Fetches the referral code details
     * @param referralCode Referral code
     * @returns Referral code details
     */
    getReferralCodeDetails(referralCode: string): Promise<ReferralCodeDto>;
    /**
     * Authenticates the user with referral code
     * @param loginModel User credentials
     * @param referralCode Referral code
     * @returns Access token
     */
    loginWithReferralCode(loginModel: LoginDto, referralCode: string): Promise<any>;
    /**
     * Resets the user credentials
     * @param ResetCredentialsDto user credentials
     */
    resetCredentials(ResetCredentialsDto: ResetCredentialsDto): Promise<boolean>;
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
     * @param searchText Optional search text
     * @param sortBy Optional sort by (created_at | name)
     * @returns List of User project groups with roles
     */
    getUserProjectGroupsWithRoles(
        userId: string,
        page_no: number,
        page_size: number,
        searchText?: string,
        sortBy?: string
    ): Promise<ProjectGroupRoleDto[]>;
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

    /**
     * Fetches all the users in the system with unique roles
     * @returns 
     */
    downloadUsers(): Promise<string>
}