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


class ProjectGroupService implements IProjectGroupService {

    async setProjectGroupStatus(projectGroupId: string, status: boolean): Promise<boolean> {
        const query = {
            text: `UPDATE project_group set is_active = $1 WHERE project_group_id = $2`,
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

    async getProjectGroups(params: ProjectGroupQueryParams): Promise<ProjectGroupListResponse[]> {
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