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
import { Movie } from "src/movies/movie.entity";

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

        // We compute the endsAt value
        const endsAt = this.computeEndsAt(startsAt, movie)

        // We check the cinema is open for the given times
        if(startsAt.getHours() < 9 || endsAt.getHours() > 20)
            throw new BadRequestException("A screening must happen between 9:00 and 20:00.")


        // We get and check the room existence
        let room : Room | null = null
        if(body.roomId !== undefined)
            room = await this.roomsService.findByRoomId(body.roomId)
        else if(body.roomName !== undefined)
            room = await this.roomsService.findByName(body.roomName)

        if(room === null)
            throw new NotFoundException('Room not found.')


        // We check if there are schedule overlaps
        if(await this.isThereScheduleOverlaps(startsAt, endsAt, room))
            throw new ConflictException('A screening is already planned in this room, in this time slot.')

        let screening = this.screeningRepository.create({startsAt, endsAt, room, movie})
        screening = await this.screeningRepository.save(screening)

        return screening
    }

    async patchScreening(params: ScreeningId, body: UpdateScreeningRequest) : Promise<Screening> {
        let screening = await this.screeningRepository.findOne({where: {id: params.id}, relations: ['room', 'movie']})
        if(!screening)
            throw new NotFoundException("Screening not found.")

        if(body.startsAt !== undefined)
            screening.startsAt = new Date(body.startsAt)

        if(body.movieId !== undefined){
            const movie : Movie = await this.moviesService.getMovie({id: body.movieId})
            screening.movie = movie
        }

        if(body.startsAt !== undefined || body.movieId !== undefined)
            screening.endsAt = this.computeEndsAt(screening.startsAt, screening.movie)

        if(body.roomId !== undefined){
            const room = await this.roomsService.findByRoomId(body.roomId)
            screening.room = room
        }

        if(body.roomName !== undefined){
            const room = await this.roomsService.findByName(body.roomName)
            screening.room = room
        }

        // We check the cinema is open for the given times
        if(screening.startsAt.getHours() < 9 || screening.endsAt.getHours() > 20)
            throw new BadRequestException("A screening must happen between 9:00 and 20:00.")

        // We check if there is schedule overlaps
        if(await this.isThereScheduleOverlaps(screening.startsAt, screening.endsAt, screening.room, screening.id))
            throw new ConflictException("A screening is already planned in this room, in this time slot.")

        screening = await this.screeningRepository.save(screening)

        return screening
    }

    private computeEndsAt(startsAt : Date, movie: Movie) : Date {
        // endsAt = startsAt + movie duration + 30min of cleaning
        return new Date(startsAt.getTime() + movie.duration_ms + ms("30min"))
    }

    private async isThereScheduleOverlaps(startsAt: Date, endsAt: Date, room: Room, screeningId?: number) : Promise<boolean> {
        const query = this.screeningRepository
            .createQueryBuilder('screening')
            .where(
                "NOT (screening.endsAt <= :startsAt OR screening.startsAt >= :endsAt) AND screening.roomId = :roomId",
                {startsAt: startsAt, endsAt: endsAt, roomId: room.id})
            
            if(screeningId !== undefined)
                query.andWhere("screening.id <> :id", {id: screeningId})
            
        const conflictScreenings = await query.getMany()

        return conflictScreenings.length > 0
    }

    async deleteScreening(params: ScreeningId) : Promise<DeleteResult> {
        const deletedScreening = await this.screeningRepository.delete(params.id)
        if(deletedScreening.affected === 0)
            throw new NotFoundException('Screening not found.')

        return deletedScreening
    }

    async seed() {
        const screenings : Screening[] = [
            /*new Screening(
                1, new Date("2025-05-05T09:19:57.168Z"), new Date("2025-05-05T09:19:57.168Z"),
                await this.roomsService.findByName("Cosmos"), await this.moviesService.getMovie({id: 5})
            ),*/
            new Screening(1,  new Date("2025-05-12T10:00:00Z"), this.computeEndsAt(new Date("2025-05-12T10:00:00Z"), await this.moviesService.getMovie({id: 36})), await this.roomsService.findByName("Horizon")       , await this.moviesService.getMovie({id: 36})),
            new Screening(2,  new Date("2025-05-12T13:00:00Z"), this.computeEndsAt(new Date("2025-05-12T13:00:00Z"), await this.moviesService.getMovie({id: 14})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 14})),
            new Screening(3,  new Date("2025-05-12T11:00:00Z"), this.computeEndsAt(new Date("2025-05-12T11:00:00Z"), await this.moviesService.getMovie({id: 25})), await this.roomsService.findByName("Horizon")       , await this.moviesService.getMovie({id: 25})),
            new Screening(4,  new Date("2025-05-12T19:00:00Z"), this.computeEndsAt(new Date("2025-05-12T19:00:00Z"), await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 23})),
            new Screening(5,  new Date("2025-05-13T20:00:00Z"), this.computeEndsAt(new Date("2025-05-13T20:00:00Z"), await this.moviesService.getMovie({id: 43})), await this.roomsService.findByName("Studio 1")      , await this.moviesService.getMovie({id: 43})),
            new Screening(6,  new Date("2025-05-13T15:00:00Z"), this.computeEndsAt(new Date("2025-05-13T15:00:00Z"), await this.moviesService.getMovie({id: 34})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id: 34})),
            new Screening(7,  new Date("2025-05-14T15:00:00Z"), this.computeEndsAt(new Date("2025-05-14T15:00:00Z"), await this.moviesService.getMovie({id:  1})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id:  1})),
            new Screening(8,  new Date("2025-05-14T18:00:00Z"), this.computeEndsAt(new Date("2025-05-14T18:00:00Z"), await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 23})),
            new Screening(9,  new Date("2025-05-14T12:00:00Z"), this.computeEndsAt(new Date("2025-05-14T12:00:00Z"), await this.moviesService.getMovie({id: 13})), await this.roomsService.findByName("Expérience 4DX"), await this.moviesService.getMovie({id: 13})),
            new Screening(10, new Date("2025-05-14T10:00:00Z"), this.computeEndsAt(new Date("2025-05-14T10:00:00Z"),await this.moviesService.getMovie({id:  8})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id:  8})),
            new Screening(11, new Date("2025-05-15T17:00:00Z"), this.computeEndsAt(new Date("2025-05-15T17:00:00Z"),await this.moviesService.getMovie({id: 46})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 46})),
            new Screening(12, new Date("2025-05-15T16:00:00Z"), this.computeEndsAt(new Date("2025-05-15T16:00:00Z"),await this.moviesService.getMovie({id: 39})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 39})),
            new Screening(13, new Date("2025-05-16T16:00:00Z"), this.computeEndsAt(new Date("2025-05-16T16:00:00Z"),await this.moviesService.getMovie({id:  2})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id:  2})),
            new Screening(14, new Date("2025-05-16T19:00:00Z"), this.computeEndsAt(new Date("2025-05-16T19:00:00Z"),await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Studio 1")      , await this.moviesService.getMovie({id: 23})),
            new Screening(15, new Date("2025-05-16T11:00:00Z"), this.computeEndsAt(new Date("2025-05-16T11:00:00Z"),await this.moviesService.getMovie({id: 12})), await this.roomsService.findByName("Horizon")       , await this.moviesService.getMovie({id: 12})),
            new Screening(16, new Date("2025-05-16T09:00:00Z"), this.computeEndsAt(new Date("2025-05-16T09:00:00Z"),await this.moviesService.getMovie({id: 18})), await this.roomsService.findByName("Horizon")       , await this.moviesService.getMovie({id: 18})),
            new Screening(17, new Date("2025-05-17T18:00:00Z"), this.computeEndsAt(new Date("2025-05-17T18:00:00Z"),await this.moviesService.getMovie({id: 24})), await this.roomsService.findByName("Expérience 4DX"), await this.moviesService.getMovie({id: 24})),
            new Screening(18, new Date("2025-05-17T20:00:00Z"), this.computeEndsAt(new Date("2025-05-17T20:00:00Z"),await this.moviesService.getMovie({id: 24})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 24})),
            new Screening(19, new Date("2025-05-17T12:00:00Z"), this.computeEndsAt(new Date("2025-05-17T12:00:00Z"),await this.moviesService.getMovie({id: 34})), await this.roomsService.findByName("Studio 1")      , await this.moviesService.getMovie({id: 34})),
            new Screening(20, new Date("2025-05-17T19:00:00Z"), this.computeEndsAt(new Date("2025-05-17T19:00:00Z"),await this.moviesService.getMovie({id: 35})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 35})),
            new Screening(21, new Date("2025-05-18T13:00:00Z"), this.computeEndsAt(new Date("2025-05-18T13:00:00Z"),await this.moviesService.getMovie({id: 26})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 26})),
            new Screening(22, new Date("2025-05-18T11:00:00Z"), this.computeEndsAt(new Date("2025-05-18T11:00:00Z"),await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 23})),
            new Screening(23, new Date("2025-05-19T19:00:00Z"), this.computeEndsAt(new Date("2025-05-19T19:00:00Z"),await this.moviesService.getMovie({id: 44})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id: 44})),
            new Screening(24, new Date("2025-05-19T10:00:00Z"), this.computeEndsAt(new Date("2025-05-19T10:00:00Z"),await this.moviesService.getMovie({id:  1})), await this.roomsService.findByName("Luxe Lounge")   , await this.moviesService.getMovie({id:  1})),
            new Screening(25, new Date("2025-05-19T14:00:00Z"), this.computeEndsAt(new Date("2025-05-19T14:00:00Z"),await this.moviesService.getMovie({id:  8})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id:  8})),
            new Screening(26, new Date("2025-05-20T14:00:00Z"), this.computeEndsAt(new Date("2025-05-20T14:00:00Z"),await this.moviesService.getMovie({id: 36})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 36})),
            new Screening(27, new Date("2025-05-20T12:00:00Z"), this.computeEndsAt(new Date("2025-05-20T12:00:00Z"),await this.moviesService.getMovie({id: 39})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 39})),
            new Screening(28, new Date("2025-05-20T11:00:00Z"), this.computeEndsAt(new Date("2025-05-20T11:00:00Z"),await this.moviesService.getMovie({id: 45})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id: 45})),
            new Screening(29, new Date("2025-05-21T18:00:00Z"), this.computeEndsAt(new Date("2025-05-21T18:00:00Z"),await this.moviesService.getMovie({id: 25})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 25})),
            new Screening(30, new Date("2025-05-21T11:00:00Z"), this.computeEndsAt(new Date("2025-05-21T11:00:00Z"),await this.moviesService.getMovie({id: 10})), await this.roomsService.findByName("Studio 1")      , await this.moviesService.getMovie({id: 10})),
            new Screening(31, new Date("2025-05-22T20:00:00Z"), this.computeEndsAt(new Date("2025-05-22T20:00:00Z"),await this.moviesService.getMovie({id: 18})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 18})),
            new Screening(32, new Date("2025-05-22T13:00:00Z"), this.computeEndsAt(new Date("2025-05-22T13:00:00Z"),await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 23})),
            new Screening(33, new Date("2025-05-22T18:00:00Z"), this.computeEndsAt(new Date("2025-05-22T18:00:00Z"),await this.moviesService.getMovie({id:  2})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id:  2})),
            new Screening(34, new Date("2025-05-22T14:00:00Z"), this.computeEndsAt(new Date("2025-05-22T14:00:00Z"),await this.moviesService.getMovie({id: 34})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 34})),
            new Screening(35, new Date("2025-05-23T18:00:00Z"), this.computeEndsAt(new Date("2025-05-23T18:00:00Z"),await this.moviesService.getMovie({id: 19})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 19})),
            new Screening(36, new Date("2025-05-23T13:00:00Z"), this.computeEndsAt(new Date("2025-05-23T13:00:00Z"),await this.moviesService.getMovie({id:  5})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id:  5})),
            new Screening(37, new Date("2025-05-23T09:00:00Z"), this.computeEndsAt(new Date("2025-05-23T09:00:00Z"),await this.moviesService.getMovie({id: 45})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id: 45})),
            new Screening(38, new Date("2025-05-23T14:00:00Z"), this.computeEndsAt(new Date("2025-05-23T14:00:00Z"),await this.moviesService.getMovie({id:  7})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id:  7})),
            new Screening(39, new Date("2025-05-24T09:00:00Z"), this.computeEndsAt(new Date("2025-05-24T09:00:00Z"),await this.moviesService.getMovie({id:  3})), await this.roomsService.findByName("Expérience 4DX"), await this.moviesService.getMovie({id:  3})),
            new Screening(40, new Date("2025-05-24T19:00:00Z"), this.computeEndsAt(new Date("2025-05-24T19:00:00Z"),await this.moviesService.getMovie({id: 19})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 19})),
            new Screening(41, new Date("2025-05-24T20:00:00Z"), this.computeEndsAt(new Date("2025-05-24T20:00:00Z"),await this.moviesService.getMovie({id: 25})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 25})),
            new Screening(42, new Date("2025-05-25T14:00:00Z"), this.computeEndsAt(new Date("2025-05-25T14:00:00Z"),await this.moviesService.getMovie({id: 31})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 31})),
            new Screening(43, new Date("2025-05-25T20:00:00Z"), this.computeEndsAt(new Date("2025-05-25T20:00:00Z"),await this.moviesService.getMovie({id: 22})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 22})),
            new Screening(44, new Date("2025-05-26T20:00:00Z"), this.computeEndsAt(new Date("2025-05-26T20:00:00Z"),await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 23})),
            new Screening(45, new Date("2025-05-26T10:00:00Z"), this.computeEndsAt(new Date("2025-05-26T10:00:00Z"),await this.moviesService.getMovie({id: 44})), await this.roomsService.findByName("Expérience 4DX"), await this.moviesService.getMovie({id: 44})),
            new Screening(46, new Date("2025-05-26T11:00:00Z"), this.computeEndsAt(new Date("2025-05-26T11:00:00Z"),await this.moviesService.getMovie({id: 11})), await this.roomsService.findByName("Luxe Lounge")   , await this.moviesService.getMovie({id: 11})),
            new Screening(47, new Date("2025-05-27T20:00:00Z"), this.computeEndsAt(new Date("2025-05-27T20:00:00Z"),await this.moviesService.getMovie({id: 18})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id: 18})),
            new Screening(48, new Date("2025-05-27T09:00:00Z"), this.computeEndsAt(new Date("2025-05-27T09:00:00Z"),await this.moviesService.getMovie({id: 34})), await this.roomsService.findByName("Évasion")       , await this.moviesService.getMovie({id: 34})),
            new Screening(49, new Date("2025-05-28T12:00:00Z"), this.computeEndsAt(new Date("2025-05-28T12:00:00Z"),await this.moviesService.getMovie({id: 25})), await this.roomsService.findByName("Studio 3")      , await this.moviesService.getMovie({id: 25})),
            new Screening(50, new Date("2025-05-28T17:00:00Z"), this.computeEndsAt(new Date("2025-05-28T17:00:00Z"),await this.moviesService.getMovie({id: 12})), await this.roomsService.findByName("Tornado")       , await this.moviesService.getMovie({id: 12})),
            new Screening(51, new Date("2025-05-28T14:00:00Z"), this.computeEndsAt(new Date("2025-05-28T14:00:00Z"),await this.moviesService.getMovie({id: 22})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id: 22})),
            new Screening(52, new Date("2025-05-28T19:00:00Z"), this.computeEndsAt(new Date("2025-05-28T19:00:00Z"),await this.moviesService.getMovie({id: 46})), await this.roomsService.findByName("Horizon")       , await this.moviesService.getMovie({id: 46})),
            new Screening(53, new Date("2025-05-29T15:00:00Z"), this.computeEndsAt(new Date("2025-05-29T15:00:00Z"),await this.moviesService.getMovie({id: 26})), await this.roomsService.findByName("Luxe Lounge")   , await this.moviesService.getMovie({id: 26})),
            new Screening(54, new Date("2025-05-29T19:00:00Z"), this.computeEndsAt(new Date("2025-05-29T19:00:00Z"),await this.moviesService.getMovie({id: 15})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 15})),
            new Screening(55, new Date("2025-05-29T09:00:00Z"), this.computeEndsAt(new Date("2025-05-29T09:00:00Z"),await this.moviesService.getMovie({id: 40})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id: 40})),
            new Screening(56, new Date("2025-05-30T14:00:00Z"), this.computeEndsAt(new Date("2025-05-30T14:00:00Z"),await this.moviesService.getMovie({id: 28})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 28})),
            new Screening(57, new Date("2025-05-30T10:00:00Z"), this.computeEndsAt(new Date("2025-05-30T10:00:00Z"),await this.moviesService.getMovie({id:  8})), await this.roomsService.findByName("Luxe Lounge")   , await this.moviesService.getMovie({id:  8})),
            new Screening(58, new Date("2025-05-30T13:00:00Z"), this.computeEndsAt(new Date("2025-05-30T13:00:00Z"),await this.moviesService.getMovie({id: 23})), await this.roomsService.findByName("Studio 1")      , await this.moviesService.getMovie({id: 23})),
            new Screening(59, new Date("2025-05-31T20:00:00Z"), this.computeEndsAt(new Date("2025-05-31T20:00:00Z"),await this.moviesService.getMovie({id: 22})), await this.roomsService.findByName("Grand Écran")   , await this.moviesService.getMovie({id: 22})),
            new Screening(60, new Date("2025-05-31T14:00:00Z"), this.computeEndsAt(new Date("2025-05-31T14:00:00Z"),await this.moviesService.getMovie({id: 37})), await this.roomsService.findByName("Cosmos")        , await this.moviesService.getMovie({id: 37})),
            new Screening(61, new Date("2025-05-31T12:00:00Z"), this.computeEndsAt(new Date("2025-05-31T12:00:00Z"),await this.moviesService.getMovie({id: 15})), await this.roomsService.findByName("Studio 2")      , await this.moviesService.getMovie({id: 15})),
        ]

        let i = 0
        for (const screening of screenings) {
            const exists = await this.screeningRepository.findOne({
                where: {
                    startsAt: screening.startsAt,
                    room: { id: screening.room.id }
                }
            })
            if (!exists) {
                await this.screeningRepository.save(screening)
                ++i
            }
        }

        return { message: i + ' screening' + (i > 1 ? 's' : '') + ' have been seeded successfully' };
    }
}