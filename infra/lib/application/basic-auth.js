function handler(event) {
    // biome-ignore lint/style/noVar: <explanation>
    var request = event.request
    // biome-ignore lint/style/noVar: <explanation>
    var headers = request.headers

    // echo -n user:pass | base64
    // biome-ignore lint/style/noVar: <explanation>
    var authString = 'Basic dXNlcjpwYXNz'

    if (typeof headers.authorization === 'undefined' || headers.authorization.value !== authString) {
        return {
            statusCode: 401,
            statusDescription: 'Unauthorized',
            headers: { 'www-authenticate': { value: 'Basic' } },
        }
    }

    return request
}
