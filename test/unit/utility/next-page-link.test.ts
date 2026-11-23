import { Request } from "express";
import { nextPageLink } from "../../../src/utility/next-page-link";

function requestOf(originalUrl?: string, url?: string): Request {
    return { originalUrl, url } as Request;
}

describe("nextPageLink", () => {
    test("builds a relative next link and keeps the other filters", () => {
        const link = nextPageLink(
            requestOf("/api/v1/project-group?searchText=Ada&page_no=2&page_size=50"),
            2,
            50
        );

        expect(link).toBe("</api/v1/project-group?searchText=Ada&page_no=3&page_size=50>; rel=\"next\"");
    });

    test("returns undefined when the request has no URL", () => {
        expect(nextPageLink(requestOf("", ""), 1, 10)).toBeUndefined();
    });

    test("returns undefined when the request URL cannot be parsed", () => {
        expect(nextPageLink(requestOf("http://["), 2, 50)).toBeUndefined();
    });
});
