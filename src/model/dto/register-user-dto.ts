import { IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";

export class RegisterUserDto extends BaseDto {
    firstName!: string;
    lastName!: string;
    @IsNotEmpty()
    email!: string;
    phone!: string;

    constructor(init?: Partial<RegisterUserDto>) {
        super();
        Object.assign(this, init);
    }
}