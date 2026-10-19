import { UserApplicationRolesDto } from "./application-dto";

export class TdeiUserDto {
    id!: string;
    firstName!: string;
    lastName!: string;
    username!: string;
    applicationRoles!: UserApplicationRolesDto[];

    constructor(init?: Partial<TdeiUserDto>) {
        Object.assign(this, init);
    }
}
