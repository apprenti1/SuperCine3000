import { TransactionTypes } from "src/common/enums/transactions-type.enum";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class MoneyTransaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    amount: number

    @Column()
    type: TransactionTypes
    
    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    @ManyToOne(() => User, user => user.transactions)
    user: User

    constructor(
       id: number,
       amount: number,
       type: TransactionTypes,
       user: User
    ){
        this.id = id
        this.amount = amount
        this.type = type
        this.user = user
    }
}