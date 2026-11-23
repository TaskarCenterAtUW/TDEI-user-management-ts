import { ServiceQueryParams } from "../../../../src/model/params/service-get-query-params";

describe("ServiceQueryParams query building", () => {
    test("counts matching services with the same filters and without the page clause", () => {
        const params = new ServiceQueryParams({
            searchText: "Ada",
            service_type: "flex",
            tdei_service_id: "11111111-1111-1111-1111-111111111111",
            tdei_project_group_id: "22222222-2222-2222-2222-222222222222",
            bbox: [1, 2, 3, 4],
            page_no: 2,
            page_size: 80,
            show_inactive: true,
        });

        const countQuery = params.getCountQueryObject();
        const listQuery = params.getQueryObject();

        expect(countQuery.getQuery()).toContain("SELECT COUNT(*)::int AS total FROM service");
        expect(countQuery.getQuery()).not.toMatch(/LIMIT|OFFSET|ORDER BY|ST_AsGeoJSON/i);
        expect(countQuery.getValues()).toEqual([
            false,
            "flex",
            "Ada%",
            "11111111-1111-1111-1111-111111111111",
            "22222222-2222-2222-2222-222222222222",
            1,
            2,
            3,
            4,
        ]);

        expect(listQuery.getQuery()).toContain("ST_AsGeoJSON(polygon) as polygon");
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

    test("defaults paging and keeps active services of every type", () => {
        const params = new ServiceQueryParams();

        const listQuery = params.getQueryObject();

        expect(params.page_no).toBe(1);
        expect(params.page_size).toBe(10);
        expect(listQuery.getValues()).toEqual([10, 0, true]);
        expect(listQuery.getQuery()).not.toContain("service_type =");
        expect(params.getCountQueryObject().getValues()).toEqual([true]);
    });

    test("ignores an incomplete bounding box, a blank name, and the all service type", () => {
        const params = new ServiceQueryParams({
            searchText: "",
            service_type: "all",
            bbox: [1, 2],
            show_inactive: "TRUE" as unknown as boolean,
        });

        const countQuery = params.getCountQueryObject();

        expect(countQuery.getValues()).toEqual([false]);
        expect(countQuery.getQuery()).not.toContain("ST_MakeEnvelope");
        expect(countQuery.getQuery()).not.toContain("ILIKE");
        expect(countQuery.getQuery()).not.toContain("service_type");
    });
});
