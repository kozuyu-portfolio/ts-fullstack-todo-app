export const strategyNames = {
    access: 'jwt',
    refresh: 'jwt-refresh',
}

export const generateRefreshTokenKey = (userId: string, jti: string) => `refresh_token:${userId}:${jti}`
