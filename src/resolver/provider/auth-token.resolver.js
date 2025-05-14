const path = require('path');

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
            redirectUri = redirectUri+'?state=' + state + '&code=mock.333.444.555.XXX.YYY.ZZZ';
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
        // process: function (data, request, response) {
        //     data.idToken = uuidv4();
        // },
        responseHeaders: {
            "X-custom-header-test": "Blablabla"
        }
    }
}