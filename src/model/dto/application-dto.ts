export class ApplicationDto {
    realm!: string;
    clientId!: string;
    name!: string;
    description!: string;

    constructor(init?: Partial<ApplicationDto>) {
        Object.assign(this, init);
    }
}

export class ApplicationRoleDto {
    name!: string;
    description!: string;

    constructor(init?: Partial<ApplicationRoleDto>) {
        Object.assign(this, init);
    }
}

export class UserClientRolesDto {
    userId!: string;
    clientId!: string;
    roles!: string[];

    constructor(init?: Partial<UserClientRolesDto>) {
        Object.assign(this, init);
    }
}

export class UserApplicationRolesDto {
    realm!: string;
    clientId!: string;
    name!: string;
    roles!: string[];

    constructor(init?: Partial<UserApplicationRolesDto>) {
        Object.assign(this, init);
    }
}
