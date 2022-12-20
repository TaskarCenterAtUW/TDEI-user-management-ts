import { IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";

export class StationDto extends BaseDto {
    id!: string;
    @IsNotEmpty()
    org_id!: string;
    @IsNotEmpty()
    stop_name!: string;
    @IsNotEmpty()
    stop_code!: string;
    @IsNotEmpty()
    stop_lat!: number;
    @IsNotEmpty()
    stop_lon!: number;

    constructor(init?: Partial<StationDto>) {
        super();
        Object.assign(this, init);
    }
}