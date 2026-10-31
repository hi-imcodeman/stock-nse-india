export function getServerHostUrl(): string {
    const port = process.env.PORT || 3000
    const isHttpsEnabled = process.env.HTTPS_ENABLED === 'true'
    const protocol = isHttpsEnabled ? 'https' : 'http'
    const configuredHostUrl = process.env.HOST_URL?.trim()

    return configuredHostUrl
        ? configuredHostUrl.replace(/^https?:\/\//, `${protocol}://`)
        : `${protocol}://localhost:${port}`
}
