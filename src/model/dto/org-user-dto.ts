import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class OrgUserDto extends BaseDto {
    @Prop()
    user_id!: string;
    @Prop()
    first_name!: string;
    @Prop()
    last_name!: string;
    @Prop()
    email!: string;
    @Prop()
    username!: string;
    @Prop()
    phone!: string;
    @Prop()
    roles!: string[];
    constructor(init?: Partial<OrgUserDto>) {
        super();
        Object.assign(this, init);
    }
}