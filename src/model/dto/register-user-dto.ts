import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class RegisterUserDto extends BaseDto {
    @Prop()
    @Length(0, 255)
    firstName!: string;
    @Prop()
    @Length(0, 255)
    lastName!: string;
    @IsNotEmpty()
    @IsEmail()
    @Prop()
    @Length(0, 255)
    email!: string;
    @Prop()
    @Length(0, 20)
    phone!: string;
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,70}$/, {
        message: 'Password must be 8-70 characters long, include at least one uppercase letter, one number, and one special character.',
    })
    @Prop()
    password!: string;

    constructor(init?: Partial<RegisterUserDto>) {
        super();
        Object.assign(this, init);
    }
}