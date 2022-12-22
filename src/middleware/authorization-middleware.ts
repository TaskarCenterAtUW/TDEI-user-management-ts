import { RequestHandler } from 'express';
import HttpException from '../exceptions/http/http-base-exception';
import fetch, { Response } from 'node-fetch';
import config from 'config';
import jwt_decode from 'jwt-decode';
import { UnAuthenticated } from '../exceptions/http/http-exceptions';

const permissionUrl: string = config.get('url.permission');

function authorizationMiddleware(roles: string[], validateOrg?: boolean): RequestHandler {
    return async (req, res, next) => {

        let authToken = extractToken(req);

        if (authToken == null) {
            next(new UnAuthenticated());
        }
        else {
            var decoded: any = jwt_decode(authToken);

            var url = new URL(permissionUrl);
            let params = new URLSearchParams();
            params.append("userId", decoded.sub);
            req.userId = decoded.sub;
            if (validateOrg) {
                let org_id = req.body.org_id;
                params.append("agencyId", org_id);
            }

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
                        next(new UnAuthenticated());
                }
            } catch (error: any) {
                console.error(error);
                next(new HttpException(500, "Error authorizing the request."));
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