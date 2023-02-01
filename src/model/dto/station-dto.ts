import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { Coordinates } from "../polygon-model";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";

export class StationDto extends BaseDto {
    station_id: string = "0";
    @IsNotEmpty()
    org_id!: string;
    @IsNotEmpty()
    name!: string;
    @IsOptional()
    @IsValidPolygon()
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    coordinates!: Coordinates[];

    constructor(init?: Partial<StationDto>) {
        super();
        Object.assign(this, init);
    }
}