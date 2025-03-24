import { getMockReq, getMockRes } from "@jest-mock/express";
import userManagementController from "../../src/controller/user-management-controller";
import userManagementService from "../../src/service/user-management-service";
import { RoleDto } from "../../src/model/dto/roles-dto";
import { UserProfile } from "../../src/model/dto/user-profile-dto";
import { RolesReqDto } from "../../src/model/dto/roles-req-dto";
import { ForeignKeyException, UserNotFoundException } from "../../src/exceptions/http/http-exceptions";
import HttpException from "../../src/exceptions/http/http-base-exception";
import { ProjectGroupRoleDto } from "../../src/model/dto/project-group-role-dto";


// group test using describe
describe("User Management Controller Test", () => {

    describe("Get Roles", () => {
        describe("Functional", () => {
            test("When requested, Expect to return Role list", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const list: RoleDto[] = [<RoleDto>{}]
                const getRolesSpy = jest
                    .spyOn(userManagementService, "getRoles")
                    .mockResolvedValueOnce(list);
                //Act
                await userManagementController.getRoles(req, res, next);
                //Assert
                expect(getRolesSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: list });
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const getRolesSpy = jest
                    .spyOn(userManagementService, "getRoles")
                    .mockRejectedValueOnce(new Error());
                //Act
                await userManagementController.getRoles(req, res, next);
                //Assert
                expect(getRolesSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Login", () => {
        describe("Functional", () => {
            test("When login with valid credentials, Expect to return Token response", async () => {
                //Arrange
                let req = getMockReq({ body: { username: "test_user", password: "test_passowrd" } });
                const { res, next } = getMockRes();
                let response = { access_token: "test_token" };
                const loginSpy = jest
                    .spyOn(userManagementService, "login")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.login(req, res, next);
                //Assert
                expect(loginSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When invalid credentials provided, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ body: { username: "test_user", password: "test_passowrd" } });
                const { res, next } = getMockRes();
                const getRolesSpy = jest
                    .spyOn(userManagementService, "login")
                    .mockRejectedValueOnce(new Error());
                //Act
                await userManagementController.login(req, res, next);
                //Assert
                expect(getRolesSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Refresh Token", () => {
        describe("Functional", () => {
            test("When valid refresh token provided, Expect to return refreshed token response", async () => {
                //Arrange
                let req = getMockReq({ headers: <any>{ "refresh_token": "test_token" } });
                const { res, next } = getMockRes();
                let response = { access_token: "test_token" };
                const refreshTokenSpy = jest
                    .spyOn(userManagementService, "refreshToken")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.refreshToken(req, res, next);
                //Assert
                expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When invalid refresh token provided, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({ headers: <any>{ "refresh_token": "test_token" } });
                const { res, next } = getMockRes();
                const refreshTokenSpy = jest
                    .spyOn(userManagementService, "refreshToken")
                    .mockRejectedValueOnce(new Error());
                //Act
                await userManagementController.refreshToken(req, res, next);
                //Assert
                expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });

            test("When no refresh token provided, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();

                //Act
                await userManagementController.refreshToken(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Register User", () => {
        describe("Functional", () => {
            test("When registered with required input, Expect to return user profile response", async () => {
                //Arrange
                let req = getMockReq({ firstName: "firstname", lastName: "lastname", email: "email" });
                const { res, next } = getMockRes();
                let response = new UserProfile();
                response.email = "test@email.com"
                const registerUserSpy = jest
                    .spyOn(userManagementService, "registerUser")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.registerUser(req, res, next);
                //Assert
                expect(registerUserSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: response });
            });

            test("When wrong credentials provided, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const registerUserSpy = jest
                    .spyOn(userManagementService, "registerUser")
                    .mockRejectedValueOnce(new Error());
                //Act
                await userManagementController.registerUser(req, res, next);
                //Assert
                expect(registerUserSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Update User Permissions", () => {
        describe("Functional", () => {
            test("When provided invalid username, Expect to return HTTP status 404", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const updatePermissionsSpy = jest
                    .spyOn(userManagementService, "updatePermissions")
                    .mockRejectedValueOnce(new UserNotFoundException("test_user"));
                //Act
                await userManagementController.updatePermissions(req, res, next);
                //Assert
                expect(updatePermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(404);
            });

            test("When managing self permission, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const updatePermissionsSpy = jest
                    .spyOn(userManagementService, "updatePermissions")
                    .mockRejectedValueOnce(new HttpException(400, "Own account permissions management not allowed."));
                //Act
                await userManagementController.updatePermissions(req, res, next);
                //Assert
                expect(updatePermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When managing restricted admin role, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const updatePermissionsSpy = jest
                    .spyOn(userManagementService, "updatePermissions")
                    .mockRejectedValueOnce(new HttpException(400, "Admin restricted roles cannot be assigned"));
                //Act
                await userManagementController.updatePermissions(req, res, next);
                //Assert
                expect(updatePermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database constraint error, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const updatePermissionsSpy = jest
                    .spyOn(userManagementService, "updatePermissions")
                    .mockRejectedValueOnce(new ForeignKeyException("DB Constraint error"));
                //Act
                await userManagementController.updatePermissions(req, res, next);
                //Assert
                expect(updatePermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When updating valid permission details, Expect to return success message", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const updatePermissionsSpy = jest
                    .spyOn(userManagementService, "updatePermissions")
                    .mockResolvedValueOnce(true);
                //Act
                await userManagementController.updatePermissions(req, res, next);
                //Assert
                expect(updatePermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "Successful!" });
            });
        });
    });

    describe("Revoke User Permissions", () => {
        describe("Functional", () => {
            test("When provided invalid username, Expect to return HTTP status 404", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const revokeUserPermissionsSpy = jest
                    .spyOn(userManagementService, "revokeUserPermissions")
                    .mockRejectedValueOnce(new UserNotFoundException("test_user"));
                //Act
                await userManagementController.revokePermissions(req, res, next);
                //Assert
                expect(revokeUserPermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(404);
            });

            test("When managing self permission, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const revokeUserPermissionsSpy = jest
                    .spyOn(userManagementService, "revokeUserPermissions")
                    .mockRejectedValueOnce(new HttpException(400, "Own account permissions management not allowed."));
                //Act
                await userManagementController.revokePermissions(req, res, next);
                //Assert
                expect(revokeUserPermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When managing restricted admin role, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const revokeUserPermissionsSpy = jest
                    .spyOn(userManagementService, "revokeUserPermissions")
                    .mockRejectedValueOnce(new HttpException(400, "Admin restricted roles cannot be assigned"));
                //Act
                await userManagementController.revokePermissions(req, res, next);
                //Assert
                expect(revokeUserPermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database constraint error, Expect to return HTTP status 400", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const revokeUserPermissionsSpy = jest
                    .spyOn(userManagementService, "revokeUserPermissions")
                    .mockRejectedValueOnce(new ForeignKeyException("DB Constraint error"));
                //Act
                await userManagementController.revokePermissions(req, res, next);
                //Assert
                expect(revokeUserPermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When updating valid permission details, Expect to return success message", async () => {
                //Arrange
                const { res, next } = getMockRes();
                let requestBody = new RolesReqDto();
                requestBody.roles = ["poc"];
                requestBody.user_name = "test_user";
                requestBody.tdei_project_group_id = "test_project_group";
                let req = getMockReq({ body: requestBody });
                const revokeUserPermissionsSpy = jest
                    .spyOn(userManagementService, "revokeUserPermissions")
                    .mockResolvedValueOnce(true);
                //Act
                await userManagementController.revokePermissions(req, res, next);
                //Assert
                expect(revokeUserPermissionsSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "Successful!" });
            });
        });
    });

    describe("User Profile", () => {
        describe("Functional", () => {
            test("When provided username, Expect to return user profile details", async () => {
                //Arrange
                let req = getMockReq({ query: <any>{ "user_name": "test_user" } });
                const { res, next } = getMockRes();
                let response = new UserProfile({ username: "test_user" });
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProfile")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.getUserProfile(req, res, next);
                //Assert
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When provided username with + sign, Expect to return user profile details", async () => {
                //Arrange
                let req = getMockReq({ query: <any>{ "user_name": "test+user" } });
                const { res, next } = getMockRes();
                let response = new UserProfile({ username: "test+user" });
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProfile")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.getUserProfile(req, res, next);
                //Assert
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When provided username with encoded user_name, Expect to return user profile details", async () => {
                //Arrange
                let req = getMockReq({ query: <any>{ "user_name": "test%2Bdev%40test.com" } });//test+dev@test.com
                const { res, next } = getMockRes();
                let response = new UserProfile({ username: "test+dev@test.com" });
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProfile")
                    .mockResolvedValueOnce(response);
                //Act
                await userManagementController.getUserProfile(req, res, next);
                //Assert
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(response);
            });

            test("When not provided user_name, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();

                //Act
                await userManagementController.getUserProfile(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When user not found, Expect to return HTTP status 404", async () => {
                //Arrange
                let req = getMockReq({ query: <any>{ "user_name": "test_user" } });
                const { res, next } = getMockRes();
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProfile")
                    .mockRejectedValueOnce(new UserNotFoundException('test_user'));
                //Act
                await userManagementController.getUserProfile(req, res, next);
                //Assert
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(404);
            });
        });
    });

    describe("Project Group Roles", () => {
        describe("Functional", () => {
            //Generate jwt with sample 'sub' :'testuserid' claim which represents userId, https://www.javainuse.com/jwtgenerator
            test("When requested, Expect to return project group role details", async () => {
                //Arrange
                let req = getMockReq({
                    query: {
                        page_no: "1",
                        page_size: "10"
                    },
                    params: <any>{ userId: "testuserid" },
                    headers: <any>{ "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcmlkIn0.MQjKH-T8EEWz1q8RjkE8wYgDS5zNPQAJeZHkffdadPY" }
                });
                const { res, next } = getMockRes();
                let response = new ProjectGroupRoleDto({ roles: ["poc"] });
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProjectGroupsWithRoles")
                    .mockResolvedValueOnce([response]);
                //Act
                await userManagementController.projectGroupRoles(req, res, next);
                //Assert
                expect(getUserProfileSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith([response]);
            });

            test("When requested project group roles for different user, Expect to return HTTP status 403", async () => {
                let req = getMockReq({
                    params: <any>{ userId: "testuserid2" },
                    headers: <any>{ "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcmlkIn0.MQjKH-T8EEWz1q8RjkE8wYgDS5zNPQAJeZHkffdadPY" }
                });
                const { res, next } = getMockRes();
                //Act
                await userManagementController.projectGroupRoles(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(403);
            });

            test("When user not provided, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({
                    headers: <any>{ "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcmlkIn0.MQjKH-T8EEWz1q8RjkE8wYgDS5zNPQAJeZHkffdadPY" }
                });
                const { res, next } = getMockRes();
                //Act
                await userManagementController.projectGroupRoles(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database error, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq({
                    params: <any>{ userId: "testuserid" },
                    headers: <any>{ "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcmlkIn0.MQjKH-T8EEWz1q8RjkE8wYgDS5zNPQAJeZHkffdadPY" }
                });
                const { res, next } = getMockRes();
                const getUserProfileSpy = jest
                    .spyOn(userManagementService, "getUserProjectGroupsWithRoles")
                    .mockRejectedValueOnce(new Error("DB error"));
                //Act
                await userManagementController.projectGroupRoles(req, res, next);
                //Assert
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe("Reset Credentials", () => {
        describe("Functional", () => {
            test("When requested with valid input, Expect to return true response", async () => {
                //Arrange
                let req = getMockReq({ username: "firstname@tdei.com", password: "lastname" });
                const { res, next } = getMockRes();

                const spy = jest
                    .spyOn(userManagementService, "resetCredentials")
                    .mockResolvedValueOnce(Promise.resolve(true));
                //Act
                await userManagementController.resetCredentials(req, res, next);
                //Assert
                expect(spy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When username which does not exists, Expect to return HTTP status 404", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const spy = jest
                    .spyOn(userManagementService, "resetCredentials")
                    .mockRejectedValueOnce(new HttpException(404, "User not found"));
                //Act
                await userManagementController.resetCredentials(req, res, next);
                //Assert
                expect(spy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(404);
            });

            test("When password policy not satisfied, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const spy = jest
                    .spyOn(userManagementService, "resetCredentials")
                    .mockRejectedValueOnce(new HttpException(400, "Password policy not satisfied"));
                //Act
                await userManagementController.resetCredentials(req, res, next);
                //Assert
                expect(spy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Download users", () => {
        it('should download users', async () => {
            const req = getMockReq();
            const { res, next } = getMockRes();
            const usersCsv = 'name, email, roles';

            const spy = jest
                .spyOn(userManagementService, 'downloadUsers')
                .mockResolvedValueOnce(usersCsv);

            await userManagementController.downloadUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=tdei-users.csv');
            expect(res.send).toHaveBeenCalledWith(usersCsv);
        });
        it('when sql error occured, download users should throw error', async () => {
            let req = getMockReq();
            const { res, next } = getMockRes();
            const usersCsv = 'name,email,roles';
            const spy = jest
                .spyOn(userManagementService, "downloadUsers")
                .mockRejectedValueOnce(new HttpException(500, "Error fetching the tdei users"));
            await userManagementController.downloadUsers(req, res, next);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(next).toBeCalledWith(new HttpException(500, "Error fetching the tdei users"));
        });
    });
});