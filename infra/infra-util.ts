import { type Stage, toPascalCase, toTitleCase } from '@ts-fullstack-todo/shared'

const appName = 'TsFullstackTodoApp'

export function makeId(identity: string, stage: Stage) {
    return `${toTitleCase(appName)}${toPascalCase(identity)}${toTitleCase(stage)}`
}
