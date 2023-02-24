import { OrgUserDto } from "../../model/dto/org-user-dto";
import { OrganizationDto } from "../../model/dto/organization-dto";
import { OrgQueryParams } from "../../model/params/organization-get-query-params";
import { OrgUserQueryParams } from "../../model/params/organization-user-query-params";

export interface IOrganizationService {
    getOrganizationUsers(params: OrgUserQueryParams): Promise<OrgUserDto[]>;
    createOrganization(organization: OrganizationDto): Promise<String>;
    updateOrganization(organization: OrganizationDto): Promise<boolean>;
    getOrganizations(params: OrgQueryParams): Promise<OrganizationDto[]>;
    setOrganizationStatus(orgId: string, status: boolean): Promise<boolean>;
}