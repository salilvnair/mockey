exports.PingPongResolver = function () {
    return {
        resolve: function (request, response) {
            return 'PING_PONG';
        },
        responseType: 'string',
        responseHeaders: {
            "X-custom-header-test": "Blablabla"
        }
    }
}