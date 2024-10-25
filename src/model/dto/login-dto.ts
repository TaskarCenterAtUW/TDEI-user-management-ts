import { IsNotEmpty, Length, MaxLength } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class LoginDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    @MaxLength(255)
    username!: string;
    @IsNotEmpty()
    @Prop()
    @MaxLength(255)
    password!: string;

    constructor(init?: Partial<LoginDto>) {
        super();
        Object.assign(this, init);
    }
}