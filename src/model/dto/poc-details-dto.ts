import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";
import { OrganizationDto } from "./organization-dto";

export class PocDetails extends BaseDto {
    @Prop()
    first_name!: string;
    @Prop()
    last_name!: string;
    @Prop()
    username!: string;
    @Prop()
    email!: string;
    constructor(init?: Partial<PocDetails>) {
        super();
    }
}

export class OrganizationListResponse extends OrganizationDto {
    @Prop()
    poc!: PocDetails[];
}

