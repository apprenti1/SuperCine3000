import { Token } from "src/tokens/token.entity";
import { Roles } from "src/common/enums/roles.enum";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @OneToMany(() => Token, token => token.user)
    tokens: Token[]

    constructor(
        id: number,
        email: string,
        username: string,
        password: string,
        role: Roles,
        wallet: number,
        tokens: Token[]
    ){
        this.id = id
        this.email = email
        this.username = username
        this.password = password
        this.role = role
        this.wallet = wallet
        this.tokens = tokens
    }
}