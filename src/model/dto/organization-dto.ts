import { IsNotEmpty, ValidateNested } from "class-validator";
import { Coordinates, Polygon } from "../polygon-model";
import { IsValidPolygon } from "../validators/polygon-validator";
import { BaseDto } from "./base-dto";
import { Type } from 'class-transformer';

export class OrganizationDto extends BaseDto {
    id: string = "0";
    @IsNotEmpty()
    name!: string;
    @IsNotEmpty()
    phone!: string;
    url!: string;
    @IsNotEmpty()
    address!: string;
    @IsValidPolygon()
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    coordinates!: Coordinates[];

    constructor(init?: Partial<OrganizationDto>) {
        super();
        Object.assign(this, init);
    }
}