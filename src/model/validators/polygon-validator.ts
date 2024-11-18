import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { FeatureCollection } from 'geojson';
import gjv from "geojson-validation";

function isGeoJsonFeatureCollection(obj: any): boolean {
    return 'type' in obj && 'features' in obj;
}

@ValidatorConstraint({ async: true })
export class isPolygon implements ValidatorConstraintInterface {
    message = ["Not a valid polygon coordinates."];
    validate(featureCollection: FeatureCollection, args: ValidationArguments) {
        let propertyName = args.property;
        if (!isGeoJsonFeatureCollection(featureCollection)) {
            this.message = [`Please specify valid geojson.`];
            return false;
        }
        else if (featureCollection.features.length > 1) {
            this.message = [`Please specify only one multiPolygon/polygon geometry feature.`];
            return false;
        }
        else if (featureCollection.features.length < 1) {
            this.message = [`Please specify multiPolygon/polygon geometry feature.`];
            return false;
        }
        else if (featureCollection.features[0].geometry.type.toLocaleLowerCase() != "MultiPolygon".toLocaleLowerCase()
            && featureCollection.features[0].geometry.type.toLocaleLowerCase() != "Polygon".toLocaleLowerCase()) {
            this.message = [`Please specify multiPolygon/polygon geometry feature.`];
            return false;
        }

        let polygon = featureCollection.features[0].geometry;
        let validPolygon = true;
        if (!gjv.isPolygon(polygon) && !gjv.isMultiPolygon(polygon)) {
            this.message = [`The geometry is must be a valid Polygon or a MultiPolygon`];
            validPolygon = false;
        }

        return validPolygon;
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