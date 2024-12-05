import dbClient from "../database/data-source";
import UniqueKeyDbException from "../exceptions/db/database-exceptions";
import { ProjectGroupDto } from "../model/dto/project-group-dto";
import { DuplicateException } from "../exceptions/http/http-exceptions";
import { QueryConfig } from "pg";
import { IProjectGroupService } from "./interface/project-group-interface";
import { ProjectGroupQueryParams } from "../model/params/project-group-get-query-params";
import { ProjectGroupUserQueryParams } from "../model/params/project-group-user-query-params";
import { ProjectGroupUserDto } from "../model/dto/project-group-user-dto";
import { ProjectGroupListResponse, PocDetails } from "../model/dto/poc-details-dto";
import { Geometry, Feature } from "geojson";
import format from "pg-format";
import { DEFAULT_PROJECT_GROUP } from "../constants/role-constants";
import HttpException from "../exceptions/http/http-base-exception";


class ProjectGroupService implements IProjectGroupService {

    async setProjectGroupStatus(projectGroupId: string, status: boolean): Promise<boolean> {
        //Default project group should not be deactivated
        const query = {
            text: format(`UPDATE project_group set is_active = $1 WHERE project_group_id = $2  and name != %L`, DEFAULT_PROJECT_GROUP),
            values: [status, projectGroupId],
        }
        return await dbClient.query(query)
            .then(res => {
                return true;
            })
            .catch(e => {
                throw e;
            });
    }

    async createProjectGroup(projectgroup: ProjectGroupDto): Promise<String> {

        return await dbClient.query(projectgroup.getInsertQuery())
            .then(res => {
                return res.rows[0].project_group_id;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(projectgroup.project_group_name);
                }
                throw e;
            });
    }

    async updateProjectGroup(projectgroup: ProjectGroupDto): Promise<boolean> {

        const query = {
            text: `Select is_active from project_group where project_group_id = $1 limit 1`,
            values: [projectgroup.tdei_project_group_id],
        }
        var result = await dbClient.query(query);

        if (result.rows.length == 0) {
            throw new HttpException(404, "Project group not found");
        }

        if (result.rows.length > 0 && !result.rows[0].is_active) {
            throw new HttpException(400, "Update not allowed on inactive project group");
        }

        //Check if the project group is default, if yes then do not allow to update the project group name
        const defaultProjectGroupId = await this.getDefaultProjectGroupId();
        if (defaultProjectGroupId == projectgroup.tdei_project_group_id) {
            projectgroup.project_group_name = DEFAULT_PROJECT_GROUP;
        }
        return await dbClient.query(projectgroup.getUpdateQuery())
            .then(res => {
                return true;
            })
            .catch(e => {
                if (e instanceof UniqueKeyDbException) {
                    throw new DuplicateException(projectgroup.project_group_name);
                }
                throw e;
            });
    }

    private async getDefaultProjectGroupId(): Promise<string> {
        const query = {
            text: format(`Select project_group_id from project_group where name = %L`, DEFAULT_PROJECT_GROUP),
            values: [],
        }
        var result = await dbClient.query(query);
        if (result.rows.length > 0) {
            return result.rows[0].project_group_id;
        }
        else {
            return "";
        }
    }

    async getProjectGroupById(project_group_id: string): Promise<ProjectGroupDto> {
        const query = {
            text: "Select * from project_group where project_group_id = $1",
            values: [project_group_id],
        }
        var result = await dbClient.query(query);
        if (result.rows.length > 0) {
            let pg = ProjectGroupDto.from(result.rows[0]);
            pg.tdei_project_group_id = result.rows[0].project_group_id;
            return pg;
        }
        throw new HttpException(404, "Project Group not found");
    }

    async getProjectGroups(params: ProjectGroupQueryParams): Promise<ProjectGroupListResponse[]> {
        if (params.tdei_project_group_id) {
            //Check if project group exists
            await this.getProjectGroupById(params.tdei_project_group_id);
        }

        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }
        let list: ProjectGroupListResponse[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let projectgroup = ProjectGroupListResponse.from(x);
                    projectgroup.tdei_project_group_id = x.project_group_id;
                    projectgroup.project_group_name = x.name;
                    if (projectgroup.polygon) {
                        var polygon = JSON.parse(x.polygon) as Geometry;
                        projectgroup.polygon = {
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    geometry: polygon,
                                    properties: {}
                                } as Feature
                            ]
                        }
                    }
                    projectgroup.poc = [];
                    if (x.userdetails.length > 0) {
                        x.userdetails.forEach((u: any) => {
                            projectgroup.poc.push(PocDetails.from(u));
                        });
                    }

                    list.push(projectgroup);
                });
                return list;
            })
            .catch(e => {
                throw e;
            });
    }

    async getProjectGroupUsers(params: ProjectGroupUserQueryParams): Promise<ProjectGroupUserDto[]> {
        let queryObject = params.getQueryObject();
        let queryObj = <QueryConfig>{
            text: queryObject.getQuery(),
            values: queryObject.getValues()
        }
        let list: ProjectGroupUserDto[] = [];
        return await dbClient.query(queryObj)
            .then(res => {
                res.rows.forEach(x => {
                    let user = ProjectGroupUserDto.from(x);
                    if (x.attributes && x.attributes.length > 0) {
                        let phoneObj = x.attributes.find((a: any) => a.name == "phone");
                        if (phoneObj) {
                            user.phone = phoneObj.value;
                        }
                    }
                    list.push(user);
                });
                return list;
            })
            .catch(e => {
                throw e;
            });
    }

}

const projectgroupService: IProjectGroupService = new ProjectGroupService();
export default projectgroupService;