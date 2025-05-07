import { TicketTypes } from "src/common/enums/tickets-type.enum";
import { Screening } from "src/screenings/screening.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ticket{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    type: TicketTypes

    @ManyToOne(() => User, user => user.tickets)
    user: User

    @ManyToMany(() => Screening, screening => screening.tickets)
    @JoinTable()
    screenings: Screening[]

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