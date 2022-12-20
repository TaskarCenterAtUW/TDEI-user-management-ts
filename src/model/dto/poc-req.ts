import { IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";

export class PocRequestDto extends BaseDto {
    @IsNotEmpty()
    org_id!: string;
    @IsNotEmpty()
    poc_user_name!: string;

    constructor(init?: Partial<PocRequestDto>) {
        super();
        Object.assign(this, init);
    }
}