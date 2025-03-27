import { Roles } from "src/enums/roles.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    email: string

    @Column({unique: true})
    username: string

    @Column()
    password: string

    @Column({default: Roles.customer})
    role: Roles

    @Column({default: 0})
    wallet: number

    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @UpdateDateColumn({type: "timestamptz"})
    updatedAt: Date

    constructor(
        id: number,
        email: string,
        username: string,
        password: string,
        role: Roles,
        wallet: number
    ){
        this.id = id
        this.email = email
        this.username = username
        this.password = password
        this.role = role
        this.wallet = wallet
    }
}