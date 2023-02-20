import { IsNotEmpty, IsOptional } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { Polygon, PolygonDto } from "../polygon-model";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class ServiceDto extends BaseDto {
    @Prop()
    service_id: string = "0";
    @IsNotEmpty()
    @Prop()
    owner_org!: string;
    @IsNotEmpty()
    @Prop()
    name!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: PolygonDto;

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
            text: `INSERT INTO service(name, owner_org ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2 ${polygonExists ? ', ST_GeomFromGeoJSON($3) ' : ''})  RETURNING service.service_id`,
            values: [this.name, this.owner_org],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(new Polygon({ coordinates: this.polygon.coordinates })));
        }
        return queryObject;
    }

    /**
   * Builds the insert QueryConfig object
   * @returns QueryConfig object
   */
    getUpdateQuery(): QueryConfig {
        let polygonExists = this.polygon ? true : false;
        const queryObject = {
            text: `UPDATE service set name = $1 ${polygonExists ? ', polygon = $3 ' : ''} WHERE service_id = $2`,
            values: [this.name, this.service_id],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(new Polygon({ coordinates: this.polygon.coordinates })));
        }
        return queryObject;
    }
}
