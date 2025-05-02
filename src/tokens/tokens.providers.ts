import { TOKENS_REPOSITORY_PROVIDER, APPDATA_PROVIDER } from "src/common/constants";
import { DataSource } from "typeorm";
import { Token } from "./token.entity";

export const tokensProviders = [
    {
        provide: TOKENS_REPOSITORY_PROVIDER,
        useFactory: (datasource: DataSource) => datasource.getRepository(Token),
        inject: [APPDATA_PROVIDER]
    }
]