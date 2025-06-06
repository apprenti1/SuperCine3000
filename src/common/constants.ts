
/* Providers name */

    // Provides the users repository (users/users.providers.ts)
    export const USER_REPOSITORY_PROVIDER = 'USER_REPOSITORY'

    // Provides the access tokens repository (access-tokens/access-tokens.providers.ts)
    export const TOKENS_REPOSITORY_PROVIDER = 'TOKENS_REPOSITORY'

    // Provides the database connection element (database/database.providers.ts)
    export const APPDATA_PROVIDER = 'DATA_SOURCE'

/* Decorators name */

    // @Public decorator: set a route as 'public', no need to be logged in to access it
    export const IS_PUBLIC_KEY = 'isPublic'

    // @SetRoles decorator: set the authorised roles for the given route or controller
    export const SET_ROLES_KEY = 'allowedRoles'

/* Appdata */

    // Price for 1 classic ticket
    export const CLASSIC_TICKET_PRICE = 8

    // Price for 1 super ticket (1 super ticket = 10 classic tickets)
    export const SUPER_TICKET_PRICE = CLASSIC_TICKET_PRICE * 9