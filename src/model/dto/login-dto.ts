import { IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    username!: string;
    @IsNotEmpty()
    password!: string;

    constructor(init?: Partial<LoginDto>) {
        Object.assign(this, init);
    }
}