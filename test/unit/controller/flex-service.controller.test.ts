import { NextFunction, Request, Response } from "express";
import flexServiceController from "../../../src/controller/flex-service-controller";
import flexService from "../../../src/service/flex-service";
import { ServiceDto } from "../../../src/model/dto/service-dto";
import { ServiceListPage } from "../../../src/service/interface/flex-service-interface";
import { Utility } from "../../../src/utility/utility";

describe("FlexServiceController getService pagination headers", () => {
    const createResponse = (): Response => ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
    } as unknown as Response);

    const createNext = (): NextFunction => jest.fn();

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("returns the page array and total headers without a next link on the last page", async () => {
        const items = [new ServiceDto({ service_name: "Ada" })];
        const page: ServiceListPage = {
            items,
            totalCount: 50,
            pageNo: 1,
            pageSize: 50,
        };
        const getSpy = jest.spyOn(flexService, "getService").mockResolvedValueOnce(page);
        const request = {
            query: { searchText: "Ada", service_type: "flex" },
            originalUrl: "/api/v1/service?searchText=Ada&service_type=flex",
        } as unknown as Request;
        const response = createResponse();

        await flexServiceController.getService(request, response, createNext());

        expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({
            searchText: "Ada",
            service_type: "flex",
            page_no: 1,
            page_size: 10,
        }));
        expect(response.setHeader).toHaveBeenCalledWith("X-Total-Count", "50");
        expect(response.setHeader).toHaveBeenCalledWith("X-Page-No", "1");
        expect(response.setHeader).toHaveBeenCalledWith("X-Page-Size", "50");
        expect(response.setHeader).not.toHaveBeenCalledWith("Link", expect.anything());
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith(items);
    });

    test("adds a relative next link when another page exists and keeps the other filters", async () => {
        const items = [new ServiceDto({ service_name: "Ada" })];
        const page: ServiceListPage = {
            items,
            totalCount: 134,
            pageNo: 2,
            pageSize: 50,
        };
        jest.spyOn(flexService, "getService").mockResolvedValueOnce(page);
        const request = {
            query: { searchText: "Ada", service_type: "osw", page_no: "2", page_size: "50" },
            originalUrl: "/api/v1/service?searchText=Ada&service_type=osw&page_no=2&page_size=50",
        } as unknown as Request;
        const response = createResponse();

        await flexServiceController.getService(request, response, createNext());

        expect(response.setHeader).toHaveBeenCalledWith("X-Total-Count", "134");
        expect(response.setHeader).toHaveBeenCalledWith("X-Page-No", "2");
        expect(response.setHeader).toHaveBeenCalledWith("X-Page-Size", "50");
        expect(response.setHeader).toHaveBeenCalledWith(
            "Link",
            "</api/v1/service?searchText=Ada&service_type=osw&page_no=3&page_size=50>; rel=\"next\""
        );
        expect(response.send).toHaveBeenCalledWith(items);
    });

    test("does not write page headers when the list fails", async () => {
        jest.spyOn(flexService, "getService").mockRejectedValueOnce(new Error("db down"));
        const handleErrorSpy = jest.spyOn(Utility, "handleError").mockImplementation(() => undefined);
        const response = createResponse();

        await flexServiceController.getService({ query: {} } as unknown as Request, response, createNext());

        expect(handleErrorSpy).toHaveBeenCalled();
        expect(response.setHeader).not.toHaveBeenCalled();
        expect(response.send).not.toHaveBeenCalled();
    });
});
