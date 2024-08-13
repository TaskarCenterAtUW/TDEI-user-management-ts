import { IsNotEmpty } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class ResetCredentialsDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    username!: string;
    @IsNotEmpty()
    @Prop()
    password!: string;

    constructor(init?: Partial<ResetCredentialsDto>) {
        super();
        Object.assign(this, init);
    }
}