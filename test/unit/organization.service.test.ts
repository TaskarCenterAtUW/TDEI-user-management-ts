import dbClient from "../../src/database/data-source";
import { DatabaseError, QueryResult } from "pg";
import organizationService from "../../src/service/organization-service";
import { OrganizationDto } from "../../src/model/dto/organization-dto";
import UniqueKeyDbException from "../../src/exceptions/db/database-exceptions";
import { DuplicateException } from "../../src/exceptions/http/http-exceptions";
import { OrgQueryParams } from "../../src/model/params/organization-get-query-params";
import { TestHelper } from "../common/test-helper";
import { OrganizationListResponse, PocDetails } from "../../src/model/dto/poc-details-dto";
import { OrgUserQueryParams } from "../../src/model/params/organization-user-query-params";

// group test using describe
describe("Organization Service Test", () => {

    describe("Create Organization", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new organization_id", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rows: [
                        { org_id: "new_org_id" }
                    ]
                }
                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await organizationService.createOrganization(input)).toBe("new_org_id");
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception occurs, Expect to throw DuplicateException", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
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
                await expect(organizationService.createOrganization(input)).rejects.toThrow(DuplicateException);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception occurs, Expect to throw error", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
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
                await expect(organizationService.createOrganization(input)).rejects.toThrow(Error);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Organization", () => {
        describe("Functional", () => {
            test("When requested, Expect to return true on success", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rowCount: 1
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await organizationService.updateOrganization(input)).toBe(true);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception occurs, Expect to throw DuplicateException", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
                    phone: "9999999",
                    address: "test",
                    url: "test",
                    polygon: undefined
                });

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("error"));
                //Act
                //Assert
                await expect(organizationService.updateOrganization(input)).rejects.toThrow(DuplicateException);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception occurs, Expect to throw error", async () => {
                //Arrange
                let input = new OrganizationDto({
                    org_name: "org_name",
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
                await expect(organizationService.updateOrganization(input)).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Organizations", () => {
        describe("Functional", () => {
            test("When requested, Expect to return list of organizations", async () => {
                //Arrange
                let org = new OrganizationListResponse({
                    org_name: "org_name",
                    tdei_org_id: "org_id",
                    polygon: TestHelper.getPolygon(),
                });
                org.poc = [<PocDetails>{
                    first_name: "first_name",
                    last_name: "last_name",
                    email: "email"
                }];

                let dbResult: any = {
                    name: "org_name",
                    org_id: "org_id",
                    polygon: JSON.stringify(org.polygon.features[0].geometry),
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
                const getOrgSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let list = await organizationService.getOrganizations(new OrgQueryParams({
                    searchText: "test",
                    tdei_org_id: "tdei_org_id",
                    bbox: <any>[23, 43, 45, 67],
                    page_no: 1,
                    page_size: 10
                }));
                //Assert
                expect(getOrgSpy).toHaveBeenCalledTimes(1);
                expect(list[0]).toMatchObject(org);
            });

            test("When database exception occured, Expect to throw error", async () => {
                //Arrange
                const updateOrgSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(organizationService.getOrganizations(new OrgQueryParams())).rejects.toThrow(Error);
                expect(updateOrgSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Organization Users", () => {
        describe("Functional", () => {

            test("When requested, Expect to return list of organization users", async () => {
                //Arrange
                let input = new OrgUserQueryParams({
                    orgId: "orgId",
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

                const getOrgUserSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await organizationService.getOrganizationUsers(input)
                //Assert
                expect(result[0].user_id).toBe("test_user_id");
                expect(getOrgUserSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                const getOrgUserSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(organizationService.getOrganizationUsers(new OrgUserQueryParams())).rejects.toThrow(Error);
                expect(getOrgUserSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Update Organization Status", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateOrgSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await organizationService.setOrganizationStatus("orgId", true)).toBe(true);
                expect(updateOrgSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                const updateOrgSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(organizationService.setOrganizationStatus("orgId", true)).rejects.toThrow(Error);
                expect(updateOrgSpy).toHaveBeenCalledTimes(1);
            });

        });
    });
});