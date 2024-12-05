import { DuplicateException, ForeignKeyException, InputException } from "../../src/exceptions/http/http-exceptions";
import flexService from "../../src/service/flex-service";
import { ServiceDto } from "../../src/model/dto/service-dto";
import dbClient from "../../src/database/data-source";
import { DatabaseError, QueryResult } from "pg";
import UniqueKeyDbException, { ForeignKeyDbException } from "../../src/exceptions/db/database-exceptions";
import { ServiceUpdateDto } from "../../src/model/dto/service-update-dto";
import { ServiceQueryParams } from "../../src/model/params/service-get-query-params";
import { TestHelper } from "../common/test-helper";
import projectGroupService from "../../src/service/project-group-service";
import { ProjectGroupDto } from "../../src/model/dto/project-group-dto";
import { is } from "date-fns/locale";
import HttpException from "../../src/exceptions/http/http-base-exception";

// group test using describe
describe("Flex Service Test", () => {

    describe("Create Service", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new service_id", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_project_group_id: "test_tdei_project_group_id",
                    polygon: TestHelper.getPolygon()
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
                    tdei_project_group_id: "test_tdei_project_group_id",
                    polygon: undefined
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
                    tdei_project_group_id: "test_tdei_project_group_id",
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
                    tdei_project_group_id: "test_tdei_project_group_id",
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
                    tdei_service_id: "test_service_id",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rowCount: 1
                }
                let response2 = <QueryResult>{
                    rowCount: 1,
                    rows: [{ is_active: true }]
                }
                const updateServiceCheckSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2);

                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await flexService.updateService(input)).toBe(true);
                expect(updateServiceCheckSpy).toHaveBeenCalled();
                expect(updateServiceSpy).toHaveBeenCalled();
            });

            test("When editing inactive service, Expect to return not allowed", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    tdei_service_id: "test_service_id",
                    polygon: undefined
                });
                let response2 = <QueryResult>{
                    rowCount: 1,
                    rows: [{ is_active: false }]
                }
                const updateServiceCheckSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2);

                //Act
                //Assert
                await expect(flexService.updateService(input)).rejects.toThrow(HttpException);
                expect(updateServiceCheckSpy).toHaveBeenCalled();
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    tdei_service_id: "test_service_id",
                    polygon: undefined
                });
                let response2 = <QueryResult>{
                    rowCount: 1,
                    rows: [{ is_active: true }]
                }
                const updateServiceCheckSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2);
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("Duplicate service name"));
                //Act
                //Assert
                await expect(flexService.updateService(input)).rejects.toThrow(DuplicateException);
                expect(updateServiceSpy).toHaveBeenCalled();
                expect(updateServiceCheckSpy).toHaveBeenCalled();
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new ServiceUpdateDto({
                    service_name: "test_service_name",
                    tdei_service_id: "test_service_id",
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
                    service_type: "flex",
                    tdei_service_id: "tdei_service_id",
                    tdei_project_group_id: "tdei_project_group_id",
                    polygon: TestHelper.getPolygon()
                });

                let dbResult: any = {
                    name: "service_name",
                    service_type: "flex",
                    service_id: "tdei_service_id",
                    owner_project_group: "tdei_project_group_id",
                    polygon: JSON.stringify(service.polygon.features[0].geometry)
                }

                let response = <QueryResult>{
                    rowCount: 1,
                    rows: [dbResult]
                }

                const serviceIdCheckSpy = jest
                    .spyOn(flexService, "getServiceById")
                    .mockResolvedValueOnce(new ServiceDto({}));

                const getProjectGroupSpy = jest
                    .spyOn(projectGroupService, "getProjectGroupById")
                    .mockResolvedValueOnce(new ProjectGroupDto({}));

                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let list = await flexService.getService(new ServiceQueryParams({
                    searchText: "test",
                    service_type: "flex",
                    tdei_service_id: "tdei_service_id",
                    tdei_project_group_id: "tdei_project_group_id",
                    bbox: <any>[23, 43, 45, 67],
                    page_no: 1,
                    page_size: 10
                }));
                //Assert
                expect(serviceIdCheckSpy).toHaveBeenCalled();
                expect(getProjectGroupSpy).toHaveBeenCalled();
                expect(updateServiceSpy).toHaveBeenCalled();
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