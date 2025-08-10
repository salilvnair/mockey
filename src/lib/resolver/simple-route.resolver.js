exports.SimpleRouteResolver = function (routeKey) {
    return {
        resolve: function (request, response) {
            return routeKey;
        }
    }
}