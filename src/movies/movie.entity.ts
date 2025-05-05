import { Screening } from "src/screenings/screening.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    director: string

    @Column()
    genre: string

    @Column()
    duration_ms: number
    
    @OneToMany(() => Screening, screening => screening.room)
    screenings: Screening[]

    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    constructor(
        id: number,
        title: string,
        director: string,
        genre: string,
        duration_ms: number,
        screenings: Screening[]
    ){
        this.id = id
        this.title = title
        this.director = director
        this.genre = genre
        this.duration_ms = duration_ms
        this.screenings = screenings
    }
}