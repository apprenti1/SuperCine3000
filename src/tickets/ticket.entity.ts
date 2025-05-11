import { TicketTypes } from "src/common/enums/tickets-type.enum";
import { Screening } from "src/screenings/screening.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Ticket{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    type: TicketTypes

    @ManyToOne(() => User, user => user.tickets)
    user: User

    @ManyToMany(() => Screening, screening => screening.tickets, {cascade: true})
    @JoinTable()
    screenings: Screening[]
        
    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    constructor(
        id: number,
        type: TicketTypes,
        owner: User
    ){
        this.id = id
        this.type = type
        this.user = owner
    }
}