import { ProjectGroupUserQueryParams } from "../../../../src/model/params/project-group-user-query-params";

describe("ProjectGroupUserQueryParams query building", () => {
    const projectGroupId = "11111111-1111-1111-1111-111111111111";

    test("matches a full name that contains a space", () => {
        const params = new ProjectGroupUserQueryParams({
            searchText: " John   Smith ",
            tdei_project_group_id: projectGroupId,
        });

        const query = params.getQueryObject();

        expect(query.getQuery()).toContain("CONCAT(ue.first_name, ' ', ue.last_name) ILIKE $3");
        expect(query.getQuery()).toContain("ue.first_name ILIKE $3");
        expect(query.getQuery()).toContain("ue.last_name ILIKE $3");
        expect(query.getQuery()).toContain("ue.username ILIKE $3");
        expect(query.getValues()).toEqual([10, 0, "John Smith%", projectGroupId]);
    });

    test("keeps a single-word search as a prefix on each name column", () => {
        const params = new ProjectGroupUserQueryParams({
            searchText: "Ada",
            tdei_project_group_id: projectGroupId,
        });

        expect(params.getQueryObject().getValues()).toEqual([10, 0, "Ada%", projectGroupId]);
    });

    test("ignores a blank search", () => {
        const params = new ProjectGroupUserQueryParams({
            searchText: "   ",
            tdei_project_group_id: projectGroupId,
        });

        const query = params.getQueryObject();

        expect(query.getQuery()).not.toContain("ILIKE");
        expect(query.getValues()).toEqual([10, 0, projectGroupId]);
    });
});
