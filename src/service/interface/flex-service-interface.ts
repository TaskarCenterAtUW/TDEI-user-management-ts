import { ServiceDto } from "../../model/dto/service-dto";
import { ServiceUpdateDto } from "../../model/dto/service-update-dto";
import { ServiceQueryParams } from "../../model/params/service-get-query-params";

export interface IFlexService {
    createService(service: ServiceDto): Promise<String>;
    updateService(service: ServiceUpdateDto): Promise<boolean>;
    getService(params: ServiceQueryParams): Promise<ServiceDto[]>;
    setServiceStatus(serviceId: string, status: boolean): Promise<boolean>
}