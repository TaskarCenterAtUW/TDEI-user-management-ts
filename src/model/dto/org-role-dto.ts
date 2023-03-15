export class OrgRoleDto {
    tdei_org_id!: string;
    org_name!: string;
    roles!: string[];

    constructor(init?: Partial<OrgRoleDto>) {
        Object.assign(this, init);
    }
}