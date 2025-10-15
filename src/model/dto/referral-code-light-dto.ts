import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";

export class ReferralCodeLiteDto extends BaseDto {

    @Prop()
    name!: string;

    @Prop()
    type!: number;

    @Prop()
    valid_from!: string;

    @Prop()
    valid_to?: string | null;

    @Prop()
    code!: string;

    @Prop()
    instructions_url?: string | null;

    @Prop()
    description?: string | null;

    @Prop()
    redirect_url!: string;

    constructor(init?: Partial<ReferralCodeLiteDto>) {
        super();
        Object.assign(this, init);
    }
}