/**
 * 共通ユーティリティ関数群
 */

import { v7 as uuidv7 } from 'uuid'

export function generateUUIDv7(): string {
    return uuidv7()
}
