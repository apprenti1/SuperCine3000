
/* Providers name */

    // Provides the users repository (users/users.providers.ts)
    export const USER_REPOSITORY_PROVIDER = 'USER_REPOSITORY'

    // Provides the access tokens repository (access-tokens/access-tokens.providers.ts)
    export const ACCESS_TOKENS_REPOSITORY_PROVIDER = 'ACCESS_TOKENS_REPOSITORY'

    // Provides the database connection element (database/database.providers.ts)
    export const APPDATA_PROVIDER = 'DATA_SOURCE'

/* Decorators name */

    // @Public decorator: set a route as 'public', no need to be logged in to access it
    export const IS_PUBLIC_KEY = 'isPublic'

    // @SetRoles decorator: set the authorised roles for the given route or controller
    export const SET_ROLES_KEY = 'allowedRoles'