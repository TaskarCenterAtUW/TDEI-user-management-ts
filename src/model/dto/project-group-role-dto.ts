import { DatasetViewerDto } from "./dataset-viewer-dto";

export class ProjectGroupRoleDto {
    tdei_project_group_id!: string;
    project_group_name!: string;
    roles!: string[];
    data_viewer_config!: DatasetViewerDto;
    constructor(init?: Partial<ProjectGroupRoleDto>) {
        Object.assign(this, init);
    }
}