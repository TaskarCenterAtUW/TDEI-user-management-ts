import { ServiceDto } from "../../model/dto/service-dto";

export interface IFlexService {
    createService(service: ServiceDto): Promise<String>;
    updateService(service: ServiceDto): Promise<boolean>;
    getService(serviceId: string, searchText: string, page_no: number, page_size: number): Promise<ServiceDto[]>;
    setServiceStatus(serviceId: string, status: boolean): Promise<boolean>
}