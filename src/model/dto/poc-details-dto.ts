import { Prop } from "nodets-ms-core/lib/models";
import { BaseDto } from "./base-dto";
import { ProjectGroupDto } from "./project-group-dto";

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

export class ProjectGroupListResponse extends ProjectGroupDto {
    @Prop()
    poc!: PocDetails[];
}

