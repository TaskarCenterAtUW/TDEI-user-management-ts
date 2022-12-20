import { IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";

export class OrganizationDto extends BaseDto {
    @IsNotEmpty()
    name!: string;
    @IsNotEmpty()
    phone!: string;
    url!: string;
    @IsNotEmpty()
    address!: string;

    constructor(init?: Partial<OrganizationDto>) {
        super();
        Object.assign(this, init);
    }
}