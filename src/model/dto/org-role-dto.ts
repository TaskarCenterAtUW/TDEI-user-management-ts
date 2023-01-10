export class OrgRoleDto {
    orgId!: string;
    orgName!: string;
    roles!: string[];

    constructor(init?: Partial<OrgRoleDto>) {
        Object.assign(this, init);
    }
}