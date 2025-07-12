const stages = ['dev', 'stg', 'prod'] as const
export type Stage = (typeof stages)[number]
export const isValidStage = (stage: unknown): stage is Stage => {
    return typeof stage === 'string' && stages.includes(stage as Stage)
}

export type RuntimeEnvConstantsBody = {
    webDomain: string
    apiDomain: string
    apiBaseURL: string
}

export const rootDomain = '<replace with your root domain>' // FIXME: Replace with your root domain
export const account = '<replace with your AWS account ID>' // FIXME: Replace with your AWS account ID
export const region = '<replace with your AWS region>' // FIXME: Replace with your AWS region

export const RuntimeEnvConstants: Record<Stage, RuntimeEnvConstantsBody> = {
    dev: {
        webDomain: `dev.${rootDomain}`,
        apiDomain: `api.dev.${rootDomain}`,
        apiBaseURL: `https://api.dev.${rootDomain}`,
    },
    stg: {
        webDomain: `stg.${rootDomain}`,
        apiDomain: `api.stg.${rootDomain}`,
        apiBaseURL: `https://api.stg.${rootDomain}`,
    },
    prod: {
        webDomain: `${rootDomain}`,
        apiDomain: `api.${rootDomain}`,
        apiBaseURL: `https://api.${rootDomain}`,
    },
}
