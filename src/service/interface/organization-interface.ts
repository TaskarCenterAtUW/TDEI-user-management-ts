import { OrganizationDto } from "../../model/dto/organization-dto";

export interface IOrganizationService {
    createOrganization(organization: OrganizationDto): Promise<String>;
    updateOrganization(organization: OrganizationDto): Promise<boolean>;
    getOrganizations(orgId: string, searchText: string, page_no: number, page_size: number): Promise<OrganizationDto[]>;
    setOrganizationStatus(orgId: string, status: boolean): Promise<boolean>;
}