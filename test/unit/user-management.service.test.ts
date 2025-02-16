import fetchMock from "jest-fetch-mock";
import userManagementServiceInstance, { UserManagementService } from "../../src/service/user-management-service";
import { LoginDto } from "../../src/model/dto/login-dto";
import { RegisterUserDto } from "../../src/model/dto/register-user-dto";
import { UserProfile } from "../../src/model/dto/user-profile-dto";
import { Role } from "../../src/constants/role-constants";
import { DatabaseError, QueryResult } from "pg";
import dbClient from "../../src/database/data-source";
import { RolesReqDto } from "../../src/model/dto/roles-req-dto";
import { ForeignKeyDbException } from "../../src/exceptions/db/database-exceptions";
import HttpException from "../../src/exceptions/http/http-base-exception";
import { ForeignKeyException } from "../../src/exceptions/http/http-exceptions";
import { ResetCredentialsDto } from "../../src/model/dto/reset-credentials-dto";

// group test using describe
describe("User Management Service Test", () => {

    describe("Refresh Token", () => {
        describe("Functional", () => {
            test("When requested, Expect to return refreshed access token", async () => {
                //Arrange
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 200,
                    json: () => Promise.resolve(<any>{
                        access_token: "access_token",
                        refresh_token: "refresh_token"
                    }),
                }));
                //Act
                let result = await userManagementServiceInstance.refreshToken("test_token");
                //Assert
                expect(result.access_token).toBe("access_token");
            });

            test("When error refreshing token, Expect to throw error", async () => {
                //Arrange
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 500,
                    json: () => Promise.resolve("Error refreshing token"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.refreshToken("test_token")).rejects.toThrow(Error);
            });
        });
    });

    describe("Login", () => {
        describe("Functional", () => {
            test("When requested, Expect to return access token", async () => {
                //Arrange
                let creds = new LoginDto({
                    username: "username",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 200,
                    json: () => Promise.resolve(<any>{
                        access_token: "access_token",
                        refresh_token: "refresh_token"
                    }),
                }));
                //Act
                let result = await userManagementServiceInstance.login(creds);
                //Assert
                expect(result.access_token).toBe("access_token");
            });

            test("When error authenticating, Expect to throw error", async () => {
                //Arrange
                let creds = new LoginDto({
                    username: "username",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 500,
                    json: () => Promise.resolve("Error authenticating"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.login(creds)).rejects.toThrow(Error);
            });
        });
    });

    describe("Register User", () => {
        describe("Functional", () => {
            test("When requested, Expect to return user profile response on success", async () => {
                //Arrange
                let newuser = new RegisterUserDto({
                    firstName: "firstname",
                    lastName: "lastname",
                    email: "email",
                    phone: "phone",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 200,
                    json: () => Promise.resolve(<UserProfile>{
                        firstName: "firstname",
                        lastName: "lastname",
                        email: "email",
                        phone: "phone",
                        id: "id",
                        username: "email",
                        emailVerified: true,
                        apiKey: "apiKey"
                    }),
                }));
                const getDbSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(<QueryResult>{});
                //Act
                let result = await userManagementServiceInstance.registerUser(newuser);
                //Assert
                expect(result.apiKey).toBe("apiKey");
                expect(getDbSpy).toHaveBeenCalledTimes(1);
            });

            test("When user already exists with same email, Expect to throw error", async () => {
                //Arrange
                let newuser = new RegisterUserDto({
                    firstName: "firstname",
                    lastName: "lastname",
                    email: "email",
                    phone: "phone",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 409,
                    json: () => Promise.resolve("Error registering user"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.registerUser(newuser)).rejects.toThrow(Error);
            });

            test("When error registering, Expect to throw error", async () => {
                //Arrange
                let newuser = new RegisterUserDto({
                    firstName: "firstname",
                    lastName: "lastname",
                    email: "email",
                    phone: "phone",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 500,
                    json: () => Promise.resolve("Error registering user"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.registerUser(newuser)).rejects.toThrow(Error);
            });
        });
    });

    describe("User Profile", () => {
        describe("Functional", () => {
            test("When requested, Expect to return user profile response on success", async () => {
                //Arrange
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 200,
                    json: () => Promise.resolve(<any>{
                        firstName: "firstname",
                        lastName: "lastname",
                        email: "email",
                        phone: "phone",
                        id: "id",
                        username: "test_user_name",
                        emailVerified: true,
                        apiKey: "apiKey"
                    }),
                }));
                //Act
                let result = await userManagementServiceInstance.getUserProfile("test_user_name");
                //Assert
                expect(result.username).toBe("test_user_name");
            });

            test("When user profile not found, Expect to throw UserNotFoundException", async () => {
                //Arrange

                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 404,
                    json: () => Promise.resolve("Error fetching user profile"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.getUserProfile("test_user_name")).rejects.toThrow(Error);
            });
        });
    });

    describe("Get Roles", () => {
        describe("Functional", () => {
            test("When requested, Expect to return list of roles", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1,
                    rows: [
                        {
                            name: Role.DATA_GENERATOR
                        },
                        {
                            name: Role.POC
                        }
                    ]
                }
                const getRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await userManagementServiceInstance.getRoles();
                //Assert
                expect(result.findIndex(x => x.name == Role.POC) != -1).toBeTruthy();
                expect(getRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw Error", async () => {
                //Arrange
                const getRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new Error());
                //Act
                //Assert
                await expect(userManagementServiceInstance.getRoles()).rejects.toThrow(Error);
            });
        });
    });

    describe("Update Permission", () => {
        describe("Functional", () => {
            test("When requested as Admin, Expect to return true on success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                let dbRoles = new Map<string, string>();
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                let response = <QueryResult>{
                    rowCount: 1
                }
                const deleteRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.TDEI_ADMIN]);
                const getRolesByNameSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getRolesByNames")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                let result = await userService.updatePermissions(input, "test_user_id");
                //Assert
                expect(result).toBeTruthy();
                expect(deleteRolesSpy).toHaveBeenCalledTimes(1);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(getRolesByNameSpy).toHaveBeenCalledTimes(1);
            });

            test("When requested as POC, Expect to return true on success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                let dbRoles = new Map<string, string>();
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                let response = <QueryResult>{
                    rowCount: 1
                }
                const deleteRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.POC]);
                const getRolesByNameSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getRolesByNames")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                let result = await userService.updatePermissions(input, "test_user_id");
                //Assert
                expect(result).toBeTruthy();
                expect(deleteRolesSpy).toHaveBeenCalledTimes(1);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(getRolesByNameSpy).toHaveBeenCalledTimes(1);
            });

            test("When requested as POC with admin restricted permissions, Expect to throw HttpException", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.TDEI_ADMIN],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.POC]);

                //Act
                //Assert
                await expect(userService.updatePermissions(input, "test_user_id")).rejects.toThrow(HttpException)
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When managing own permissions, Expect to return HttpException", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user_id"
                    }));

                //Act
                //Assert
                await expect(userService.updatePermissions(input, "test_user_id")).rejects.toThrow(HttpException);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
            });

            test("When foreign key exception occured, Expect to throw ForeignKeyDbException", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                let dbRoles = new Map<string, string>();
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                const deleteRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new ForeignKeyDbException("error"));
                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.TDEI_ADMIN]);
                const getRolesByNameSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getRolesByNames")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                //Assert
                await expect(userService.updatePermissions(input, "test_user_id")).rejects.toThrow(ForeignKeyException);
                expect(deleteRolesSpy).toHaveBeenCalledTimes(1);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(getRolesByNameSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception occured, Expect to throw Error", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                let dbRoles = new Map<string, string>;
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                const deleteRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.TDEI_ADMIN]);
                const getRolesByNameSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getRolesByNames")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                //Assert
                await expect(userService.updatePermissions(input, "test_user_id")).rejects.toThrow(Error);
                expect(deleteRolesSpy).toHaveBeenCalledTimes(1);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(getRolesByNameSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Revoke Permission", () => {
        describe("Functional", () => {
            test("When requested as Admin, Expect to return true on success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                let dbRoles = new Map<string, string>();
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.TDEI_ADMIN]);
                const removeRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "removeRoles")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                let result = await userService.revokeUserPermissions(input, "test_user_id");
                //Assert
                expect(result).toBeTruthy();
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(removeRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When requested as POC, Expect to return true on success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.POC]);
                const removeRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "removeRoles")
                    .mockResolvedValueOnce(true);
                //Act
                let result = await userService.revokeUserPermissions(input, "test_user_id");
                //Assert
                expect(result).toBeTruthy();
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(removeRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When requested as POC with admin restricted permissions, Expect to throw HttpException", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.TDEI_ADMIN],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.POC]);

                //Act
                //Assert
                await expect(userService.revokeUserPermissions(input, "test_user_id")).rejects.toThrow(HttpException)
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When managing own permissions, Expect to return HttpException", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [Role.DATA_GENERATOR],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user_id"
                    }));

                //Act
                //Assert
                await expect(userService.revokeUserPermissions(input, "test_user_id")).rejects.toThrow(HttpException);
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
            });

            test("When removing user from project groups, Expect to return true on success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let input = new RolesReqDto({
                    user_name: "test_user_name",
                    roles: [],
                    tdei_project_group_id: "tdei_project_group_id"
                });

                const getUserProfileSpy = jest
                    .spyOn(userService, "getUserProfile")
                    .mockResolvedValueOnce(new UserProfile({
                        username: "username",
                        email: "email",
                        id: "test_user2_id"
                    }));
                const getUserRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getUserRoles")
                    .mockResolvedValueOnce(<any>[Role.POC]);
                const removeRolesSpy = jest
                    .spyOn(UserManagementService.prototype as any, "removeUserFromProjectGroup")
                    .mockResolvedValueOnce(true);
                //Act
                let result = await userService.revokeUserPermissions(input, "test_user_id");
                //Assert
                expect(result).toBeTruthy();
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(getUserRolesSpy).toHaveBeenCalledTimes(1);
                expect(removeRolesSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Remove User from Project Groups", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                await userService["removeUserFromProjectGroup"]("project_group_Id", "user_id");
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                let userService = new UserManagementService();
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(userService["removeUserFromProjectGroup"]("project_group_Id", "user_id")).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Remove User Roles from Project Groups", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let input = new RolesReqDto({
                    user_name: "user_name",
                    roles: [Role.DATA_GENERATOR]
                });

                let dbRoles = new Map<string, string>();
                dbRoles.set(Role.DATA_GENERATOR, "101");
                dbRoles.set(Role.POC, "102");
                dbRoles.set(Role.TDEI_ADMIN, "103");

                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                const getRolesByNameSpy = jest
                    .spyOn(UserManagementService.prototype as any, "getRolesByNames")
                    .mockResolvedValueOnce(dbRoles);
                //Act
                await userService["removeRoles"](input, "user_id");
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
                expect(getRolesByNameSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Role Details by Name", () => {
        describe("Functional", () => {

            test("When requested, Expect to return map of role_id and name", async () => {
                //Arrange
                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1, //effected row
                    rows: [
                        {
                            name: Role.DATA_GENERATOR,
                            role_id: 101
                        }
                    ]
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await userService["getRolesByNames"]([Role.DATA_GENERATOR]);
                //Assert
                expect(result.has(Role.DATA_GENERATOR)).toBeTruthy();
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                let userService = new UserManagementService();

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new Error());
                //Act
                //Assert
                await expect(userService["getRolesByNames"]([Role.DATA_GENERATOR])).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Get User Roles", () => {
        describe("Functional", () => {

            test("When requested, Expect to return list of user roles", async () => {
                //Arrange
                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1, //effected row
                    rows: [
                        {
                            name: Role.DATA_GENERATOR,
                        },
                        {
                            name: Role.POC,
                        }
                    ]
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await userService["getUserRoles"]("user_id");
                //Assert
                expect(result.includes(Role.DATA_GENERATOR)).toBeTruthy();
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                let userService = new UserManagementService();

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new Error());
                //Act
                //Assert
                await expect(userService["getUserRoles"]("user_id")).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Get User Project Groups with Roles", () => {
        describe("Functional", () => {

            test("When requested, Expect to return list of user project groups with roles", async () => {
                //Arrange
                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1, //effected row
                    rows: [
                        {
                            project_group_name: "project_group_name",
                            project_group_id: "project_group_id",
                            roles: [Role.DATA_GENERATOR]
                        }
                    ]
                }
                const getUserProjectGroupRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await userService.getUserProjectGroupsWithRoles("user_id", 1, 10);
                //Assert
                expect(result[0].project_group_name).toBe("project_group_name");
                expect(getUserProjectGroupRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When requested with project name search, Expect to return list of user project groups with roles and specified project name", async () => {
                //Arrange
                let userService = new UserManagementService();
                let response = <QueryResult>{
                    rowCount: 1, //effected row
                    rows: [
                        {
                            project_group_name: "project_group_name",
                            project_group_id: "project_group_id",
                            roles: [Role.DATA_GENERATOR]
                        }
                    ]
                }
                const getUserProjectGroupRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let result = await userService.getUserProjectGroupsWithRoles("user_id", 1, 10, "sample_project_name");
                //Assert
                expect(result[0].project_group_name).toBe("project_group_name");
                expect(getUserProjectGroupRolesSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                let userService = new UserManagementService();

                const getUserProjectGroupRolesSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new Error());
                //Act
                //Assert
                await expect(userService.getUserProjectGroupsWithRoles("user_id", 1, 10)).rejects.toThrow(Error);
                expect(getUserProjectGroupRolesSpy).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Reset Credentials", () => {
        describe("Functional", () => {
            test("When requested with valid inputs, Expect to return boolean true response on success", async () => {
                //Arrange
                let resetdto = new ResetCredentialsDto({
                    username: "firstname@tdei.com",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 200,
                    json: () => Promise.resolve(true),
                }));

                //Act
                let result = await userManagementServiceInstance.resetCredentials(resetdto);
                //Assert
                expect(result).toBeTruthy();
            });

            test("When username not exists, Expect to throw error", async () => {
                //Arrange
                let resetdto = new ResetCredentialsDto({
                    username: "firstname@tdei.com",
                    password: "password"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 404,
                    json: () => Promise.resolve("User does not exists"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.resetCredentials(resetdto)).rejects.toThrow(Error);
            });

            test("When password policy not satisfied, Expect to throw error", async () => {
                //Arrange
                let resetdto = new ResetCredentialsDto({
                    username: "firstname@tdei.com",
                    password: "test"
                });
                fetchMock.mockResolvedValueOnce(Promise.resolve(<any>{
                    status: 400,
                    json: () => Promise.resolve("Password policy not met"),
                }));
                //Act
                //Assert
                await expect(userManagementServiceInstance.resetCredentials(resetdto)).rejects.toThrow(Error);
            });
        });
    });

    describe('downloadUsers', () => {
        it('should return CSV content with user data', async () => {
            const mockQueryResult: any = {
                rows: [
                    { name: 'John Doe', email: 'john.doe@example.com', roles: 'admin|user' },
                    { name: 'Jane Smith', email: 'jane.smith@example.com', roles: 'user' }
                ]
            };
            const getUserProjectGroupRolesSpy = jest
                .spyOn(dbClient, "query")
                .mockResolvedValueOnce(mockQueryResult);

            const expectedCsvContent = 'Name,Email,Roles\nJohn Doe,john.doe@example.com,admin|user\nJane Smith,jane.smith@example.com,user';

            const result = await userManagementServiceInstance.downloadUsers();

            expect(result).toBe(expectedCsvContent);
            expect(dbClient.query).toHaveBeenCalledWith(expect.any(String));
        });

        it('should handle empty result set', async () => {
            const mockQueryResult: any = { rows: [] };

            const getUserProjectGroupRolesSpy = jest
                .spyOn(dbClient, "query")
                .mockResolvedValueOnce(mockQueryResult);


            const expectedCsvContent = 'Name,Email,Roles\n';

            const result = await userManagementServiceInstance.downloadUsers();

            expect(result).toBe(expectedCsvContent);
            expect(dbClient.query).toHaveBeenCalledWith(expect.any(String));
        });

        it('should throw an error if the query fails', async () => {
            const getUserProjectGroupRolesSpy = jest
                .spyOn(dbClient, "query")
                .mockRejectedValueOnce(new Error('Database error'));

            await expect(userManagementServiceInstance.downloadUsers()).rejects.toThrow('Database error');
            expect(dbClient.query).toHaveBeenCalledWith(expect.any(String));
        });
    });
});