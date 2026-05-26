import { Response } from 'express'
import { errorMessage, httpStatusFromError, sendRouteError } from './route-errors'

describe('route-errors', () => {
    test('errorMessage handles Error, string, object, and circular refs', () => {
        expect(errorMessage(new Error('boom'))).toBe('boom')
        expect(errorMessage('plain')).toBe('plain')
        expect(errorMessage({ code: 1 })).toBe('{"code":1}')

        const circular: Record<string, unknown> = {}
        circular.self = circular
        expect(errorMessage(circular)).toBe('Unknown error')
    })

    test('httpStatusFromError maps status codes from message', () => {
        expect(httpStatusFromError(new Error('403 forbidden'))).toBe(403)
        expect(httpStatusFromError(new Error('404 missing'))).toBe(404)
        expect(httpStatusFromError(new Error('401 unauthorized'))).toBe(401)
        expect(httpStatusFromError(new Error('400 bad request'))).toBe(400)
        expect(httpStatusFromError(new Error('network down'))).toBe(502)
    })

    test('sendRouteError writes status and json body', () => {
        const json = jest.fn()
        const status = jest.fn().mockReturnValue({ json })
        const res = { status } as unknown as Response

        sendRouteError(res, new Error('status code 404'))

        expect(status).toHaveBeenCalledWith(404)
        expect(json).toHaveBeenCalledWith({ error: 'status code 404' })
    })
})
