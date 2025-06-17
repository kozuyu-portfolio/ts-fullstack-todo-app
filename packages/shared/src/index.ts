/**
 * 共通ユーティリティ関数群
 */

import { v7 as uuidv7 } from 'uuid'

export function generateUUIDv7(): string {
    return uuidv7()
}

export function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`${name} environment variable is not defined`)
    }
    return value
}
