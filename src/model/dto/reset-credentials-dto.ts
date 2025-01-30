import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class ResetCredentialsDto extends BaseDto {
    @IsNotEmpty()
    @IsEmail()
    @Prop()
    @MaxLength(255)
    username!: string;
    @IsNotEmpty()
    @Prop()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])(?!.*\s).{8,255}$/,
        {
            message: 'Password policy not satisfied. min 8, max 255 characters length, atleast 1 letter in Upper Case, atleast 1 Special Character, atleast 1 numeral (0-9)',
        }
    )
    password!: string;

    constructor(init?: Partial<ResetCredentialsDto>) {
        super();
        Object.assign(this, init);
    }
}