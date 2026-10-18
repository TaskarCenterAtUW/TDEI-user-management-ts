export enum Role {
    DATA_GENERATOR = "data_generator",
    TDEI_ADMIN = "tdei_admin",
    POC = "poc",
    TDEI_MEMBER = "member",
}

/** Roles for the tdei-chat application. These are not project-group roles. */
export enum ChatbotAppRole {
    CHATBOT_MANAGER = "chatbot_manager",
}

export const DEFAULT_PROJECT_GROUP = "TDEI Default";

/** The only Keycloak realm. Every user and every application client belongs to it. */
export const TDEI_REALM = "tdei";

/** Keycloak client id for the existing TDEI roles. */
export const TDEI_GATEWAY_CLIENT_ID = "tdei-gateway";
