import { DuplicateException, ForeignKeyException } from "../../src/exceptions/http/http-exceptions";
import dbClient from "../../src/database/data-source";
import { DatabaseError, QueryResult } from "pg";
import UniqueKeyDbException, { ForeignKeyDbException } from "../../src/exceptions/db/database-exceptions";
import { TestHelper } from "../common/test-helper";
import pathwaysStationService from "../../src/service/pathways-station-service";
import { StationUpdateDto } from "../../src/model/dto/station-update-dto";
import { StationQueryParams } from "../../src/model/params/station-get-query-params";
import { StationDto } from "../../src/model/dto/station-dto";

// group test using describe
describe("Pathways Service Test", () => {

    describe("Create Station", () => {
        describe("Functional", () => {
            test("When requested, Expect to return new station_id", async () => {
                //Arrange
                let input = new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rows: [
                        { station_id: "new_station_id" }
                    ]
                }
                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await pathwaysStationService.createStation(input)).toBe("new_station_id");
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("Duplicate station name"));
                //Act
                //Assert
                await expect(pathwaysStationService.createStation(input)).rejects.toThrow(DuplicateException);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When foreign key exception thrown, Expect to return ForeignKeyException", async () => {
                //Arrange
                let input = new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new ForeignKeyDbException("Contraint error"));
                //Act
                //Assert
                await expect(pathwaysStationService.createStation(input)).rejects.toThrow(ForeignKeyException);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new StationDto({
                    station_name: "test_station_name",
                    tdei_org_id: "test_tdei_org_id",
                });

                const createStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("DB error", 1, "error"));
                //Act
                //Assert
                await expect(pathwaysStationService.createStation(input)).rejects.toThrow(Error);
                expect(createStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Station", () => {
        describe("Functional", () => {
            test("When requested, Expect to return success", async () => {
                //Arrange
                let input = new StationUpdateDto({
                    station_name: "test_station_name",
                    tdei_station_id: "test_station_id",
                    polygon: TestHelper.getPolygon()
                });
                let response = <QueryResult>{
                    rowCount: 1
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await pathwaysStationService.updateStation(input)).toBe(true);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When unique key exception thrown, Expect to return DuplicateException", async () => {
                //Arrange
                let input = new StationUpdateDto({
                    station_name: "test_station_name",
                    tdei_station_id: "test_station_id",
                });

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new UniqueKeyDbException("Duplicate station name"));
                //Act
                //Assert
                await expect(pathwaysStationService.updateStation(input)).rejects.toThrow(DuplicateException);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database exception thrown, Expect to throw error", async () => {
                //Arrange
                let input = new StationUpdateDto({
                    station_name: "test_station_name",
                    tdei_station_id: "test_station_id",
                });

                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("DB error", 1, "error"));
                //Act
                //Assert
                await expect(pathwaysStationService.updateStation(input)).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Get Pathways Station", () => {
        describe("Functional", () => {
            test("When requested, Expect to return list of stations", async () => {
                //Arrange
                let station = new StationDto({
                    station_name: "station_name",
                    tdei_station_id: "tdei_station_id",
                    tdei_org_id: "tdei_org_id",
                    polygon: TestHelper.getPolygon()
                });

                let dbResult: any = {
                    name: "station_name",
                    station_id: "tdei_station_id",
                    owner_org: "tdei_org_id",
                    polygon: JSON.stringify(station.polygon.features[0].geometry)
                }

                let response = <QueryResult>{
                    rowCount: 1,
                    rows: [dbResult]
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                let list = await pathwaysStationService.getStation(new StationQueryParams({
                    searchText: "test",
                    tdei_station_id: "tdei_station_id",
                    tdei_org_id: "tdei_org_id",
                    bbox: <any>[23, 43, 45, 67],
                    page_no: 1,
                    page_size: 10
                }));
                //Assert
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
                expect(list[0]).toMatchObject(station);
            });

            test("When database exception occured, Expect to throw error", async () => {
                //Arrange
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(pathwaysStationService.getStation(new StationQueryParams())).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Update Station Status", () => {
        describe("Functional", () => {

            test("When requested, Expect to return success", async () => {
                //Arrange
                let response = <QueryResult>{
                    rowCount: 1 //effected row
                }
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockResolvedValueOnce(response);
                //Act
                //Assert
                expect(await pathwaysStationService.setStationStatus("input", true)).toBe(true);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

            test("When database error occured, Expect to throw error", async () => {
                //Arrange
                const updateStationSpy = jest
                    .spyOn(dbClient, "query")
                    .mockRejectedValueOnce(new DatabaseError("error", 1, "error"));
                //Act
                //Assert
                await expect(pathwaysStationService.setStationStatus("input", true)).rejects.toThrow(Error);
                expect(updateStationSpy).toHaveBeenCalledTimes(1);
            });

        });
    });
});