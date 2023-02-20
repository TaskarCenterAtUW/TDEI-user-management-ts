import { ServiceDto } from "../../model/dto/service-dto";
import { ServiceQueryParams } from "../../model/params/service-get-query-params";

export interface IFlexService {
    createService(service: ServiceDto): Promise<String>;
    updateService(service: ServiceDto): Promise<boolean>;
    getService(params: ServiceQueryParams): Promise<ServiceDto[]>;
    setServiceStatus(serviceId: string, status: boolean): Promise<boolean>
}