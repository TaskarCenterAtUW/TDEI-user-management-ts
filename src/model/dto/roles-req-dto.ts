import { IsArray, IsIn, IsNotEmpty } from "class-validator";
import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class RolesReqDto extends BaseDto {
    @IsNotEmpty()
    @Prop()
    tdei_project_group_id!: string;
    @IsNotEmpty()
    @Prop()
    user_name!: string;
    @IsNotEmpty({ each: true })
    @IsArray()
    @Prop()
    roles!: string[];

    constructor(init?: Partial<RolesReqDto>) {
        super();
        Object.assign(this, init);
    }
}