import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { FeatureCollection } from 'geojson';
const gjv = require("geojson-validation");

function isGeoJsonFeatureCollection(obj: any): boolean {
    return 'type' in obj && 'features' in obj;
}

@ValidatorConstraint({ async: true })
export class isPolygon implements ValidatorConstraintInterface {
    message = ["Not a valid polygon coordinates."];
    validate(featureCollection: FeatureCollection, args: ValidationArguments) {
        let propertyName = args.property;
        if (!isGeoJsonFeatureCollection(featureCollection)) {
            this.message = [`${propertyName}, Please specify valid geojson.`];
            return false;
        }
        else if (featureCollection.features.length > 1) {
            this.message = [`${propertyName}, Please specify only one polygon geometry feature.`];
            return false;
        }
        else if (featureCollection.features.length < 1) {
            this.message = [`${propertyName}, Please specify polygon geometry feature.`];
            return false;
        }
        else if (featureCollection.features[0].geometry.type != "Polygon") {
            this.message = [`${propertyName}, Please specify polygon geometry feature.`];
            return false;
        }

        let polygon = featureCollection.features[0].geometry;
        let valid = gjv.isPolygon(polygon);
        if (!valid) {
            this.message = gjv.isPolygon(polygon, true);
        }
        return valid;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property}, ${this.message[0].replace("at 0: ", "")}`;
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