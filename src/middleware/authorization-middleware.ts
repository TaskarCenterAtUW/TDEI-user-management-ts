import { RequestHandler } from 'express';
import HttpException from '../exceptions/http/http-base-exception';
import fetch, { Response } from 'node-fetch';
import jwt_decode from 'jwt-decode';
import { Forbidden, UnAuthenticated } from '../exceptions/http/http-exceptions';
import { UserProfile } from '../model/dto/user-profile-dto';
import { Utility } from '../utility/utility';
import { environment } from '../environment/environment';

function authorizationMiddleware(roles: string[], validateProjectGroup?: boolean, allowInraCom?: boolean): RequestHandler {
    return async (req, res, next) => {

        const authToken = Utility.extractToken(req);

        if (roles.length > 0 && authToken == null) {
            next(new Forbidden());
            return;
        }

        if (authToken == null) {

            if (allowInraCom) {
                //Check if intranet communication
                const secretToken = Utility.extractSecret(req);
                if (secretToken != null) {
                    const isValidated = await Utility.verifySecret(secretToken);
                    if (isValidated) {
                        next(); return;
                    }
                }
            }
            if (Utility.extractApiKey(req) != null) {
                //Check if intranet communication
                const apiKey = Utility.extractApiKey(req);
                if (apiKey != null) {
                    const isValidated = await Utility.verifyApiKey(apiKey);
                    if (isValidated) {
                        next(); return;
                    }
                }
            }

            next(new UnAuthenticated());
            return;
        }
        else {

            try {
                //Set request context
                req.userProfile = await validateAccessToken(authToken);

                if (roles.length > 0) {
                    const decoded: any = jwt_decode(authToken);

                    const url = new URL(environment.permissionUrl as string);
                    const params = new URLSearchParams();
                    params.append("userId", decoded.sub);
                    //Set request context
                    req.userId = decoded.sub;
                    if (validateProjectGroup) {
                        const projectGroup_id = req.params.projectGroupId ? req.params.projectGroupId : req.body.tdei_project_group_id;
                        params.append("projectGroupId", projectGroup_id);
                    }

                    params.append("affirmative", "false");
                    roles.forEach(x => params.append("roles", x));
                    url.search = params.toString();


                    const resp: Response = await fetch(url);
                    if (!resp.ok) {
                        throw new Error();
                    }
                    else {
                        const satisfied: boolean = await resp.json();
                        if (satisfied) {
                            next();
                            return;
                        }
                        else
                            next(new Forbidden());
                    }
                }
                next();
            }
            catch (error: any) {
                console.error(error);
                if (error instanceof HttpException) {
                    next(error);
                }
                else {
                    next(new HttpException(500, "Error authorizing the request."));
                }
            }
        }
    };
}

export async function validateAccessToken(token: string): Promise<UserProfile> {
    let userProfile = new UserProfile();
    try {
        const result = await fetch(environment.validateAccessTokenUrl as string, {
            method: 'post',
            body: JSON.stringify(token),
            headers: { 'Content-Type': 'text/plain' }
        });

        const data = await result.json();

        if (result.status != undefined && result.status != 200)
            throw new Error(data);

        userProfile = new UserProfile(data);
    } catch (error: any) {
        console.error(error);
        throw new UnAuthenticated();
    }
    return userProfile;
}


export default authorizationMiddleware;