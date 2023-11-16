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

        let authToken = Utility.extractToken(req);

        if (authToken == null) {

            if (allowInraCom) {
                //Check if intranet communication
                let secretToken = Utility.extractSecret(req);
                if (secretToken != null) {
                    let isValidated = await Utility.verifySecret(secretToken);
                    if (isValidated) {
                        next(); return;
                    }
                }
            }
            if (Utility.extractApiKey(req) != null) {
                //Check if intranet communication
                let apiKey = Utility.extractApiKey(req);
                if (apiKey != null) {
                    let isValidated = await Utility.verifyApiKey(apiKey);
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
                var userProfile = await validateAccessToken(authToken);
                //Set request context
                req.userProfile = userProfile;

                if (roles.length > 0) {
                    var decoded: any = jwt_decode(authToken);

                    var url = new URL(environment.permissionUrl as string);
                    let params = new URLSearchParams();
                    params.append("userId", decoded.sub);
                    //Set request context
                    req.userId = decoded.sub;
                    if (validateProjectGroup) {
                        let projectGroup_id = req.params.projectGroupId ? req.params.projectGroupId : req.body.tdei_project_group_id;
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
                        var satisfied: boolean = await resp.json();
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

async function validateAccessToken(token: String): Promise<UserProfile> {
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