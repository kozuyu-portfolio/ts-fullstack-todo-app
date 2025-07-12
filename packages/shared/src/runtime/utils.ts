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

/**
 * 文字列の先頭を大文字に変換する
 */
export function toTitleCase(source: string): string {
    return source.slice(0, 1).toUpperCase() + source.slice(1)
}

/**
 * 文字列をキャメルケースに変換する
 * 例: "hello-world" -> "helloWorld"
 *     "hello_world" -> "helloWorld"
 */
export function toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (match, group1) => group1.toUpperCase())
}

/**
 * 文字列をパスカルケースに変換する
 * 例: "hello-world" -> "HelloWorld"
 *     "hello_world" -> "HelloWorld"
 */
export function toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_](.)/g, (match, group1) => group1.toUpperCase())
}

/**
 * 文字列をスネークケースに変換する
 * 例: "helloWorld" -> "hello_world"
 *     "HelloWorld" -> "hello_world"
 */
export function toSnakeCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/[A-Z]/g, (s) => `_${s.toLowerCase()}`)
}
