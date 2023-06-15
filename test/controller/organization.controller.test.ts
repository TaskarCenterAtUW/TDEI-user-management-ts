import { getMockReq, getMockRes } from "@jest-mock/express";
import organizationController from "../../src/controller/organization-controller";
import { DuplicateException } from "../../src/exceptions/http/http-exceptions";
import organizationService from "../../src/service/organization-service";
import { OrganizationListResponse } from "../../src/model/dto/poc-details-dto";
import { query } from "express";
import { OrgUserDto } from "../../src/model/dto/org-user-dto";

describe("Organization Controller Test", () => {

    describe("Create Organization", () => {
        describe("Functional", () => {
            test("When requested, Expect to return organization list", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_org_name" } });
                const { res, next } = getMockRes();
                const createOrganizationSpy = jest
                    .spyOn(organizationService, "createOrganization")
                    .mockResolvedValueOnce("new_org_id");
                //Act
                await organizationController.createOrganization(req, res, next);
                //Assert
                expect(createOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "new_org_id" });
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_org_name" } });
                const { res, next } = getMockRes();
                const createOrganizationSpy = jest
                    .spyOn(organizationService, "createOrganization")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await organizationController.createOrganization(req, res, next);
                //Assert
                expect(createOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });

            test("When database uniquekey constraint (same org_name ) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_org_name" } });
                const { res, next } = getMockRes();
                const createOrganizationSpy = jest
                    .spyOn(organizationService, "createOrganization")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await organizationController.createOrganization(req, res, next);
                //Assert
                expect(createOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Update Organization", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_station", tdei_org_id: "tdei_org_id" } });
                const { res, next } = getMockRes();
                const updateOrganizationSpy = jest
                    .spyOn(organizationService, "updateOrganization")
                    .mockResolvedValueOnce(true);
                //Act
                await organizationController.updateOrganization(req, res, next);
                //Assert
                expect(updateOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database uniquekey constraint (same org_name + org_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateOrganizationSpy = jest
                    .spyOn(organizationService, "updateOrganization")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await organizationController.updateOrganization(req, res, next);
                //Assert
                expect(updateOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { org_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateOrganizationSpy = jest
                    .spyOn(organizationService, "updateOrganization")
                    .mockRejectedValueOnce(new Error());
                //Act
                await organizationController.updateOrganization(req, res, next);
                //Assert
                expect(updateOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Get Organization", () => {
        describe("Functional", () => {
            test("When requested without any filter, Expect to return organization list", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                var list = [new OrganizationListResponse({
                    org_name: "test_org_name",
                    tdei_org_id: "test_tdei_org_id"
                })];
                const getOrganizationSpy = jest
                    .spyOn(organizationService, "getOrganizations")
                    .mockResolvedValueOnce(list);
                //Act
                await organizationController.getOrganization(req, res, next);
                //Assert
                expect(getOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When requested with all filters, Expect to return organization list", async () => {
                //Arrange

                let req = getMockReq({
                    query: {
                        searchText2: "test",
                        tdei_org_id2: "tdei_org_id",
                        bbox: <any>[23, 43, 45, 67],
                        page_no: "1",
                        page_size: "10"
                    }
                });
                const { res, next } = getMockRes();
                var list = [new OrganizationListResponse({
                    org_name: "test_org_name",
                })];
                const getOrganizationSpy = jest
                    .spyOn(organizationService, "getOrganizations")
                    .mockResolvedValueOnce(list);
                //Act
                await organizationController.getOrganization(req, res, next);
                //Assert
                expect(getOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const getOrganizationSpy = jest
                    .spyOn(organizationService, "getOrganizations")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await organizationController.getOrganization(req, res, next);
                //Assert
                expect(getOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Update Organization Status", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ orgId: "test_orgId", status: "true" } });
                const { res, next } = getMockRes();
                const updateOrganizationSpy = jest
                    .spyOn(organizationService, "setOrganizationStatus")
                    .mockResolvedValueOnce(true);
                //Act
                await organizationController.deleteOrganization(req, res, next);
                //Assert
                expect(updateOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ params: <any>{ orgId: "test_orgId", status: "true" } });
                const { res, next } = getMockRes();
                const updateOrganizationSpy = jest
                    .spyOn(organizationService, "setOrganizationStatus")
                    .mockRejectedValueOnce(new Error());
                //Act
                await organizationController.deleteOrganization(req, res, next);
                //Assert
                expect(updateOrganizationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Get Organization Users", () => {
        describe("Functional", () => {
            test("When requested, Expect to return organization users list", async () => {
                //Arrange
                let req = getMockReq({
                    params: <any>{ orgId: "test_orgId" },
                    query: { page_no: "1", page_size: "10" }
                });
                const { res, next } = getMockRes();
                let response = [new OrgUserDto()]
                const orgUsersSpy = jest
                    .spyOn(organizationService, "getOrganizationUsers")
                    .mockResolvedValueOnce(response);
                //Act
                await organizationController.getOrganizationUsers(req, res, next);
                //Assert
                expect(orgUsersSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({
                    params: <any>{ orgId: "test_orgId" }
                });
                const { res, next } = getMockRes();
                const orgUsersSpy = jest
                    .spyOn(organizationService, "getOrganizationUsers")
                    .mockRejectedValueOnce(new Error());
                //Act
                await organizationController.getOrganizationUsers(req, res, next);
                //Assert
                expect(orgUsersSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });
});