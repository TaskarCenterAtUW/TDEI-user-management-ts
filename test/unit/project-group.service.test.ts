import dbClient from "../../src/database/data-source";
import { DatabaseError, QueryResult } from "pg";
import projectGroupService from "../../src/service/project-group-service";
import { ProjectGroupDto } from "../../src/model/dto/project-group-dto";
import UniqueKeyDbException from "../../src/exceptions/db/database-exceptions";
import { DuplicateException } from "../../src/exceptions/http/http-exceptions";
import { ProjectGroupQueryParams } from "../../src/model/params/project-group-get-query-params";
import { TestHelper } from "../common/test-helper";
import { ProjectGroupListResponse, PocDetails } from "../../src/model/dto/poc-details-dto";
import { ProjectGroupUserQueryParams } from "../../src/model/params/project-group-user-query-params";

// group test using describe
describe("Project Group Service Test", () => {

    describe("Create Project Group", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new project_group_id", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rows: [
                        { project_group_id: "new_project_group_id" }
                    ]
                }
                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await projectGroupService.createProjectGroup(input)).toBe("new_project_group_id");
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception occurs, Expect to throw DuplicateException", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: undefined
                });

                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("error"));
                //Act
                //Assert
                await expect(projectGroupService.createProjectGroup(input)).rejects.toThrow(DuplicateException);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception occurs, Expect to throw error", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });

                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(projectGroupService.createProjectGroup(input)).rejects.toThrow(Error);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Project Group", () => {
        describe("Functional", () => {
            test("When requested, Expect to return true on success", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });

                let response2 = <QueryResult>{
                    rows: [
                        { project_group_id: "default_project_group_id" }
                    ]
                }
                const getDbSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2); // to get default project group id

                let response = <QueryResult>{
                    rowCount: 1
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);

                //Act
                //Assert
                expect(await projectGroupService.updateProjectGroup(input)).toBe(true);
                expect(updateStationSpy).toHaveBeenCalled();
                expect(getDbSpy).toHaveBeenCalled();
            });

            test("When unique key exception occurs, Expect to throw DuplicateException", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: undefined
                });

                let response2 = <QueryResult>{
                    rows: [
                        { project_group_id: "default_project_group_id" }
                    ]
                }
                const getDbSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response2); // to get default project group id

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("error"));

                //Act
                //Assert
                await expect(projectGroupService.updateProjectGroup(input)).rejects.toThrow(DuplicateException);
                expect(updateStationSpy).toHaveBeenCalled();
                expect(getDbSpy).toHaveBeenCalled();
            });

            test("When database exception occurs, Expect to throw error", async () => {
                //Arrange
                let input = new ProjectGroupDto({
                    project_group_name: "project_group_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(projectGroupService.updateProjectGroup(input)).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Project Groups", () => {
        describe("Functional", () => {
            test("When requested, Expect to return list of project groups", async () => {
                //Arrange
                let projectgroup = new ProjectGroupListResponse({
                    project_group_name: "project_group_name",
                    tdei_project_group_id: "project_group_id",
                    polygon: TestHelper.getPolygon(),
                });
                projectgroup.poc = [<PocDetails>{
                    first_name: "first_name",
                    last_name: "last_name",
                    email: "email"
                }];

                let dbResult: any = {
                    name: "project_group_name",
                    project_group_id: "project_group_id",
                    polygon: JSON.stringify(projectgroup.polygon.features[0].geometry),
                    userdetails: [{
                        first_name: "first_name",
                        last_name: "last_name",
                        email: "email"
                    }]
                }

                let response = <QueryResult>{
                    rowCount: 1,
                    rows: [dbResult]
                }
                const getProjectGroupSpy = jest
                    .spyOn(projectGroupService, "getProjectGroupById")
                    .mockResolvedValueOnce(new ProjectGroupDto({}));

                const projectGroupIdCheckSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let list = await projectGroupService.getProjectGroups(new ProjectGroupQueryParams({
                    searchText: "test",
                    tdei_project_group_id: "tdei_project_group_id",
                    bbox: <any>[23, 43, 45, 67],
                    page_no: 1,
                    page_size: 10
                }));
                //Assert
                expect(projectGroupIdCheckSpy).toHaveBeenCalled();
                expect(getProjectGroupSpy).toHaveBeenCalled();
                expect(list[0]).toMatchObject(projectgroup);
            });

            test("When database exception occured, Expect to throw error", async () => {
                //Arrange
                const updateProjectGroupSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(projectGroupService.getProjectGroups(new ProjectGroupQueryParams())).rejects.toThrow(Error);
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Project Group Users", () => {
        describe("Functional", () => {

            test("When requested, Expect to return list of project group users", async () => {
                //Arrange
                let input = new ProjectGroupUserQueryParams({
                    tdei_project_group_id: "projectGroupId",
                    page_no: 1,
                    page_size: 10,
                    searchText: "test"
                })
                let response = <QueryResult>{
                    rowCount: 1, //effected row,
                    rows: [
                        {
                            user_id: "test_user_id",
                            first_name: "first_name",
                            last_name: "last_name",
                            email: "email",
                            username: "username",
                            phone: "phone",
                            roles: ["t1", "t2"],
                            attributes: [{
                                name: "phone",
                                value: "9999999999"
                            }]
                        }
                    ]
                };

                const getProjectGroupUserSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await projectGroupService.getProjectGroupUsers(input)
                //Assert
                expect(result[0].user_id).toBe("test_user_id");
                expect(getProjectGroupUserSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                const getProjectGroupUserSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(projectGroupService.getProjectGroupUsers(new ProjectGroupUserQueryParams())).rejects.toThrow(Error);
                expect(getProjectGroupUserSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Update Project Group Status", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateProjectGroupSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await projectGroupService.setProjectGroupStatus("projectGroupId", true)).toBe(true);
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                const updateProjectGroupSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(projectGroupService.setProjectGroupStatus("projectGroupId", true)).rejects.toThrow(Error);
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
            });

        });
    });
});