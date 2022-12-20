import { RequestHandler } from 'express';
import HttpException from '../exceptions/http/http-base-exception';
import fetch, { Response } from 'node-fetch';
import config from 'config';
import jwt_decode from 'jwt-decode';

const permissionUrl: string = config.get('url.permission');

function authorizationMiddleware(roles: string[], org_id?: string): RequestHandler {
    return async (req, res, next) => {

        let authToken = extractToken(req);

        if (authToken == null) {
            next(new HttpException(401, "Unauthorized access."));
        }
        else {
            var decoded: any = jwt_decode(authToken);

            var url = new URL(permissionUrl);
            let params = new URLSearchParams();
            params.append("userId", decoded.sub);
            params.append("agencyId", org_id ?? "");
            params.append("affirmative", "false");
            roles.forEach(x => params.append("roles", x));
            url.search = params.toString();

            try {
                const resp: Response = await fetch(url);
                if (!resp.ok) {
                    throw new Error();
                }
                else {
                    var satisfied: boolean = await resp.json();
                    if (satisfied)
                        next();
                    else
                        next(new HttpException(401, "Unauthorized access."));
                }
            } catch (error: any) {
                console.error(error);
                next(new HttpException(400, "Error authorizing the request."));
            }
        }
    };
}

function extractToken(req: any) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}

export default authorizationMiddleware;