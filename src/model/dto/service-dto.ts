import { IsIn, IsNotEmpty, IsOptional, Length, MaxLength } from "class-validator";
import { FeatureCollection } from "geojson";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class ServiceDto extends BaseDto {
    @Prop("tdei_service_id")
    @Length(1, 36)
    @IsOptional()
    tdei_service_id: string = "0";
    @IsNotEmpty()
    @Prop()
    @Length(36, 36, {
        message: 'tdei_project_group_id must be 36 characters long (UUID)',
    })
    tdei_project_group_id!: string;
    @IsNotEmpty()
    @Prop("service_name")
    @MaxLength(255)
    service_name!: string;
    @IsNotEmpty()
    @Prop("service_type")
    @IsIn(['flex', 'pathways', 'osw'])
    @MaxLength(20)
    service_type!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: FeatureCollection;

    constructor(init?: Partial<ServiceDto>) {
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
            text: `INSERT INTO service(name, service_type, owner_project_group ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2, $3  ${polygonExists ? ', ST_GeomFromGeoJSON($4) ' : ''})  RETURNING service.service_id`,
            values: [this.service_name, this.service_type, this.tdei_project_group_id],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
        }
        return queryObject;
    }
}
