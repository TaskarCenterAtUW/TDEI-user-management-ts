export class RoleDto {
    name!: string;
    description!: string;

    constructor(init?: Partial<RoleDto>) {
        Object.assign(this, init);
    }
}