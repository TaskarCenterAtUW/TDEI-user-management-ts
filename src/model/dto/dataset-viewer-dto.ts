import { IsBoolean, IsNotEmpty } from "class-validator";
import { BaseDto } from "./base-dto";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";

export enum TimeUnit {
    DAYS = "days",
    MONTHS = "months",
    YEARS = "years"
}

export class DatasetViewerDto extends BaseDto {
    @Prop()
    @IsNotEmpty()
    @IsBoolean()
    dataset_viewer_allowed!: boolean;

    @Prop()
    @IsNotEmpty()
    //Validate internal props
    feedback_turnaround_time!: {
        "number": number,
        "unit": TimeUnit
    };

    constructor(init?: Partial<DatasetViewerDto>) {
        super();
        Object.assign(this, init);
    }

    /**
    * Builds the update dataset viewer QueryConfig object
    * @returns QueryConfig object
    */
    getUpdateDatasetViewerQuery(tdei_project_group_id: string): QueryConfig {
        const queryObject = {
            text: `UPDATE project_group SET data_viewer_config = $1 WHERE project_group_id = $2`,
            values: [JSON.stringify(this), tdei_project_group_id]
        }
        return queryObject;
    }
}