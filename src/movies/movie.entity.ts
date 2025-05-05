import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    constructor(
        id: number,
        title: string,
        director: string,
        genre: string,
        duration_ms: number
    ){
        this.id = id
        this.title = title
        this.director = director
        this.genre = genre
        this.duration_ms = duration_ms
    }
}