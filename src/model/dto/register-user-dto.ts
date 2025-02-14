import { IsEmail, IsNotEmpty, IsOptional, Length, length, Matches, MaxLength, MinLength } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class RegisterUserDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    @MaxLength(255)
    firstName!: string;
    @Prop()
    @MaxLength(255)
    @IsOptional()
    lastName!: string;
    @IsNotEmpty()
    @IsEmail()
    @Prop()
    @MaxLength(255)
    email!: string;
    @Prop()
    @MaxLength(15)
    @IsOptional()
    phone!: string;
    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])(?!.*\s).{8,255}$/,
        {
            message: 'Password policy not satisfied. min 8, max 255 characters length, atleast 1 letter in Upper Case, atleast 1 Special Character, atleast 1 numeral (0-9)',
        }
    )
    @Prop()
    password!: string;

    constructor(init?: Partial<RegisterUserDto>) {
        super();
        Object.assign(this, init);
    }
}