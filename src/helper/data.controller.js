const path = require('path');
const fs = require('fs');

let baseDir;

let basePathToData;


const extractJsonData = function (basePathToData, filename) {
    const fullFilename = path.join(basePathToData, filename);
    return JSON.parse(fs.readFileSync(fullFilename, 'utf-8'));
};

const overrideResponseDelayIfAvailable = function (data, responseDelayInMillis) {
    if(data['responseDelayInMillis']) {
        let responseDelayInMillisFromData = data['responseDelayInMillis'];
        if(typeof responseDelayInMillisFromData === 'number') {
            responseDelayInMillis = responseDelayInMillisFromData;
        }
        else {
            try {
                responseDelayInMillis = parseInt(responseDelayInMillisFromData);
            }
            catch (e) {}
        }
    }
    return responseDelayInMillis;
}

exports.responseData = function (routeKey, request, response) {
    const basePathToRoute = path.join(baseDir, 'route', 'mockey-route.json');
    let routes = JSON.parse(fs.readFileSync(basePathToRoute, "utf8"));

    const basePathToConfig = path.join(baseDir, 'config', 'mockey-config.json');
    let appConfig = JSON.parse(fs.readFileSync(basePathToConfig, "utf8"));

    if(!routes[routeKey]) {
        routeKey = "404"
    }

    let responseDelayInMillis = appConfig['responseDelayInMillis'];

    const data = extractJsonData(basePathToData, routes[routeKey]);

    responseDelayInMillis = overrideResponseDelayIfAvailable(data, responseDelayInMillis);

    setTimeout(function() {
        return response.send(data);
    }, responseDelayInMillis);
};

exports.setupBaseDir = function(inputBaseDir) {
    baseDir = inputBaseDir;
    basePathToData = path.join(baseDir, 'response');
}