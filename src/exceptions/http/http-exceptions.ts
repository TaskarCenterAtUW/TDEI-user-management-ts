import HttpException from "./http-base-exception";
import { Response } from "express";

export class DuplicateException extends HttpException {
    constructor(name: string) {
        super(400, `${name}`);
    }
}

export class UnAuthenticated extends HttpException {
    constructor() {
        super(401, `Invalid/Expired token.`);
    }
}

export class Forbidden extends HttpException {
    constructor() {
        super(403, `User not authorized to perform this action.`);
    }
}

export class ForeignKeyException extends HttpException {
    constructor(name: string) {
        super(400, `No reference found for the constraint '${name}' in the system.`);
    }
}

export class UserNotFoundException extends HttpException {
    constructor(name: string) {
        super(404, `User '${name}' not part of the system.`);
    }
}

export class NoDataUpdatedException extends HttpException {
    constructor() {
        super(400, `Data not updated, may be input prams not valid.`);
    }
}

export class InputException extends HttpException {
    constructor(message: string, response?: Response) {
        response?.status(400).send(message);
        super(400, message);
    }
}


