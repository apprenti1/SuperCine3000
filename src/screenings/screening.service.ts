import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Screening } from "./screening.entity";
import { DeleteResult, Repository } from "typeorm";
import { ListScreeningsParams } from "./validation/list-screenings.schema";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { ScreeningId } from "./validation/screening-id.schema";
import { CreateScreeningRequest } from "./validation/create-screening.schema";
import { UpdateScreeningRequest } from "./validation/update-screening.schema";

@Injectable()
export class ScreeningsService{
    constructor(
        @InjectRepository(Screening)
        private screeningRepository : Repository<Screening>
    ) {}

    async listScreenings(queryParams: ListScreeningsParams) : Promise<ListingReturn<Screening>> {

    }

    async getScreening(params: ScreeningId) : Promise<Screening> {

    }

    async createScreening(body: CreateScreeningRequest) : Promise<Screening> {
        
    }

    async patchScreening(params: ScreeningId, body: UpdateScreeningRequest) : Promise<Screening> {
        
    }

    async deleteScreening(params: ScreeningId) : Promise<DeleteResult> {
        
    }
}