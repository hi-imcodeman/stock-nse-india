import { Response } from 'express'

export function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    try {
        return JSON.stringify(error)
    } catch {
        return 'Unknown error'
    }
}

export function httpStatusFromError(error: unknown): number {
    const message = errorMessage(error)
    if (message.includes('403')) return 403
    if (message.includes('404')) return 404
    if (message.includes('401')) return 401
    if (message.includes('400')) return 400
    return 502
}

export function sendRouteError(res: Response, error: unknown): void {
    res.status(httpStatusFromError(error)).json({ error: errorMessage(error) })
}
