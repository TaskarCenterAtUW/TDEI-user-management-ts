export class RoleDto {
    id!: string;
    name!: string;
    description!: string;

    constructor(init?: Partial<RoleDto>) {
        Object.assign(this, init);
    }
}