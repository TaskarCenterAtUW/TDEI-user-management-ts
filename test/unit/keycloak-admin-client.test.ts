import fetchMock from "jest-fetch-mock";
import { environment } from "../../src/environment/environment";
import { KeycloakAdminClient } from "../../src/service/keycloak-admin-client";

describe("Keycloak admin client", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        environment.keycloak.baseUrl = "https://keycloak.example";
        environment.keycloak.realm = "tdei";
        environment.keycloak.clientId = "tdei-admin-api";
        environment.keycloak.clientSecret = "secret";
    });

    test("When listing clients, Expect application clients and omit Keycloak internal clients", async () => {
        fetchMock.mockResponses(
            [JSON.stringify({ access_token: "token", expires_in: 60 }), { status: 200 }],
            [JSON.stringify([
                { clientId: "account", name: "Account", enabled: true },
                { clientId: "tdei-admin-api", name: "Admin API", enabled: true },
                { clientId: "tdei-chat", name: "TDEI Chat", enabled: true },
                { clientId: "retired-app", name: "Retired", enabled: false },
            ]), { status: 200 }]
        );

        const applications = await new KeycloakAdminClient().listApplications();

        expect(applications).toEqual([
            expect.objectContaining({
                realm: "tdei",
                clientId: "tdei-admin-api",
                name: "Admin API",
            }),
            expect.objectContaining({
                realm: "tdei",
                clientId: "tdei-chat",
                name: "TDEI Chat",
            }),
        ]);
        expect(fetchMock.mock.calls[0][0]).toBe("https://keycloak.example/realms/tdei/protocol/openid-connect/token");
        expect(String(fetchMock.mock.calls[1][0])).toContain("/admin/realms/tdei/clients?");
    });
});
