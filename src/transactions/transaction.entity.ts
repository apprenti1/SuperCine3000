import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MoneyTransaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    amount: number

    @ManyToOne(() => User, user => user.transactions)
    user: User

    constructor(
       id: number,
       amount: number,
       user: User
    ){
        this.id = id,
        this.amount = amount,
        this.user = user
    }
}