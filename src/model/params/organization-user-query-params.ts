import { IsOptional } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class OrgUserQueryParams extends AbstractDomainEntity {
    @IsOptional()
    @Prop()
    searchText: string | undefined;
    @IsOptional()
    @Prop()
    orgId: string | undefined;
    @IsOptional()
    @Prop()
    page_no: number = 1;
    @IsOptional()
    @Prop()
    page_size: number = 10;

    constructor(init?: Partial<OrgUserQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelectRaw(`Select ue.id as user_id, ue.first_name, ue.last_name,CONCAT(ue.first_name, ' ', ue.last_name) AS fullname, ue.email, ue.username, ur.org_id,ARRAY_AGG(distinct r.name) as roles, json_agg( distinct ua.*) as attributes
        from keycloak.user_entity ue 
        inner join keycloak.user_attribute ua on ue.id = ua.user_id 
        inner join user_roles ur on ue.id = ur.user_id 
        inner join roles r on ur.role_id = r.role_id
        `.replace(/\n/g, ""));
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("ue.first_name", SqlORder.ASC);
        //Add conditions
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` fullname ILIKE $${queryObject.paramCouter++} `, this.searchText + '%');
        }
        if (this.orgId != undefined && this.orgId.length != 0) {
            queryObject.condition(` ur.org_id = $${queryObject.paramCouter++} `, this.orgId);
        }

        queryObject.buildGroupRaw(" group by ue.id, ue.first_name, ue.last_name, ue.email, ue.username, ur.org_id ");

        return queryObject;
    }
}