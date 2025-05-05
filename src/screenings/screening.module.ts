import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScreeningsController } from "./screening.controller";
import { ScreeningsService } from "./screening.service";

@Module({
    imports: [TypeOrmModule.forFeature([ScreeningsModule])],
    controllers: [ScreeningsController],
    providers: [ScreeningsService],
    exports: [ScreeningsService]
})
export class ScreeningsModule {}