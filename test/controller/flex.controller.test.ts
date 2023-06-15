import { getMockReq, getMockRes } from "@jest-mock/express";
import flexServiceController from "../../src/controller/flex-service-controller";
import { DuplicateException, ForeignKeyException } from "../../src/exceptions/http/http-exceptions";
import flexService from "../../src/service/flex-service";
import { ServiceDto } from "../../src/model/dto/service-dto";

// group test using describe
describe("Flex Controller Test", () => {

    describe("Create Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new service_id", async () => {
                //Arrange
                let req = getMockReq({ body: { service_name: "test_service", tdei_org_id: "test_org_id" } });
                const { res, next } = getMockRes();
                const createServiceSpy = jest
                    .spyOn(flexService, "createService")
                    .mockResolvedValueOnce("new_service_id");
                //Act
                await flexServiceController.createService(req, res, next);
                //Assert
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "new_service_id" });
            });

            test("When database foreignkey constraint exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const createServiceSpy = jest
                    .spyOn(flexService, "createService")
                    .mockRejectedValueOnce(new ForeignKeyException("exception"));
                //Act
                await flexServiceController.createService(req, res, next);
                //Assert
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database uniquekey constraint (same service_name + org_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const createServiceSpy = jest
                    .spyOn(flexService, "createService")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await flexServiceController.createService(req, res, next);
                //Assert
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const createServiceSpy = jest
                    .spyOn(flexService, "createService")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await flexServiceController.createService(req, res, next);
                //Assert
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Update Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ body: { service_name: "test_service", service_id: "test_service_id" } });
                const { res, next } = getMockRes();
                const updateServiceSpy = jest
                    .spyOn(flexService, "updateService")
                    .mockResolvedValueOnce(true);
                //Act
                await flexServiceController.updateService(req, res, next);
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database uniquekey constraint (same service_name + org_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { service_name: "test_service", service_id: "test_service_id" } });
                const { res, next } = getMockRes();
                const updateServiceSpy = jest
                    .spyOn(flexService, "updateService")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await flexServiceController.updateService(req, res, next);
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { service_name: "test_service", service_id: "test_service_id" } });
                const { res, next } = getMockRes();
                const updateServiceSpy = jest
                    .spyOn(flexService, "updateService")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await flexServiceController.updateService(req, res, next);
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });

            test("When service_id not provided, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { service_name: "test_service" } });
                const { res, next } = getMockRes();
                //Act
                await flexServiceController.updateService(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Get Flex Service", () => {
        describe("Functional", () => {
            test("When requested without any filter, Expect to return flex service list", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                var list = [new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id"
                })];
                const getServiceSpy = jest
                    .spyOn(flexService, "getService")
                    .mockResolvedValueOnce(list);
                //Act
                await flexServiceController.getService(req, res, next);
                //Assert
                expect(getServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When requested with all filters, Expect to return flex service list", async () => {
                //Arrange

                let req = getMockReq({
                    query: {
                        searchText: "test",
                        tdei_service_id: "tdei_service_id",
                        tdei_org_id: "tdei_org_id",
                        bbox: <any>[23, 43, 45, 67],
                        page_no: "1",
                        page_size: "10"
                    }
                });
                const { res, next } = getMockRes();
                var list = [new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id"
                })];
                const getServiceSpy = jest
                    .spyOn(flexService, "getService")
                    .mockResolvedValueOnce(list);
                //Act
                await flexServiceController.getService(req, res, next);
                //Assert
                expect(getServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const getServiceSpy = jest
                    .spyOn(flexService, "getService")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await flexServiceController.getService(req, res, next);
                //Assert
                expect(getServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Update Service Status", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ serviceId: "test_serviceId", status: "true" } });
                const { res, next } = getMockRes();
                const updateServiceSpy = jest
                    .spyOn(flexService, "setServiceStatus")
                    .mockResolvedValueOnce(true);
                //Act
                await flexServiceController.deleteService(req, res, next);
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ serviceId: "test_serviceId", status: "true" } });
                const { res, next } = getMockRes();
                const updateServiceSpy = jest
                    .spyOn(flexService, "setServiceStatus")
                    .mockRejectedValueOnce(new Error());
                //Act
                await flexServiceController.deleteService(req, res, next);
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });
});