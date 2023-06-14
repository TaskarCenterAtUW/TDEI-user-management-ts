import { DuplicateException, ForeignKeyException } from "../../src/exceptions/http/http-exceptions";
import flexService from "../../src/service/flex-service";
import { ServiceDto } from "../../src/model/dto/service-dto";
import dbClient from "../../src/database/data-source";
import { DatabaseError, QueryResult } from "pg";
import UniqueKeyDbException, { ForeignKeyDbException } from "../../src/exceptions/db/database-exceptions";
import { ServiceUpdateDto } from "../../src/model/dto/service-update-dto";
import { ServiceQueryParams } from "../../src/model/params/service-get-query-params";
import { TestHelper } from "../common/test-helper";

// group test using describe
describe("Flex Service Test", () => {

    describe("Create Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return service list", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id",
                });
                let response = <QueryResult>{
                    rows: [
                        { service_id: "new_service_id" }
                    ]
                }
                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await flexService.createService(input)).toBe("new_service_id");
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("Duplicate service name"));
                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(DuplicateException);
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When foreign key exception thrown, Expect to return ForeignKeyException", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new ForeignKeyDbException("Contraint error"));
                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(ForeignKeyException);
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("DB error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(Error);
                expect(createServiceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return success", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    service_id: "test_service_id",
                });
                let response = <QueryResult>{
                    rowCount: 1
                }
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await flexService.updateService(input)).toBe(true);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    service_id: "test_service_id",
                });

                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("Duplicate service name"));
                //Act
                //Assert
                await expect(flexService.updateService(input)).rejects.toThrow(DuplicateException);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    service_id: "test_service_id",
                });

                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("DB error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.updateService(input)).rejects.toThrow(Error);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Flex Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return list of services", async () => {
                //Arrange
                let service = new ServiceDto({
                    service_name: "service_name",
                    tdei_service_id: "tdei_service_id",
                    tdei_org_id: "tdei_org_id",
                    polygon: TestHelper.getPolygon()
                });

                let dbResult: any = {
                    name: "service_name",
                    service_id: "tdei_service_id",
                    owner_org: "tdei_org_id",
                    polygon: JSON.stringify(service.polygon.features[0].geometry)
                }

                let response = <QueryResult>{
                    rowCount: 1,
                    rows: [dbResult]
                }
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let list = await flexService.getService(new ServiceQueryParams({
                    searchText: "test",
                    tdei_service_id: "tdei_service_id",
                    tdei_org_id: "tdei_org_id",
                    bbox: <any>[23, 43, 45, 67],
                    page_no: 1,
                    page_size: 10
                }));
                //Assert
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
                expect(list[0]).toMatchObject(service);
            });

            test("When database exception occured, Expect to throw error", async () => {
                //Arrange
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.getService(new ServiceQueryParams())).rejects.toThrow(Error);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Service Status", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await flexService.setServiceStatus("input", true)).toBe(true);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.setServiceStatus("input", true)).rejects.toThrow(Error);
                expect(updateServiceSpy).toHaveBeenCalledTimes(1);
            });

        });
    });
});