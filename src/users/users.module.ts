import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { userProviders } from "./users.providers";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ExistingUserPipe, UniqueUserPipe } from "src/common/pipes/UserExistencePipe";

@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [
        ...userProviders,
        UsersService,
        ExistingUserPipe, UniqueUserPipe
    ]
})
export class UsersModule {}