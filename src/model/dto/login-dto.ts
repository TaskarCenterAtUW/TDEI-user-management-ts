import { IsNotEmpty } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class LoginDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    username!: string;
    @IsNotEmpty()
    @Prop()
    password!: string;

    constructor(init?: Partial<LoginDto>) {
        super();
        Object.assign(this, init);
    }
}