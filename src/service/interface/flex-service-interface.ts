import { ServiceDto } from "../../model/dto/service-dto";
import { ServiceUpdateDto } from "../../model/dto/service-update-dto";
import { ServiceQueryParams } from "../../model/params/service-get-query-params";

export interface ServiceListPage {
    items: ServiceDto[];
    totalCount: number;
    pageNo: number;
    pageSize: number;
}

export interface IFlexService {
    createService(service: ServiceDto): Promise<String>;
    updateService(service: ServiceUpdateDto): Promise<boolean>;
    getService(params: ServiceQueryParams): Promise<ServiceListPage>;
    setServiceStatus(serviceId: string, status: boolean): Promise<boolean>;
    getServiceById(project_group_id: string): Promise<ServiceDto>;
}