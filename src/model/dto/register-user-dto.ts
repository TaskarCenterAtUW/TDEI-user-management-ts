import { IsEmail, IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";

export class RegisterUserDto extends BaseDto {
    firstName!: string;
    lastName!: string;
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    phone!: string;
    @IsNotEmpty()
    password!: string;

    constructor(init?: Partial<RegisterUserDto>) {
        super();
        Object.assign(this, init);
    }
}