import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Length } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class ApplicationRolesReqDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    @Length(36, 36, {
        message: "userId must be the id returned by the user search",
    })
    userId!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Prop()
    roles!: string[];

    constructor(init?: Partial<ApplicationRolesReqDto>) {
        super();
        Object.assign(this, init);
    }
}
