import { OrganizationDto } from "../../model/dto/organization-dto";
import { OrgQueryParams } from "../../model/params/organization-get-query-params";

export interface IOrganizationService {
    createOrganization(organization: OrganizationDto): Promise<String>;
    updateOrganization(organization: OrganizationDto): Promise<boolean>;
    getOrganizations(params: OrgQueryParams): Promise<OrganizationDto[]>;
    setOrganizationStatus(orgId: string, status: boolean): Promise<boolean>;
}