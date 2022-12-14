import { OrganizationDto } from "../../model/dto/organization-dto";
import { RolesReqDto } from "../../model/dto/roles-req-dto";
import { PocRequestDto } from "../../model/dto/poc-req";
import { RegisterUserDto } from "../../model/dto/register-user-dto";
import { ServiceDto } from "../../model/dto/service-dto";
import { StationDto } from "../../model/dto/station-dto";
import { UserProfile } from "../../model/dto/user-profile-dto";
import { RoleDto } from "../../model/dto/roles-dto";
import { LoginDto } from "../../model/dto/login-dto";

export interface IUserManagement {
    registerUser(user: RegisterUserDto): Promise<UserProfile>;
    createStation(station: StationDto): Promise<String>;
    createService(service: ServiceDto): Promise<String>;
    createOrganization(organization: OrganizationDto): Promise<String>;
    assignPocToOrg(pocReq: PocRequestDto): Promise<boolean>;
    assignUserPermission(permissionReq: RolesReqDto, userId : string): Promise<boolean>;
    getRoles(): Promise<RoleDto[]>;
    login(loginModel: LoginDto): Promise<any>;
}