import "reflect-metadata";
import { validate } from "class-validator";
import { RolesReqDto } from "../../../../src/model/dto/roles-req-dto";

describe("RolesReqDto validation", () => {
    const validUser = {
        user_name: "user@example.com",
        roles: ["poc"],
    };

    test("rejects a missing project group id", async () => {
        const dto = new RolesReqDto(validUser);

        const errors = await validate(dto);

        expect(errors.map((error) => error.property)).toContain("tdei_project_group_id");
    });

    test("rejects a null project group id", async () => {
        const dto = new RolesReqDto({
            ...validUser,
            tdei_project_group_id: null as any,
        });

        const errors = await validate(dto);

        expect(errors.map((error) => error.property)).toContain("tdei_project_group_id");
    });

    test("rejects a project group id that is not a UUID length", async () => {
        const dto = new RolesReqDto({
            ...validUser,
            tdei_project_group_id: "not-a-uuid",
        });

        const errors = await validate(dto);

        expect(errors.map((error) => error.property)).toContain("tdei_project_group_id");
    });

    test("accepts a 36 character project group id", async () => {
        const dto = new RolesReqDto({
            ...validUser,
            tdei_project_group_id: "11111111-1111-1111-1111-111111111111",
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
