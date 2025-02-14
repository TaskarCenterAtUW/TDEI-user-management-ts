import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, Length, MaxLength, Validate } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";
import { IsStringArrayLength } from "../../utility/utility";

export class RolesReqDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    @Length(36, 36, {
        message: 'tdei_project_group_id must be 36 characters long (UUID)',
    })
    tdei_project_group_id!: string;
    @IsNotEmpty()
    @Prop()
    @MaxLength(255)
    user_name!: string;
    @IsArray()
    @Prop()
    roles!: string[];

    constructor(init?: Partial<RolesReqDto>) {
        super();
        Object.assign(this, init);
    }
}