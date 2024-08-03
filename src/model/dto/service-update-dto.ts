import { IsNotEmpty, IsOptional } from "class-validator";
import { FeatureCollection } from "geojson";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class ServiceUpdateDto extends BaseDto {
    @Prop("tdei_service_id")
    @Prop()
    service_id: string = "0";
    @IsNotEmpty()
    @Prop("service_name")
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
        if (!this.service_id || this.service_id == "0")
            return { valid: false, message: "Station Id not provided." };

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
            values: [this.service_id, this.service_name],
        }

        //3rd param
        if (this.polygon) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
        }
        return queryObject;
    }
}
