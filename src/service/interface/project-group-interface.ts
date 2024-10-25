import { ProjectGroupUserDto } from "../../model/dto/project-group-user-dto";
import { ProjectGroupDto } from "../../model/dto/project-group-dto";
import { ProjectGroupListResponse } from "../../model/dto/poc-details-dto";
import { ProjectGroupQueryParams } from "../../model/params/project-group-get-query-params";
import { ProjectGroupUserQueryParams } from "../../model/params/project-group-user-query-params";

export interface IProjectGroupService {
    getProjectGroupUsers(params: ProjectGroupUserQueryParams): Promise<ProjectGroupUserDto[]>;
    createProjectGroup(projectGroup: ProjectGroupDto): Promise<String>;
    updateProjectGroup(projectGroup: ProjectGroupDto): Promise<boolean>;
    getProjectGroups(params: ProjectGroupQueryParams): Promise<ProjectGroupListResponse[]>;
    setProjectGroupStatus(projectGroupId: string, status: boolean): Promise<boolean>;
    getProjectGroupById(project_group_id: string): Promise<ProjectGroupDto>;
}