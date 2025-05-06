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
import { PaginationRequest } from "src/common/validation/PaginationRequest";

@Injectable()
export class ScreeningsService{
    constructor(
        @InjectRepository(Screening)
        private screeningRepository : Repository<Screening>,
        private readonly roomsService : RoomsService,
        private readonly moviesService : MoviesService
    ) {}

    async listScreenings(queryParams: ListScreeningsParams & PaginationRequest) : Promise<ListingReturn<Screening>> {
        const query = this.screeningRepository.createQueryBuilder('screening')
            .leftJoinAndSelect('screening.room', 'room')
            .leftJoinAndSelect('screening.movie', 'movie')

        // Applying filters
        if(queryParams.roomId !== undefined)
            query.andWhere("room.id = :roomId", {"roomId": queryParams.roomId})

        if(queryParams.roomName !== undefined)
            query.andWhere("room.name = :roomName", {"roomName": queryParams.roomName})

        if(queryParams.movieId !== undefined)
            query.andWhere("movie.id = :movieId", {"movieId": queryParams.movieId})

        if(queryParams.movieTitle !== undefined)
            query.andWhere("movie.title = :movieTitle", {"movieTitle": queryParams.movieTitle})

        if(queryParams.startsAfter !== undefined)
            query.andWhere("screening.startsAt >= :startsAfter", {'startsAfter': queryParams.startsAfter})

        if(queryParams.startsBefore !== undefined)
            query.andWhere("screening.startsAt <= :startsBefore", {'startsBefore': queryParams.startsBefore})

        if(queryParams.endsAfter !== undefined)
            query.andWhere("screening.endsAt >= :endsAfter", {'endsAfter': queryParams.endsAfter})

        if(queryParams.endsBefore !== undefined)
            query.andWhere("screening.endsAt <= :endsBefore", {'endsBefore': queryParams.endsBefore})

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [screenings, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: screenings,
            meta: {
                page: queryParams.page,
                total : total,
                totalPages: totalPages,
                limit: queryParams.limit
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
            .where(
                "NOT (screening.endsAt <= :startsAt OR screening.startsAt >= :endsAt) AND screening.roomId = :roomId",
                {startsAt: startsAt, endsAt: endsAt, roomId: room.id})
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