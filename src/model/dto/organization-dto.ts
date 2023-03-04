import { IsNotEmpty, IsOptional } from "class-validator";
import { Polygon } from "../polygon-model";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";
import { Prop } from "nodets-ms-core/lib/models";
import { PolygonDto } from "../polygon-model";
import { QueryConfig } from "pg";

export class OrganizationDto extends BaseDto {
    @Prop()
    org_id: string = "0";
    @IsNotEmpty()
    @Prop()
    name!: string;
    @Prop()
    @IsNotEmpty()
    phone!: string;
    @Prop()
    url!: string;
    @IsNotEmpty()
    @Prop()
    address!: string;
    @IsOptional()
    @IsValidPolygon()
    @Prop()
    polygon!: PolygonDto;

    constructor(init?: Partial<OrganizationDto>) {
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
            text: `INSERT INTO organization(name, phone, url, address ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2, $3, $4 ${polygonExists ? ', ST_GeomFromGeoJSON($5) ' : ''}) RETURNING organization.org_id`,
            values: [this.name, this.phone, this.url, this.address],
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
            text: `UPDATE organization set name = $1, phone = $2, url = $3, address = $4 ${polygonExists ? ', polygon = $6 ' : ''} WHERE org_id = $5`,
            values: [this.name, this.phone, this.url, this.address, this.org_id],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(new Polygon({ coordinates: this.polygon.coordinates })));
        }
        return queryObject;
    }
}