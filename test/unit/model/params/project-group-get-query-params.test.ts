import { ProjectGroupQueryParams } from "../../../../src/model/params/project-group-get-query-params";

describe("ProjectGroupQueryParams query building", () => {
    test("counts matching project groups without the page join, limit, or offset", () => {
        const params = new ProjectGroupQueryParams({
            searchText: "Ada",
            tdei_project_group_id: "11111111-1111-1111-1111-111111111111",
            bbox: [1, 2, 3, 4],
            page_no: 2,
            page_size: 80,
            show_inactive: true,
            data_viewer_allowed: false,
        });

        const countQuery = params.getCountQueryObject();
        const listQuery = params.getQueryObject();

        expect(countQuery.getQuery()).toContain("SELECT COUNT(*)::int AS total FROM project_group o");
        expect(countQuery.getQuery()).not.toMatch(/join|LIMIT|OFFSET|GROUP BY/i);
        expect(countQuery.getValues()).toEqual([
            "Ada%",
            "11111111-1111-1111-1111-111111111111",
            1,
            2,
            3,
            4,
            false,
            false,
        ]);

        expect(listQuery.getQuery()).toContain("left join keycloak.user_entity");
        expect(listQuery.getQuery()).toContain("LIMIT");
        expect(listQuery.getQuery()).toContain("OFFSET");
        expect(listQuery.getValues()).toEqual([
            50,
            50,
            ...countQuery.getValues(),
        ]);
        expect(params.page_no).toBe(2);
        expect(params.page_size).toBe(50);
    });

    test("defaults paging and keeps active project groups when filters are omitted", () => {
        const params = new ProjectGroupQueryParams();

        const listQuery = params.getQueryObject();

        expect(params.page_no).toBe(1);
        expect(params.page_size).toBe(10);
        expect(listQuery.getValues()).toEqual([10, 0, true]);
        expect(params.getCountQueryObject().getValues()).toEqual([true]);
    });

    test("ignores an incomplete bounding box and a blank name search", () => {
        const params = new ProjectGroupQueryParams({
            searchText: "",
            bbox: [1, 2],
            show_inactive: "TRUE" as unknown as boolean,
        });

        const countQuery = params.getCountQueryObject();

        expect(countQuery.getValues()).toEqual([false]);
        expect(countQuery.getQuery()).not.toContain("ST_MakeEnvelope");
        expect(countQuery.getQuery()).not.toContain("ILIKE");
    });
});
