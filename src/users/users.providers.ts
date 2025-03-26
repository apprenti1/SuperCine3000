import { DataSource } from "typeorm";
import { User } from "./user.entity";
import { APPDATA_PROVIDER, USER_REPOSITORY_PROVIDER } from "src/constants";

export const userProviders = [
    {
        provide: USER_REPOSITORY_PROVIDER,
        useFactory: (datasource: DataSource) => datasource.getRepository(User),
        inject: [APPDATA_PROVIDER]
    }
]