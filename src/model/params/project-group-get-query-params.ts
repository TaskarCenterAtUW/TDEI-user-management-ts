import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, Length } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class ProjectGroupQueryParams extends AbstractDomainEntity {
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
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @Prop()
    bbox: Array<number> | undefined;
    @IsOptional()
    @Prop()
    page_no: number = 1;
    @IsOptional()
    @Prop()
    page_size: number = 10;
    @IsOptional()
    @Prop()
    show_inactive!: boolean;

    constructor(init?: Partial<ProjectGroupQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelectRaw(`Select o.project_group_id, o.name, o.phone, o.address, ST_AsGeoJSON(o.polygon) as polygon, o.url, o.is_active, ue.enabled, 
        COALESCE(json_agg(json_build_object('email', ue.email, 'username', ue.username, 'first_name', 
                                   ue.first_name,'last_name', ue.last_name,'enabled', ue.enabled) 
                ) FILTER (WHERE ue.username IS NOT NULL), '[]')
         as userDetails 
        from project_group o         
        left join user_roles ur on o.project_group_id = ur.project_group_id and ur.role_id = (select role_id from roles where name='poc' limit 1)       
        left join keycloak.user_entity ue on ur.user_id = ue.id AND ue.enabled = true         
        `.replace(/\n/g, ""));
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("o.name", SqlORder.ASC);
        //Add conditions
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` o.name ILIKE $${queryObject.paramCouter++} `, this.searchText + '%');
        }
        if (this.tdei_project_group_id != undefined && this.tdei_project_group_id.length != 0) {
            queryObject.condition(` o.project_group_id = $${queryObject.paramCouter++} `, this.tdei_project_group_id);
        }
        if (this.bbox && this.bbox.length > 0 && this.bbox.length == 4) {
            queryObject.condition(` o.polygon && ST_MakeEnvelope($${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++}, 4326)`,
                this.bbox);
        }
        else if (this.bbox && this.bbox.length > 0 && this.bbox.length != 4) {
            console.debug("Skipping bbox filter as bounding box constraints not satisfied.");
        }
        // //Always pull active project group
        // queryObject.condition(` o.is_active = $${queryObject.paramCouter++} `, true);
        if (this.show_inactive != undefined && String(this.show_inactive).toLowerCase() == 'true') {
            queryObject.condition(` o.is_active = $${queryObject.paramCouter++} `, false);
        }
        else {
            //Always pull active project group
            queryObject.condition(` o.is_active = $${queryObject.paramCouter++} `, true);
        }

        queryObject.buildGroupRaw("group by o.project_group_id, o.name, o.phone, o.address, o.polygon, o.url, o.is_active, ue.enabled ");

        return queryObject;
    }
}