import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ExistingUserPipe, UniqueUserPipe } from "./validation/pipes/UserExistencePipe";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Module({
    imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [
        UsersService,
        ExistingUserPipe, UniqueUserPipe
    ],
    exports: [UsersService]
})
export class UsersModule {}