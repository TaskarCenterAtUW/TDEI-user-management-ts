import fetch from "node-fetch";
import { environment } from "../environment/environment";
import { ApplicationDto } from "../model/dto/application-dto";
import HttpException from "../exceptions/http/http-base-exception";

/** Clients Keycloak creates for itself. They are not TDEI applications. */
const KEYCLOAK_INTERNAL_CLIENTS = new Set([
    "account",
    "account-console",
    "admin-cli",
    "broker",
    "realm-management",
    "security-admin-console",
]);

type KeycloakClient = {
    clientId?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
};

/**
 * Reads clients from the tdei realm. Roles are not read or written here.
 */
export class KeycloakAdminClient {
    /** Service-account token from client id and secret. Never a user access token. */
    private serviceAccountToken?: { value: string; expiresAt: number };

    async listApplications(): Promise<ApplicationDto[]> {
        const clients = await this.fetchClients();
        return clients
            .filter(client => this.isApplication(client))
            .map(client => this.toApplication(client))
            .sort((left, right) => left.name.localeCompare(right.name));
    }

    async getApplication(clientId: string): Promise<ApplicationDto | null> {
        const clients = await this.fetchClients();
        const client = clients.find(item => item.clientId === clientId);
        if (!client || !this.isApplication(client))
            return null;
        return this.toApplication(client);
    }

    private isApplication(client: KeycloakClient): boolean {
        if (!client.clientId || client.enabled === false)
            return false;
        if (KEYCLOAK_INTERNAL_CLIENTS.has(client.clientId))
            return false;
        return true;
    }

    private toApplication(client: KeycloakClient): ApplicationDto {
        return new ApplicationDto({
            realm: environment.keycloak.realm,
            clientId: client.clientId,
            name: client.name || client.clientId,
            description: client.description ?? "",
        });
    }

    private async fetchClients(): Promise<KeycloakClient[]> {
        const serviceAccountToken = await this.getServiceAccountToken();
        const pageSize = 100;
        const clients: KeycloakClient[] = [];
        for (let first = 0; ; first += pageSize) {
            const url = `${this.adminUrl()}/clients?first=${first}&max=${pageSize}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${serviceAccountToken}` },
            });
            if (!response.ok)
                throw new HttpException(response.status, "Keycloak client lookup failed");
            const page = await response.json() as KeycloakClient[];
            clients.push(...page);
            if (page.length < pageSize)
                break;
        }
        return clients;
    }

    /**
     * Obtains a token with the configured client id and secret.
     * The caller's user token is not accepted and is not forwarded.
     */
    private async getServiceAccountToken(): Promise<string> {
        const now = Date.now();
        if (this.serviceAccountToken && this.serviceAccountToken.expiresAt > now)
            return this.serviceAccountToken.value;

        const { baseUrl, realm, clientId, clientSecret } = environment.keycloak;
        if (!baseUrl || !clientId || !clientSecret)
            throw new HttpException(500, "Keycloak admin client is not configured");

        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        });
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/realms/${realm}/protocol/openid-connect/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        if (!response.ok)
            throw new HttpException(response.status, "Keycloak admin authentication failed");

        const token = await response.json() as { access_token?: string; expires_in?: number };
        if (!token.access_token)
            throw new HttpException(500, "Keycloak admin authentication failed");

        const expiresInMs = Math.max((token.expires_in ?? 60) - 15, 1) * 1000;
        this.serviceAccountToken = { value: token.access_token, expiresAt: now + expiresInMs };
        return token.access_token;
    }

    private adminUrl(): string {
        const { baseUrl, realm } = environment.keycloak;
        return `${baseUrl.replace(/\/$/, "")}/admin/realms/${realm}`;
    }
}

const keycloakAdminClient = new KeycloakAdminClient();
export default keycloakAdminClient;
