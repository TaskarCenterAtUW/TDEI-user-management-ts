import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";
import { DynamicQueryObject, SqlORder } from "../../database/query-object";

export class StationQueryParams extends AbstractDomainEntity {
    @IsOptional()
    @Prop()
    searchText: string | undefined;
    @IsOptional()
    @Prop()
    stationId: string | undefined;
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

    constructor(init?: Partial<StationQueryParams>) {
        super();
        Object.assign(this, init);
    }

    /**
     * Builds the parameterized sql query.
     * @returns DynamicQueryObject
     */
    getQueryObject() {
        let queryObject: DynamicQueryObject = new DynamicQueryObject();
        queryObject.buildSelect("station", ["station_id", "name", "owner_org", "ST_AsGeoJSON(polygon) as polygon"]);
        queryObject.buildPagination(this.page_no, this.page_size);
        queryObject.buildOrder("name", SqlORder.ASC);
        //Add conditions
        if (this.searchText != undefined && this.searchText.length != 0) {
            queryObject.condition(` name LIKE $${queryObject.paramCouter++} `, this.searchText + '%');
        }
        if (this.stationId != undefined && this.stationId.length != 0) {
            queryObject.condition(` station_id = $${queryObject.paramCouter++} `, this.stationId);
        }
        if (this.bbox && this.bbox.length > 0 && this.bbox.length == 4) {
            queryObject.condition(`polygon && ST_MakeEnvelope($${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++},$${queryObject.paramCouter++}, 4326)`,
                this.bbox);
        }
        else if (this.bbox.length > 0 && this.bbox.length != 4) {
            console.debug("Skipping bbox filter as bounding box constraints not satisfied.");
        }
        //Always pull active organization
        queryObject.condition(` is_active = $${queryObject.paramCouter++} `, true);

        return queryObject;
    }
}