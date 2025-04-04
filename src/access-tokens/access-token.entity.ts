import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AccessToken{
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    token: string

    @ManyToOne(() => User, user => user.accessTokens)
    user: User
    
    @CreateDateColumn({type: "timestamptz"})
    createdAt: Date

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