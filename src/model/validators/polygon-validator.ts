import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Coordinates, Polygon } from '../polygon-model';
const gjv = require("geojson-validation");

@ValidatorConstraint({ async: true })
export class isPolygon implements ValidatorConstraintInterface {
    message = "Not a valid polygon coordinates.";
    validate(cords: Coordinates[], args: ValidationArguments) {
        let valid = gjv.isPolygon(new Polygon(cords));
        if (!valid) {
            this.message = gjv.isPolygon(new Polygon(cords), true);
        }
        return valid;
    }

    defaultMessage() {
        return this.message[0].replace("at 0: ", "");
    }
}

export function IsValidPolygon(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: isPolygon,
        });
    };
}