import { IsNotEmpty, IsOptional } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { Polygon, PolygonDto } from "../polygon-model";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class ServiceUpdateDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    service_id: string = "0";
    @IsNotEmpty()
    @Prop()
    name!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: PolygonDto;

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
            text: `UPDATE service set name = $2 ${this.polygon ? ', polygon = $3 ' : ''} WHERE service_id = $1`,
            values: [this.service_id, this.name],
        }

        //3rd param
        if (this.polygon) {
            queryObject.values.push(JSON.stringify(new Polygon({ coordinates: this.polygon.coordinates })));
        }
        return queryObject;
    }
}
