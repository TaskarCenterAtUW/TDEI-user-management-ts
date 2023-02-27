import { IsNotEmpty } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class PocRequestDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    org_id!: string;
    @IsNotEmpty()
    @Prop()
    poc_user_name!: string;

    constructor(init?: Partial<PocRequestDto>) {
        super();
        Object.assign(this, init);
    }
}