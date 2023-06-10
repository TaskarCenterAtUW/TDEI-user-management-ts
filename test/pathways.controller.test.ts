import { getMockReq, getMockRes } from "@jest-mock/express";
import pathwaysStationServiceController from "../src/controller/pathways-station-controller";
import { DuplicateException, ForeignKeyException, NoDataUpdatedException } from "../src/exceptions/http/http-exceptions";
import { StationDto } from "../src/model/dto/station-dto";
import pathwaysStationServiceService from "../src/service/pathways-station-service";
import pathwaysStationService from "../src/service/pathways-station-service";

describe("Pathways Controller Test", () => {

    describe("Create Station", () => {
        describe("Functional", () => {
            test("When requested, Expect to return station list", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_org_id: "test_org_id" } });
                const { res, next } = getMockRes();
                const createStationSpy = jest
                    .spyOn(pathwaysStationServiceService, "createStation")
                    .mockResolvedValueOnce("new_station_id");
                //Act
                await pathwaysStationServiceController.createStation(req, res, next);
                //Assert
                expect(createStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith({ data: "new_station_id" });
            });

            test("When database foreignkey constraint exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_org_id: "test_org_id" } });
                const { res, next } = getMockRes();
                const createStationSpy = jest
                    .spyOn(pathwaysStationService, "createStation")
                    .mockRejectedValueOnce(new ForeignKeyException("exception"));
                //Act
                await pathwaysStationServiceController.createStation(req, res, next);
                //Assert
                expect(createStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When database uniquekey constraint (same station_name + org_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_org_id: "test_org_id" } });
                const { res, next } = getMockRes();
                const createStationSpy = jest
                    .spyOn(pathwaysStationService, "createStation")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await pathwaysStationServiceController.createStation(req, res, next);
                //Assert
                expect(createStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Update Station", () => {
        describe("Functional", () => {
            test("When requested, Expect to return boolean true on success", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateStationSpy = jest
                    .spyOn(pathwaysStationService, "updateStation")
                    .mockResolvedValueOnce(true);
                //Act
                await pathwaysStationServiceController.updateStation(req, res, next);
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(true);
            });

            test("When database uniquekey constraint (same station_name + org_id) exception occurs, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateStationSpy = jest
                    .spyOn(pathwaysStationService, "updateStation")
                    .mockRejectedValueOnce(new DuplicateException("exception"));
                //Act
                await pathwaysStationServiceController.updateStation(req, res, next);
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            test("When no update happens, Expect to return HTTP status 400", async () => {
                //Arrange
                let req = getMockReq({ body: { station_name: "test_station", tdei_station_id: "test_tdei_station_id" } });
                const { res, next } = getMockRes();
                const updateStationSpy = jest
                    .spyOn(pathwaysStationService, "updateStation")
                    .mockRejectedValueOnce(new NoDataUpdatedException());
                //Act
                await pathwaysStationServiceController.updateStation(req, res, next);
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("Get Pathways Station", () => {
        describe("Functional", () => {
            test("When requested without any filter, Expect to return pathways station list", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                var list = [new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id"
                })];
                const getStationSpy = jest
                    .spyOn(pathwaysStationService, "getStation")
                    .mockResolvedValueOnce(list);
                //Act
                await pathwaysStationServiceController.getStation(req, res, next);
                //Assert
                expect(getStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When requested with all filters, Expect to return pathways station list", async () => {
                //Arrange

                let req = getMockReq({
                    query: {
                        searchText: "test",
                        tdei_station_id: "tdei_station_id",
                        tdei_org_id: "tdei_org_id",
                        bbox: <any>[23, 43, 45, 67]
                    }
                });
                const { res, next } = getMockRes();
                var list = [new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id"
                })];
                const getStationSpy = jest
                    .spyOn(pathwaysStationService, "getStation")
                    .mockResolvedValueOnce(list);
                //Act
                await pathwaysStationServiceController.getStation(req, res, next);
                //Assert
                expect(getStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toBeCalledWith(list);
            });

            test("When database exception occurs, Expect to return HTTP status 500", async () => {
                //Arrange
                let req = getMockReq();
                const { res, next } = getMockRes();
                const getStationSpy = jest
                    .spyOn(pathwaysStationService, "getStation")
                    .mockRejectedValueOnce(new Error("exception"));
                //Act
                await pathwaysStationServiceController.getStation(req, res, next);
                //Assert
                expect(getStationSpy).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });
});