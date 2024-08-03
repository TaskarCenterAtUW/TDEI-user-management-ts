import fetch from "node-fetch";
import { environment } from "../environment/environment";
import HttpException from "../exceptions/http/http-base-exception";
import express, { NextFunction, Request } from "express";

export class Utility {

    public static handleError(
        response: express.Response,
        next: NextFunction,
        exception: any, errorMessage: string) {

        console.error(errorMessage, exception);

        if (exception instanceof HttpException) {
            response.status(exception.status).send(exception.message);
            next(new HttpException(exception.status, exception.message));
        }
        else {
            response.status(500).send(errorMessage);
            next(new HttpException(500, errorMessage));
        }
    }

    public static extractToken(req: any) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }

    public static extractSecret(req: any) {
        if (req.headers['x-secret']) {
            return req.headers['x-secret'];
        }
        return null;
    }

    public static extractApiKey(req: any) {
        if (req.headers['x-api-key']) {
            return req.headers['x-api-key'];
        }
        return null;
    }

    public static dateIsValid(dateStr: any): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (dateStr.match(regex) === null) {
            return false;
        }

        const date = new Date(dateStr);

        const timestamp = date.getTime();

        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
            return false;
        }

        return date.toISOString().startsWith(dateStr);
    }

    public static copy<T extends Object>(target: T, source: any): T {
        Object.keys(target).forEach(key => {
            if (source[key] != undefined) {
                target[key as keyof Object] = source[key];
            }
        }
        );
        return target;
    }

    public static async verifySecret(secretToken: string): Promise<boolean> {
        let secret = null;
        try {
            const result = await fetch(environment.secretVerifyUrl as string, {
                method: 'put',
                body: JSON.stringify(secretToken),
                headers: { 'Content-Type': 'application/json' }
            });

            if (result.status != undefined && result.status != 200)
                throw new Error(await result.json());

            const data = await result.json();

            secret = data;
        } catch (error: any) {
            console.error(error);
            throw new HttpException(400, "Failed to verify secret token");
        }
        return secret;
    }

    public static async verifyApiKey(apiKey: string): Promise<boolean> {
        let secret = null;
        try {
            const result = await fetch(environment.apiKeyVerifyUrl as string, {
                method: 'post',
                body: JSON.stringify(apiKey),
                headers: { 'Content-Type': 'text/plain' }
            });

            if (result.status != undefined && result.status != 200)
                throw new Error(await result.json());

            const data = await result.json();

            secret = data;
        } catch (error: any) {
            console.error(error);
            throw new HttpException(400, "Failed to verify api key");
        }
        return secret;
    }
}