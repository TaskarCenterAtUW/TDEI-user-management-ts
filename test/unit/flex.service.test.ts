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
                    rows: <any>[]
                }
                const checkServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                let response2 = <QueryResult>{
                    rows: [
                        { service_id: "new_service_id" }
                    ]
                }
                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2);
                //Act
                //Assert
                expect(await flexService.createService(input)).toBe("new_service_id");
                expect(checkServiceSpy).toHaveBeenCalled();
                expect(createServiceSpy).toHaveBeenCalled();
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_project_group_id: "test_tdei_project_group_id",
                    polygon: undefined
                });

                let response = <QueryResult>{
                    rows: [{
                        is_active: false,
                        owner_project_group: "test_tdei_project_group_id"
                    }]
                }
                const checkServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);

                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(DuplicateException);
                expect(checkServiceSpy).toHaveBeenCalledTimes(1);
            });

            test("When foreign key exception thrown, Expect to return ForeignKeyException", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_project_group_id: "test_tdei_project_group_id",
                });

                let response = <QueryResult>{
                    rows: <any>[]
                }
                const checkServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);

                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new ForeignKeyDbException("Contraint error"));
                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(ForeignKeyException);
                expect(createServiceSpy).toHaveBeenCalled();
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new ServiceDto({
                    service_name: "test_service_name",
                    tdei_project_group_id: "test_tdei_project_group_id",
                });

                let response = <QueryResult>{
                    rows: <any>[]
                }
                const checkServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);

                const createServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("DB error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.createService(input)).rejects.toThrow(Error);
                expect(createServiceSpy).toHaveBeenCalled();
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

                let countResponse = <QueryResult>{
                    rowCount: 1,
                    rows: [{ total: 134 }]
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
                    .mockResolvedValueOnce(countResponse)
                    .mockResolvedValueOnce(response);
                //Act
                let page = await flexService.getService(new ServiceQueryParams({
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
                expect(updateServiceSpy).toHaveBeenCalledTimes(2);
                expect(page.totalCount).toBe(134);
                expect(page.pageNo).toBe(1);
                expect(page.pageSize).toBe(10);
                expect(page.items[0]).toMatchObject(service);

                const countCall = updateServiceSpy.mock.calls[0][0] as { text: string };
                const listCall = updateServiceSpy.mock.calls[1][0] as { text: string };
                expect(countCall.text).toContain("SELECT COUNT(*)::int AS total FROM service");
                expect(countCall.text).not.toContain("ST_AsGeoJSON");
                expect(listCall.text).toContain("ST_AsGeoJSON(polygon) as polygon");
                expect(listCall.text).toContain("LIMIT");
            });

            test("When page size exceeds 50, Expect the count query and a capped page", async () => {
                const querySpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(<QueryResult>{ rows: [{ total: 134 }] })
                    .mockResolvedValueOnce(<QueryResult>{ rows: <any>[] });

                const page = await flexService.getService(new ServiceQueryParams({
                    page_no: 2,
                    page_size: 80,
                }));

                expect(page).toEqual({
                    items: [],
                    totalCount: 134,
                    pageNo: 2,
                    pageSize: 50,
                });
                const listCall = querySpy.mock.calls[1][0] as { values: unknown[] };
                expect(listCall.values.slice(0, 2)).toEqual([50, 50]);
            });

            test("When database exception occured, Expect to throw error", async () => {
                //Arrange
                const updateServiceSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValue(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(flexService.getService(new ServiceQueryParams())).rejects.toThrow(Error);
                expect(updateServiceSpy).toHaveBeenCalledTimes(2);
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