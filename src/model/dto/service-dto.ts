import { IsNotEmpty, IsNumber } from "class-validator";
import { BaseDto } from "./base-dto";

export class ServiceDto extends BaseDto {
    @IsNotEmpty()
    org_id!: string;
    @IsNotEmpty()
    name!: string;
    description!: string;

    constructor(init?: Partial<ServiceDto>) {
        super();
        Object.assign(this, init);
    }
}
