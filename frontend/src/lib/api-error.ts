function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getResponse(error: unknown) {
    if (!isRecord(error) || !isRecord(error.response)) {
        return undefined
    }

    return error.response as { status?: number; data?: unknown }
}

export function getApiStatus(error: unknown) {
    return getResponse(error)?.status
}

export function getApiErrorMessage(error: unknown, fallback: string) {
    const responseData = getResponse(error)?.data

    if (typeof responseData === 'string') {
        return responseData
    }

    if (isRecord(responseData)) {
        const message = responseData.message
        const errorMessage = responseData.error
        const legacyErrorMessage = responseData.erro

        if (typeof message === 'string') {
            return message
        }

        if (typeof errorMessage === 'string') {
            return errorMessage
        }

        if (typeof legacyErrorMessage === 'string') {
            return legacyErrorMessage
        }
    }

    return fallback
}
