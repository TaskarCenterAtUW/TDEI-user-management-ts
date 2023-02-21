import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";
import { OrganizationDto } from "./organization-dto";

export class OrganizationPOCDto extends BaseDto {
    @Prop()
    first_name!: string;
    @Prop()
    last_name!: string;
    @Prop()
    username!: string;
    @Prop()
    email!: string;
    constructor(init?: Partial<OrganizationPOCDto>) {
        super();
    }
}

