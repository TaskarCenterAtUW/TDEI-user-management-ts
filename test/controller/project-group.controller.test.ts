import { getMockReq, getMockRes } from "@jest-mock/express";
import projetGroupController from "../../src/controller/project-group-controller";
import { DuplicateException } from "../../src/exceptions/http/http-exceptions";
import projectGroupService from "../../src/service/project-group-service";
import { ProjectGroupListResponse } from "../../src/model/dto/poc-details-dto";
import { ProjectGroupUserDto } from "../../src/model/dto/project-group-user-dto";

describe("Project Group Controller Test", () => {

    describe("Create Project Group", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new project group id", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_project_group_name" } });
                const { res, next } = getMockRes();
                const createProjectGroupSpy = jest
                    .spyOn(projectGroupService, "createProjectGroup")
                    .mockResolvedValueOnce("new_project_group_id");
                //Act
                await projetGroupController.createProjectGroup(req, res, next);
                //Assert
                expect(createProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "new_project_group_id" });
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_project_group_name" } });
                const { res, next } = getMockRes();
                const createProjectGroupSpy = jest
                    .spyOn(projectGroupService, "createProjectGroup")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await projetGroupController.createProjectGroup(req, res, next);
                //Assert
                expect(createProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });

            test("When database uniquekey constraint (same project_group_name ) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_project_group_name" } });
                const { res, next } = getMockRes();
                const createProjectGroupSpy = jest
                    .spyOn(projectGroupService, "createProjectGroup")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await projetGroupController.createProjectGroup(req, res, next);
                //Assert
                expect(createProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Update Project Group", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_station", tdei_project_group_id: "tdei_project_group_id" } });
                const { res, next } = getMockRes();
                const updateProjectGroupSpy = jest
                    .spyOn(projectGroupService, "updateProjectGroup")
                    .mockResolvedValueOnce(true);
                //Act
                await projetGroupController.updateProjectGroup(req, res, next);
                //Assert
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database uniquekey constraint (same project_group_name + project_group_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateProjectGroupSpy = jest
                    .spyOn(projectGroupService, "updateProjectGroup")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await projetGroupController.updateProjectGroup(req, res, next);
                //Assert
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { project_group_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateProjectGroupSpy = jest
                    .spyOn(projectGroupService, "updateProjectGroup")
                    .mockRejectedValueOnce(new Error());
                //Act
                await projetGroupController.updateProjectGroup(req, res, next);
                //Assert
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Get Project Group", () => {
        describe("Functional", () => {
            test("When requested without any filter, Expect to return project group list", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                var list = [new ProjectGroupListResponse({
                    project_group_name: "test_project_group_name",
                    tdei_project_group_id: "test_tdei_project_group_id"
                })];
                const getProjectGroupSpy = jest
                    .spyOn(projectGroupService, "getProjectGroups")
                    .mockResolvedValueOnce(list);
                //Act
                await projetGroupController.getProjectGroup(req, res, next);
                //Assert
                expect(getProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When requested with all filters, Expect to return project group list", async () => {
                //Arrange

                let req = getMockReq({
                    query: {
                        searchText2: "test",
                        tdei_project_group_id2: "tdei_project_group_id",
                        bbox: <any>[23, 43, 45, 67],
                        page_no: "1",
                        page_size: "10"
                    }
                });
                const { res, next } = getMockRes();
                var list = [new ProjectGroupListResponse({
                    project_group_name: "test_project_group_name",
                })];
                const getProjectGroupSpy = jest
                    .spyOn(projectGroupService, "getProjectGroups")
                    .mockResolvedValueOnce(list);
                //Act
                await projetGroupController.getProjectGroup(req, res, next);
                //Assert
                expect(getProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const getProjectGroupSpy = jest
                    .spyOn(projectGroupService, "getProjectGroups")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await projetGroupController.getProjectGroup(req, res, next);
                //Assert
                expect(getProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Update Project Group Status", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ projectGroupId: "test_project_groupId", status: "true" } });
                const { res, next } = getMockRes();
                const updateProjectGroupSpy = jest
                    .spyOn(projectGroupService, "setProjectGroupStatus")
                    .mockResolvedValueOnce(true);
                //Act
                await projetGroupController.deleteProjectGroup(req, res, next);
                //Assert
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ projectGroupId: "test_project_groupId", status: "true" } });
                const { res, next } = getMockRes();
                const updateProjectGroupSpy = jest
                    .spyOn(projectGroupService, "setProjectGroupStatus")
                    .mockRejectedValueOnce(new Error());
                //Act
                await projetGroupController.deleteProjectGroup(req, res, next);
                //Assert
                expect(updateProjectGroupSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Get Project Group Users", () => {
        describe("Functional", () => {
            test("When requested, Expect to return project group users list", async () => {
                //Arrange
                let req = getMockReq({
                    params: <any>{ projectGroupId: "test_project_groupId" },
                    query: { page_no: "1", page_size: "10" }
                });
                const { res, next } = getMockRes();
                let response = [new ProjectGroupUserDto()]
                const projectGroupUsersSpy = jest
                    .spyOn(projectGroupService, "getProjectGroupUsers")
                    .mockResolvedValueOnce(response);
                //Act
                await projetGroupController.getProjectGroupUsers(req, res, next);
                //Assert
                expect(projectGroupUsersSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({
                    params: <any>{ projectGroupId: "test_project_groupId" }
                });
                const { res, next } = getMockRes();
                const projectGroupUsersSpy = jest
                    .spyOn(projectGroupService, "getProjectGroupUsers")
                    .mockRejectedValueOnce(new Error());
                //Act
                await projetGroupController.getProjectGroupUsers(req, res, next);
                //Assert
                expect(projectGroupUsersSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });
});