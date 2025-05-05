import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Movie } from "./movie.entity";
import { DeleteResult, Repository } from "typeorm";
import { ListMoviesParams } from "./validation/list-movies.schema";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { MovieId } from "./validation/movie-id.schema";
import { CreateMovieRequest } from "./validation/create-movie.schema";
import { PatchMovieRequest } from "./validation/update-movie.schema";
import parse from "parse-duration";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie)
        private movieRepository : Repository<Movie>
    ) {}

    async listMovies(queryParams : ListMoviesParams & PaginationRequest) : Promise<ListingReturn<Movie>> {
        const query = this.movieRepository.createQueryBuilder('movies')
        const errors : string[] = []

        // Applying filters

        if(queryParams.title !== undefined)
            query.andWhere("movies.title = :title", {title: queryParams.title})

        if(queryParams.director !== undefined)
            query.andWhere("movies.director = :director", {director: queryParams.director})

        if(queryParams.genre !== undefined)
            query.andWhere("movies.genre = :genre", {genre: queryParams.genre})

        if(queryParams.maxDuration !== undefined){
            const maxDuration = parse(queryParams.maxDuration)
            if(maxDuration === null) errors.push('`maxDuration` parameter is invalid.')

            query.andWhere("movies.duration_ms < :maxDuration", {maxDuration: maxDuration})
        }

        if(queryParams.minDuration !== undefined){
            const minDuration = parse(queryParams.minDuration)
            if(minDuration === null) errors.push('`minDuration` parameter is invalid.')

            query.andWhere("movies.duration_ms > :minDuration", {minDuration: minDuration})
        }

        if(queryParams.duration !== undefined){
            const duration = parse(queryParams.duration)
            if(duration === null) errors.push('`duration` parameter is invalid.')

            query.andWhere("movies.duration_ms = :duration", {duration: duration})
        }

        // Throwing found errors

        if(errors.length > 0)
            throw new BadRequestException(errors)

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [movies, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: movies,
            meta: {
                limit: queryParams.limit,
                page: queryParams.page,
                total: total,
                totalPages: totalPages
            }
        }
    }

    async getMovie(params: MovieId) : Promise<Movie> {
        const movie = await this.movieRepository.findOne({where: {id: params.id}})
        if(movie === null)
            throw new NotFoundException('Movie not found.')

        return movie
    }

    async addMovie(body: CreateMovieRequest) : Promise<Movie> {
        const movieDuration : number | null= parse(body.duration)
        if(movieDuration === null)
            throw new BadRequestException('Invalid Duration')

        let movie = this.movieRepository.create({
            title: body.title,
            director: body.director,
            genre: body.genre,
            duration_ms: movieDuration
        })
        movie = await this.movieRepository.save(movie)

        return movie
    }

    async patchMovie(params: MovieId, body: PatchMovieRequest) : Promise<Movie> {
        const movie = await this.movieRepository.findOne({where: {id: params.id}})
        if(movie === null)
            throw new NotFoundException('Movie not found.')

        if(body.duration !== undefined){
            const duration_ms = parse(body.duration)
            if(duration_ms === null)
                throw new BadRequestException('`duration` property is invalid.')

            movie.duration_ms = duration_ms
        }

        if(body.title !== undefined)
            movie.title = body.title

        if(body.director !== undefined)
            movie.director = body.director

        if(body.genre !== undefined)
            movie.genre = body.genre

        const savedMovie = await this.movieRepository.save(movie)

        return savedMovie
    }

    async deleteMovie(params: MovieId) : Promise<DeleteResult> {
        const movie = await this.movieRepository.delete(params.id)
        if(movie.affected === 0)
            throw new NotFoundException('Movie not found.')

        return movie
    }

    async seed() : Promise<string> {
        const movies = [
            {
                title: 'The Shawshank Redemption',
                director: 'Frank Darabont',
                genre: 'Drama',
                duration_ms: 142 * 60 * 1000, // 2h22
            },
            {
                title: 'The Godfather',
                director: 'Francis Ford Coppola',
                genre: 'Crime',
                duration_ms: 175 * 60 * 1000, // 2h55
            },
            {
                title: 'The Dark Knight',
                director: 'Christopher Nolan',
                genre: 'Action',
                duration_ms: 152 * 60 * 1000, // 2h32
            },
            {
                title: 'Pulp Fiction',
                director: 'Quentin Tarantino',
                genre: 'Crime',
                duration_ms: 154 * 60 * 1000, // 2h34
            },
            {
                title: 'Forrest Gump',
                director: 'Robert Zemeckis',
                genre: 'Drama',
                duration_ms: 142 * 60 * 1000, // 2h22
            },
            {
                title: 'Inception',
                director: 'Christopher Nolan',
                genre: 'Science-fiction',
                duration_ms: 148 * 60 * 1000, // 2h28
            },
            {
                title: 'Fight Club',
                director: 'David Fincher',
                genre: 'Drama',
                duration_ms: 139 * 60 * 1000, // 2h19
            },
            {
                title: 'The Matrix',
                director: 'Lana Wachowski, Lilly Wachowski',
                genre: 'Science-fiction',
                duration_ms: 136 * 60 * 1000, // 2h16
            },
            {
                title: 'Goodfellas',
                director: 'Martin Scorsese',
                genre: 'Crime',
                duration_ms: 146 * 60 * 1000, // 2h26
            },
            {
                title: 'The Lord of the Rings: The Return of the King',
                director: 'Peter Jackson',
                genre: 'Fantasy',
                duration_ms: 201 * 60 * 1000, // 3h21
            },
            {
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                director: 'Peter Jackson',
                genre: 'Fantasy',
                duration_ms: 178 * 60 * 1000, // 2h58
            },
            {
                title: 'The Lord of the Rings: The Two Towers',
                director: 'Peter Jackson',
                genre: 'Fantasy',
                duration_ms: 179 * 60 * 1000, // 2h59
            },
            {
                title: 'Star Wars: Episode V - The Empire Strikes Back',
                director: 'Irvin Kershner',
                genre: 'Science-fiction',
                duration_ms: 124 * 60 * 1000, // 2h4
            },
            {
                title: 'The Silence of the Lambs',
                director: 'Jonathan Demme',
                genre: 'Thriller',
                duration_ms: 118 * 60 * 1000, // 1h58
            },
            {
                title: 'Se7en',
                director: 'David Fincher',
                genre: 'Crime',
                duration_ms: 127 * 60 * 1000, // 2h7
            },
            {
                title: 'The Usual Suspects',
                director: 'Bryan Singer',
                genre: 'Crime',
                duration_ms: 106 * 60 * 1000, // 1h46
            },
            {
                title: 'Saving Private Ryan',
                director: 'Steven Spielberg',
                genre: 'War',
                duration_ms: 169 * 60 * 1000, // 2h49
            },
            {
                title: 'Schindler\'s List',
                director: 'Steven Spielberg',
                genre: 'Biography',
                duration_ms: 195 * 60 * 1000, // 3h15
            },
            {
                title: 'The Green Mile',
                director: 'Frank Darabont',
                genre: 'Drama',
                duration_ms: 189 * 60 * 1000, // 3h9
            },
            {
                title: 'Gladiator',
                director: 'Ridley Scott',
                genre: 'Action',
                duration_ms: 155 * 60 * 1000, // 2h35
            },
            {
                title: 'Titanic',
                director: 'James Cameron',
                genre: 'Romance',
                duration_ms: 195 * 60 * 1000, // 3h15
            },
            {
                title: 'The Departed',
                director: 'Martin Scorsese',
                genre: 'Crime',
                duration_ms: 151 * 60 * 1000, // 2h31
            },
            {
                title: 'The Prestige',
                director: 'Christopher Nolan',
                genre: 'Drama',
                duration_ms: 130 * 60 * 1000, // 2h10
            },
            {
                title: 'Memento',
                director: 'Christopher Nolan',
                genre: 'Mystery',
                duration_ms: 113 * 60 * 1000, // 1h53
            },
            {
                title: 'The Lion King',
                director: 'Roger Allers, Rob Minkoff',
                genre: 'Animation',
                duration_ms: 88 * 60 * 1000, // 1h28
            },
            {
                title: 'Back to the Future',
                director: 'Robert Zemeckis',
                genre: 'Science-fiction',
                duration_ms: 116 * 60 * 1000, // 1h56
            },
            {
                title: 'Alien',
                director: 'Ridley Scott',
                genre: 'Horror',
                duration_ms: 117 * 60 * 1000, // 1h57
            },
            {
                title: 'Aliens',
                director: 'James Cameron',
                genre: 'Science-fiction',
                duration_ms: 137 * 60 * 1000, // 2h17
            },
            {
                title: 'Braveheart',
                director: 'Mel Gibson',
                genre: 'Biography',
                duration_ms: 178 * 60 * 1000, // 2h58
            },
            {
                title: 'The Pianist',
                director: 'Roman Polanski',
                genre: 'Biography',
                duration_ms: 150 * 60 * 1000, // 2h30
            },
            {
                title: 'Whiplash',
                director: 'Damien Chazelle',
                genre: 'Drama',
                duration_ms: 106 * 60 * 1000, // 1h46
            },
            {
                title: 'The Intouchables',
                director: 'Olivier Nakache, Éric Toledano',
                genre: 'Biography',
                duration_ms: 112 * 60 * 1000, // 1h52
            },
            {
                title: 'Parasite',
                director: 'Bong Joon Ho',
                genre: 'Thriller',
                duration_ms: 132 * 60 * 1000, // 2h12
            },
            {
                title: 'Joker',
                director: 'Todd Phillips',
                genre: 'Crime',
                duration_ms: 122 * 60 * 1000, // 2h2
            },
            {
                title: 'Avengers: Endgame',
                director: 'Anthony Russo, Joe Russo',
                genre: 'Action',
                duration_ms: 181 * 60 * 1000, // 3h1
            },
            {
                title: 'Interstellar',
                director: 'Christopher Nolan',
                genre: 'Science-fiction',
                duration_ms: 169 * 60 * 1000, // 2h49
            },
            {
                title: 'The Wolf of Wall Street',
                director: 'Martin Scorsese',
                genre: 'Biography',
                duration_ms: 180 * 60 * 1000, // 3h
            },
            {
                title: 'Django Unchained',
                director: 'Quentin Tarantino',
                genre: 'Western',
                duration_ms: 165 * 60 * 1000, // 2h45
            },
            {
                title: 'The Social Network',
                director: 'David Fincher',
                genre: 'Biography',
                duration_ms: 120 * 60 * 1000, // 2h
            },
            {
                title: 'The Imitation Game',
                director: 'Morten Tyldum',
                genre: 'Biography',
                duration_ms: 113 * 60 * 1000, // 1h53
            },
            {
                title: 'The Grand Budapest Hotel',
                director: 'Wes Anderson',
                genre: 'Comedy',
                duration_ms: 99 * 60 * 1000, // 1h39
            },
            {
                title: 'La La Land',
                director: 'Damien Chazelle',
                genre: 'Musical',
                duration_ms: 128 * 60 * 1000, // 2h8
            },
            {
                title: 'Mad Max: Fury Road',
                director: 'George Miller',
                genre: 'Action',
                duration_ms: 120 * 60 * 1000, // 2h
            },
            {
                title: 'The Revenant',
                director: 'Alejandro G. Iñárritu',
                genre: 'Adventure',
                duration_ms: 156 * 60 * 1000, // 2h36
            },
            {
                title: 'Blade Runner 2049',
                director: 'Denis Villeneuve',
                genre: 'Science-fiction',
                duration_ms: 164 * 60 * 1000, // 2h44
            },
            {
                title: 'Her',
                director: 'Spike Jonze',
                genre: 'Romance',
                duration_ms: 126 * 60 * 1000, // 2h6
            }
        ]

        let i = 0
        for(const movie of movies){
            const existing = await this.movieRepository.findOne({where: {title: movie.title, director: movie.director}})
            if(existing === null){
                await this.movieRepository.save(movie)
                ++i
            }
        }

        
        return i > 1 ? i + " movies seeded." : i + " movie seeded."
    }
}