import { Request } from "express";

/**
 * Relative RFC 8288 link to the next page. A missing or unparseable request URL
 * omits the header instead of failing the list response.
 */
export function nextPageLink(request: Request, pageNo: number, pageSize: number): string | undefined {
    const rawUrl = request.originalUrl || request.url;
    if (!rawUrl) {
        return undefined;
    }

    try {
        const url = new URL(rawUrl, "http://localhost");
        url.searchParams.set("page_no", String(pageNo + 1));
        url.searchParams.set("page_size", String(pageSize));
        const link = `<${url.pathname}${url.search}>; rel="next"`;
        if (/[\r\n]/.test(link)) {
            return undefined;
        }
        return link;
    } catch {
        return undefined;
    }
}
