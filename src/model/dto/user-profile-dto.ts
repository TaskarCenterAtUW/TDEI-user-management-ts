export class UserProfile {
    id!: string
    firstName!: string
    lastName!: string
    email!: string
    phone!: any
    emailVerified!: boolean
    username!: string
    apiKey!: string;
    constructor(init?: Partial<UserProfile>) {
        Object.assign(this, init);
    }
}
