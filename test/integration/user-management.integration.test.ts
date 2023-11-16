import { Core } from "nodets-ms-core";
import { environment } from "../../src/environment/environment";
import fetch from "node-fetch";
import { PermissionRequest } from "nodets-ms-core/lib/core/auth/model/permission_request";

describe("User Management Test", () => {

    afterAll((done) => {
        done();
    });


    test("Verifying auth service generate secret api integration", async () => {

        if (!process.env.AUTH_HOST) {
            console.error("AUTH_HOST environment not set");
            expect(process.env.AUTH_HOST != undefined && process.env.AUTH_HOST != null).toBeTruthy();
            return;
        }
        console.log(environment.secretGenerateUrl);



        //Act
        const getSecret = await fetch(environment.secretGenerateUrl as string, {
            method: 'get'
        });

        //Assert
        expect(getSecret.status == 200).toBeTruthy();
    }, 15000);
    /**
    * Environement dependency 
    * AUTH_HOST
    */
    test("Verifying auth service hasPermission api integration", async () => {
        //Pre-requisite environment dependency
        if (!process.env.AUTH_HOST) {
            console.error("AUTH_HOST environment not set");
            expect(process.env.AUTH_HOST != undefined && process.env.AUTH_HOST != null).toBeTruthy();
            return;
        }

        //Arrange
        var permissionRequest = new PermissionRequest({
            userId: "test_userId",
            projectGroupId: "test_projectGroupId",
            permssions: ["tdei-admin", "poc", "user-management_data_generator"],
            shouldSatisfyAll: false
        });
        const authProvider = Core.getAuthorizer({ provider: "Hosted", apiUrl: environment.permissionUrl });
        //ACT
        const response = await authProvider?.hasPermission(permissionRequest);
        //Assert
        expect(response).toBeFalsy();
    }, 15000);
});