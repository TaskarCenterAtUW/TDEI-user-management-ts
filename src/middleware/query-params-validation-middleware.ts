import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '../exceptions/http/http-base-exception';
import { AbstractDomainEntity } from 'nodets-ms-core/lib/models';

function queryValidationMiddleware<T extends AbstractDomainEntity>(type: { new(args: T): T; }): RequestHandler {
    return (req, res, next) => {
        validate(new type(req.query as any)).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const message = errors.map((error: ValidationError) => Object.values(error.constraints || {})).join(', ');
                next(new HttpException(400, message));
            } else {
                next();
            }
        });
    };
}

export default queryValidationMiddleware;