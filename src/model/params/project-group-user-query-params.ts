import { IsOptional, Length } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class ProjectGroupUserQueryParams extends AbstractDomainEntity {
    @IsOptional()
    @Prop()
    searchText: string | undefined;
    @IsOptional()
    @Prop()
    @Length(36, 36, {
        message: 'tdei_project_group_id must be 36 characters long (UUID)',
    })
    tdei_project_group_id: string | undefined;
    @IsOptional()
    @Prop()
    page_no: number = 1;
    @IsOptional()
    @Prop()
    page_size: number = 10;

    constructor(init?: Partial<ProjectGroupUserQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelectRaw(`Select ue.id as user_id, ue.first_name, ue.last_name,CONCAT(ue.first_name, ' ', ue.last_name) AS fullname, ue.email, ue.username, ur.project_group_id,ARRAY_AGG(distinct r.name) as roles, json_agg( distinct ua.*) as attributes
        from keycloak.user_entity ue 
        inner join keycloak.user_attribute ua on ue.id = ua.user_id 
        inner join user_roles ur on ue.id = ur.user_id 
        inner join roles r on ur.role_id = r.role_id
        `.replace(/\n/g, ""));
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("ue.first_name", SqlORder.ASC);
        //Add conditions
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` (ue.first_name ILIKE $${queryObject.paramCouter} OR ue.last_name ILIKE $${queryObject.paramCouter} OR ue.username ILIKE $${queryObject.paramCouter++})`, this.searchText + '%');
        }
        if (this.tdei_project_group_id != undefined && this.tdei_project_group_id.length != 0) {
            queryObject.condition(` ur.project_group_id = $${queryObject.paramCouter++} `, this.tdei_project_group_id);
        }

        queryObject.buildGroupRaw(" group by ue.id, ue.first_name, ue.last_name, ue.email, ue.username, ur.project_group_id ");

        return queryObject;
    }
}