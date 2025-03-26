import { Roles } from "src/enums/roles.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    username: string

    @Column()
    password: string

    @Column()
    role: Roles

    @Column()
    wallet: number

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