import { Movie } from "src/movies/movie.entity";
import { Room } from "src/rooms/entities/room.entity";
import { Ticket } from "src/tickets/ticket.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Screening{
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "timestamptz"})
    startsAt: Date

    @Column({type: "timestamptz"})
    endsAt: Date

    @ManyToOne(() => Room, room => room.screenings)
    room: Room

    @ManyToOne(() => Movie, movie => movie.screenings)
    movie: Movie

    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    @ManyToMany(() => Ticket, ticket => ticket.screenings)
    tickets : Ticket[]

    constructor(
        id: number,
        startsAt: Date,
        endsAt: Date,
        room: Room,
        movie: Movie
    ){
        this.id = id
        this.startsAt = startsAt
        this.endsAt = endsAt
        this.room = room
        this.movie = movie
    }
}