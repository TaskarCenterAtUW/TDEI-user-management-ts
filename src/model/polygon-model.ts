import { IsLatitude, IsNotEmpty } from "class-validator";
import { AbstractDomainEntity, Prop } from "nodets-ms-core/lib/models";

export class Coordinates {
    @IsNotEmpty()
    @IsLatitude()
    longitude!: number;
    @IsNotEmpty()
    @IsLatitude()
    latitude!: number;
}

export class Polygon {
    @Prop()
    type: string = "Polygon";
    @Prop()
    coordinates: number[][][] = [];

    constructor(init?: Partial<Polygon>) {
        Object.assign(this, init);
    }

    setGeoCords(params: Coordinates[]) {
        let points = params.map(x => [x.longitude, x.latitude]);
        this.coordinates.push(points);
    }

    getCoordinatePoints(): Coordinates[] {
        let coordinates: Coordinates[] = [];
        this.coordinates.pop()?.forEach(x => {
            coordinates.push(<Coordinates>{ longitude: x[0], latitude: x[1] });
        });
        return coordinates;
    }
}