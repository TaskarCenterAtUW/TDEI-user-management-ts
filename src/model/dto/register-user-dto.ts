import { IsEmail, IsNotEmpty, Matches } from "class-validator";
import { BaseDto } from "./base-dto";

export class RegisterUserDto extends BaseDto {
    firstName!: string;
    lastName!: string;
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    phone!: string;
    @IsNotEmpty()
    @Matches('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$', "", {
        message: `Password policy not satisfied. >8 characters length, atleast 1 letter in Upper Case, atleast 1 Special Character (!@#$&*()), atleast 1 numeral (0-9)
`})
    password!: string;

    constructor(init?: Partial<RegisterUserDto>) {
        super();
        Object.assign(this, init);
    }
}