import { ACCESS_TOKENS_REPOSITORY_PROVIDER, APPDATA_PROVIDER } from "src/common/constants";
import { DataSource } from "typeorm";
import { AccessToken } from "./access-token.entity";

export const accessTokensProviders = [
    {
        provide: ACCESS_TOKENS_REPOSITORY_PROVIDER,
        useFactory: (datasource: DataSource) => datasource.getRepository(AccessToken),
        inject: [APPDATA_PROVIDER]
    }
]