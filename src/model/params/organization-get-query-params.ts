import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class OrgQueryParams extends AbstractDomainEntity {
    @IsOptional()
    @Prop()
    searchText: string | undefined;
    @IsOptional()
    @Prop()
    tdei_org_id: string | undefined;
    @IsOptional()
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @Prop()
    bbox: Array<number> = [];
    @IsOptional()
    @Prop()
    page_no: number = 1;
    @IsOptional()
    @Prop()
    page_size: number = 10;

    constructor(init?: Partial<OrgQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelectRaw(`Select o.org_id, o.name, o.phone, o.address, o.polygon, o.url, o.is_active, ue.enabled, 
        COALESCE(json_agg(json_build_object('email', ue.email, 'username', ue.username, 'first_name', 
                                   ue.first_name,'last_name', ue.last_name,'enabled', ue.enabled) 
                ) FILTER (WHERE ue.username IS NOT NULL), '[]')
         as userDetails 
        from organization o         
        left join user_roles ur on o.org_id = ur.org_id and ur.role_id = (select role_id from roles where name='poc' limit 1)       
        left join keycloak.user_entity ue on ur.user_id = ue.id AND ue.enabled = true         
        `.replace(/\n/g, ""));
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("o.name", SqlORder.ASC);
        //Add conditions
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` o.name ILIKE $${queryObject.paramCouter++} `, this.searchText + '%');
        }
        if (this.tdei_org_id != undefined && this.tdei_org_id.length != 0) {
            queryObject.condition(` ur.org_id = $${queryObject.paramCouter++} `, this.tdei_org_id);
        }
        if (this.bbox && this.bbox.length > 0 && this.bbox.length == 4) {
            queryObject.condition(` o.polygon && ST_MakeEnvelope($${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++}, 4326)`,
                this.bbox);
        }
        else if (this.bbox.length > 0 && this.bbox.length != 4) {
            console.debug("Skipping bbox filter as bounding box constraints not satisfied.");
        }
        //Always pull active organization
        queryObject.condition(` o.is_active = $${queryObject.paramCouter++} `, true);
        queryObject.buildGroupRaw("group by o.org_id, o.name, o.phone, o.address, o.polygon, o.url, o.is_active, ue.enabled ");

        return queryObject;
    }
}