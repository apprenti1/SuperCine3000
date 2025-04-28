// We make this
export interface RefreshTokenPayload{
    sub: number
}

// Nest makes this (so it is what we receive)
export interface RequestRefreshTokenPayload{
    sub: number,
    iat: number,
    exp: number
}