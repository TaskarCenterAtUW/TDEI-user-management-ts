import { IsNotEmpty, IsOptional, Length, MaxLength } from "class-validator";
import { FeatureCollection } from "geojson";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class ServiceUpdateDto extends BaseDto {
    @IsNotEmpty()
    @Prop("tdei_service_id")
    @Prop()
    @Length(36, 36, {
        message: 'service_id must be 36 characters long (UUID)',
    })
    tdei_service_id: string | undefined;
    @IsNotEmpty()
    @Prop("service_name")
    @MaxLength(255)
    service_name!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: FeatureCollection;

    constructor(init?: Partial<ServiceUpdateDto>) {
        super();
        Object.assign(this, init);
    }

    /**
    * Verifying inputs
    * @returns verify result
    */
    verifyInput(): { valid: boolean, message: string } {
        if (!this.tdei_service_id || this.tdei_service_id == "0")
            return { valid: false, message: "Service Id not provided." };

        //default true
        return { valid: true, message: "" };
    }

    /**
   * Builds the insert QueryConfig object
   * @returns QueryConfig object
   */
    getUpdateQuery(): QueryConfig {
        const queryObject = {
            text: `UPDATE service set name = $2 ${this.polygon ? ', polygon = ST_GeomFromGeoJSON($3) ' : ''} WHERE service_id = $1`,
            values: [this.tdei_service_id, this.service_name],
        }

        //3rd param
        if (this.polygon) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
        }
        return queryObject;
    }
}
