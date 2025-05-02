import { TokensType } from "src/common/enums/tokens-type.enum";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Token{
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    token: string

    @Column()
    type: TokensType

    @ManyToOne(() => User, user => user.tokens)
    user: User
    
    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

    @Column({type: "timestamptz"})
    expiresAt: Date

    constructor(
        id: number,
        token: string,
        user: User
    ) {
        this.id = id
        this.token = token,
        this.user = user
    }
}