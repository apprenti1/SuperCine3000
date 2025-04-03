import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AccessToken{
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    token: string

    @ManyToOne(() => User, user => user.accessTokens)
    user: User

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