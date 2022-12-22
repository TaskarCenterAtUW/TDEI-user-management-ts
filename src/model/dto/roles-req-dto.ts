import { IsArray, IsIn, IsNotEmpty, IsNumber } from "class-validator";
import { BaseDto } from "./base-dto";

export class RolesReqDto extends BaseDto {
    @IsNotEmpty()
    org_id!: string;
    @IsNotEmpty()
    user_name!: string;
    @IsNotEmpty({ each: true })
    @IsArray()
    roles!: string[];

    constructor(init?: Partial<RolesReqDto>) {
        super();
        Object.assign(this, init);
    }
}