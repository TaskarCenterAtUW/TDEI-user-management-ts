import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, validate, ValidateNested, ValidationError } from "class-validator";
import { BaseDto } from "./base-dto";
import { Prop } from "nodets-ms-core/lib/models";
import { QueryConfig } from "pg";
import { InputException } from "../../exceptions/http/http-exceptions";
import { plainToInstance, Type } from "class-transformer";

export enum TimeUnit {
    DAYS = "days",
    MONTHS = "months",
    YEARS = "years"
}

export class FeedbackTurnaroundTime {
    @IsNotEmpty()
    @IsNumber()
    number!: number;

    @IsNotEmpty()
    @IsEnum(TimeUnit)
    units!: TimeUnit;
}

export class DatasetViewerDto extends BaseDto {
    @Prop()
    @IsNotEmpty()
    @IsBoolean()
    dataset_viewer_allowed!: boolean;

    @Prop()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => FeedbackTurnaroundTime)
    feedback_turnaround_time!: FeedbackTurnaroundTime;

    constructor(init?: Partial<DatasetViewerDto>) {
        super();
        Object.assign(this, init);
    }

    async validateRequestInput() {
        const dto = plainToInstance(this.constructor as new () => DatasetViewerDto, this);
        let errors = await validate(dto);
        if (errors.length > 0) {
            console.log('Input validation failed');
            let message = errors
                .map((error: ValidationError) => {
                    if (error.constraints) {
                        return Object.values(error.constraints);
                    }
                    if (error.children && error.children.length > 0) {
                        // Nested validation messages
                        return error.children.map(c => Object.values(c.constraints || {})).join(', ');
                    }
                    return '';
                })
                .join(', ');

            throw new InputException(`Required fields are missing or invalid: ${message}`);
        }
        return true;
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