import { IsNotEmpty, IsOptional } from "class-validator";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { FeatureCollection } from "geojson";

export class ProjectGroupDto extends BaseDto {
    @Prop()
    tdei_project_group_id: string = "0";
    @IsNotEmpty()
    @Prop()
    project_group_name!: string;
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
    polygon!: FeatureCollection;

    constructor(init?: Partial<ProjectGroupDto>) {
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
            text: `INSERT INTO projectgroup(name, phone, url, address ${polygonExists ? ', polygon ' : ''}) VALUES($1, $2, $3, $4 ${polygonExists ? ', ST_GeomFromGeoJSON($5) ' : ''}) RETURNING projectgroup.project_group_id`,
            values: [this.project_group_name, this.phone, this.url, this.address],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
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
            text: `UPDATE projectgroup set name = $1, phone = $2, url = $3, address = $4 ${polygonExists ? ', polygon = ST_GeomFromGeoJSON($6) ' : ''} WHERE project_group_id = $5`,
            values: [this.project_group_name, this.phone, this.url, this.address, this.tdei_project_group_id],
        }
        if (polygonExists) {
            queryObject.values.push(JSON.stringify(this.polygon.features[0].geometry));
        }
        return queryObject;
    }
}