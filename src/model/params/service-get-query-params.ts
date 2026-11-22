import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, Length, MaxLength } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class ServiceQueryParams extends AbstractDomainEntity {
    @IsOptional()
    @Prop()
    searchText: string | undefined;
    @IsNotEmpty()
    @Prop()
    @IsIn(['flex', 'pathways', 'osw', "all"])
    @MaxLength(20)
    service_type: string = "all";
    @IsOptional()
    @Prop("tdei_service_id")
    @Length(36, 36, {
        message: 'tdei_service_id must be 36 characters long (UUID)',
    })
    tdei_service_id: string | undefined;
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

    constructor(init?: Partial<ServiceQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query for one page of services.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        this.sanitizePagination();
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("service", ["service_id", "service_type", "name", "owner_project_group", "ST_AsGeoJSON(polygon) as polygon"]);
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        this.applyFilters(queryObject);
        return queryObject;
    }

    /**
     * Counts matching services without loading polygons or applying the page limit.
     */
    getCountQueryObject(): DynamicQueryObject {
        const queryObject = new DynamicQueryObject();
        queryObject.buildSelectRaw("SELECT COUNT(*)::int AS total FROM service");
        this.applyFilters(queryObject);
        return queryObject;
    }

    /**
     * page_no defaults to 1. page_size defaults to 10 and is capped at 50.
     */
    sanitizePagination(): void {
        const pageNo = Number(this.page_no);
        const pageSize = Number(this.page_size);

        this.page_no = Number.isFinite(pageNo) && pageNo >= 1 ? Math.trunc(pageNo) : 1;

        const resolvedSize = Number.isFinite(pageSize) && pageSize >= 1 ? Math.trunc(pageSize) : 10;
        this.page_size = resolvedSize > 50 ? 50 : resolvedSize;
    }

    private applyFilters(queryObject: DynamicQueryObject): void {
        if (this.show_inactive != undefined && String(this.show_inactive).toLowerCase() == 'true') {
            queryObject.condition(` is_active = $${queryObject.paramCouter++} `, false);
        }
        else {
            queryObject.condition(` is_active = $${queryObject.paramCouter++} `, true);
        }

        if (this.service_type != undefined && this.service_type.length != 0 && this.service_type != "all") {
            queryObject.condition(` service_type = $${queryObject.paramCouter++} `, this.service_type);
        }
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` name ILIKE $${queryObject.paramCouter++} `, this.searchText + '%');
        }
        if (this.tdei_service_id != undefined && this.tdei_service_id.length != 0) {
            queryObject.condition(` service_id = $${queryObject.paramCouter++} `, this.tdei_service_id);
        }
        if (this.tdei_project_group_id != undefined && this.tdei_project_group_id.length != 0) {
            queryObject.condition(` owner_project_group = $${queryObject.paramCouter++} `, this.tdei_project_group_id);
        }
        if (this.bbox && this.bbox.length > 0 && this.bbox.length == 4) {
            queryObject.condition(`polygon && ST_MakeEnvelope($${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++}, 4326)`,
                this.bbox);
        }
        else if (this.bbox && this.bbox.length > 0 && this.bbox.length != 4) {
            console.debug("Skipping bbox filter as bounding box constraints not satisfied.");
        }
    }
}