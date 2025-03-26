import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { userProviders } from "./users.providers";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [
        ...userProviders,
        UsersService
    ]
})
export class UsersModule {}