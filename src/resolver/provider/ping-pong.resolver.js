exports.PingPongResolver = function () {
    return {
        resolve: function (request, response) {
            return 'PING_PONG';
        },
        type: 'string'
    }
}