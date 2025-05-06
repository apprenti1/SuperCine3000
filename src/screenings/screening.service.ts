import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Screening } from "./screening.entity";
import { DeleteResult, Repository } from "typeorm";
import { ListScreeningsParams } from "./validation/list-screenings.schema";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { ScreeningId } from "./validation/screening-id.schema";
import { CreateScreeningRequest } from "./validation/create-screening.schema";
import { UpdateScreeningRequest } from "./validation/update-screening.schema";
import { RoomsService } from "src/rooms/rooms.service";
import { MoviesService } from "src/movies/movies.service";
import { Room } from "src/rooms/entities/room.entity";
import ms from "ms";

@Injectable()
export class ScreeningsService{
    constructor(
        @InjectRepository(Screening)
        private screeningRepository : Repository<Screening>,
        private readonly roomsService : RoomsService,
        private readonly moviesService : MoviesService
    ) {}

    async listScreenings(queryParams: ListScreeningsParams) : Promise<ListingReturn<Screening>> {
        const s = await this.screeningRepository.find()
        return {
            data: s,
            meta: {
                page: 1,
                total : 1,
                totalPages: 1,
                limit: 10
            }
        }
    }

    async getScreening(params: ScreeningId) : Promise<Screening> {
        const screening = await this.screeningRepository.findOne({where: {id: params.id}, relations: ['room', 'movie']})
        if(screening === null)
            throw new NotFoundException('Screening not found.')

        return screening
    }

    async createScreening(body: CreateScreeningRequest) : Promise<Screening> {
        // We check and get the date format
        const startsAt = new Date(body.startsAt)
        if(startsAt === null)
            throw new BadRequestException('`startsAt property should be in ISO 8601.`')

        // We get and check the movie existence
        const movie = await this.moviesService.getMovie({id: body.movieId})

        // We get and check the room existence
        let room : Room | null = null
        if(body.roomId !== undefined)
            room = await this.roomsService.findByRoomId(body.roomId)
        else if(body.roomName !== undefined)
            room = await this.roomsService.findByName(body.roomName)

        if(room === null)
            throw new NotFoundException('Room not found.')

        // We compute the endsAt value (startsAt + movie duration + 30min of cleaning)
        const endsAt = new Date(startsAt.getTime() + movie.duration_ms + ms("30min"))

        // We check if there are schedule overlaps
        const conflictScreenings = await this.screeningRepository
            .createQueryBuilder('screening')
            .where("NOT (screening.endsAt <= :startsAt OR screening.startsAt >= :endsAt) AND screening.roomId = :roomId", {startsAt: startsAt, endsAt: endsAt, roomId: room.id})
            .getMany()

        if(conflictScreenings.length > 0)
            throw new ConflictException('A screening is already planned in this room in this time slot.')

        let screening = this.screeningRepository.create({startsAt, endsAt, room, movie})
        screening = await this.screeningRepository.save(screening)

        return screening
    }

    async patchScreening(params: ScreeningId, body: UpdateScreeningRequest) : Promise<Screening> {
        const s = await this.screeningRepository.findOne({where: {id: 1}})
        if(!s)
            throw new NotFoundException()
        return s
    }

    async deleteScreening(params: ScreeningId) : Promise<DeleteResult> {
        const deletedScreening = await this.screeningRepository.delete(params.id)
        if(deletedScreening.affected === 0)
            throw new NotFoundException('Screening not found.')

        return deletedScreening
    }

    async seed() {
        // TODO SEED UN MOIS DE SEANCES
    }
}