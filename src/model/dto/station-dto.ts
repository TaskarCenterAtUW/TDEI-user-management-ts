import { IsNotEmpty, IsOptional } from "class-validator";
import { FeatureCollection } from "geojson";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class StationDto extends BaseDto {
    @Prop("tdei_station_id")
    tdei_station_id: string = "0";
    @IsNotEmpty()
    @Prop()
    tdei_project_group_id!: string;
    @IsNotEmpty()
    @Prop("station_name")
    station_name!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: FeatureCollection;

    constructor(init?: Partial<StationDto>) {
        super();
        Object.assign(this, init);
    }

    /**
   * Builds the insert QueryConfig object
   * @returns QueryConfig object
   */
    getInsertQuery(): QueryConfig {
        let polygonExists = this.polygon ? true : false;
        const queryObject = {
            text: `INSERT INTO station(owner_project_group, name ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2 ${polygonExists ? ', ST_GeomFromGeoJSON($3) ' : ''})   RETURNING station.station_id`,
            values: [this.tdei_project_group_id, this.station_name],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
        }
        return queryObject;
    }
}