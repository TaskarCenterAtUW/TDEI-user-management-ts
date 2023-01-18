import { IsLatitude, IsNotEmpty, isNumber } from "class-validator";

export class Coordinates {
    @IsNotEmpty()
    @IsLatitude()
    longitude!: number;
    @IsNotEmpty()
    @IsLatitude()
    latitude!: number;
}

export class Polygon {
    type: string = "Polygon";
    coordinates: number[][][] = [];

    constructor(cords: Coordinates[]) {
        if (cords)
            this.setGeoCords(cords);
    }

    private setGeoCords(params: Coordinates[]) {
        let points = params.map(x => [x.longitude, x.latitude]);
        this.coordinates.push(points);
    }
}