const path = require('path');
const { generateIdToken } = require("../../lib/helper/token.util")
// exports.AuthLoginResolver = function () {
//     return {
//         resolve: function (request, response) {
//             let redirectUri = request.query.redirect_uri;
//             console.log('redirectUri: ' + request.query.redirect_uri);
//             let state = request.query.state;
//             redirectUri = redirectUri+'?state=' + state + '&code=mock.333.444.555.XXX.YYY.ZZZ';
//             return redirectUri;
//         },
//         redirect: true
//     }
// }

exports.AuthLoginResolver = function () {
    return {
        resolve: function (request, response) {
            return "REDIRECT_TO_SOURCE";
        },
        process: function (data, request, response) {
            let redirectUri = request.query.redirect_uri;
            console.log('redirectUri: ' + request.query.redirect_uri);
            let state = request.query.state;
            const userId = request.headers['login_username'];
            redirectUri = redirectUri+'?state=' + state + '&code='+userId;
            data.redirectToSourceUrl = redirectUri;
        },
    }
}

exports.AuthLoginPageResolver = function () {
    return {
        resolve: function (request, response) {
            return path.join('response', 'page', 'login', 'login.html');
        },
        sendFile: true
    }
}

exports.AuthTokenResolver = function () {
    return {
        resolve: function (request, response) {
            return 'AUTHENTICATE';
        },
        process: function (data, request, response) {
            const secret = 'mockey';
            const userId = request.body.code
            const idToken = generateIdToken(userId, secret);
            console.log('Generated idToken:', idToken);
            console.log('Generated userId:', userId);
            data.id_token = idToken;
        },
        responseHeaders: {
            "X-custom-header-test": "Blablabla"
        }
    }
}