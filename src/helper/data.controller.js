const path = require('path');
const fs = require('fs');

let baseDir;

let basePathToData;


const extractJsonData = function (basePathToData, filename) {
    const fullFilename = path.join(basePathToData, filename);
    return JSON.parse(fs.readFileSync(fullFilename, 'utf-8'));
};

exports.responseData = function (routeKey, request, response) {
    const basePathToRoute = path.join(baseDir, 'route', 'mockey-route.json');
    let routes = JSON.parse(fs.readFileSync(basePathToRoute, "utf8"));

    const basePathToConfig = path.join(baseDir, 'config', 'mockey-config.json');
    let appConfig = JSON.parse(fs.readFileSync(basePathToConfig, "utf8"));

    if(!routes[routeKey]) {
        routeKey = "404"
    }
    const data = extractJsonData(basePathToData, routes[routeKey]);
    setTimeout(function() {
        return response.send(data);
    }, appConfig['responseDelayInMillis']);
};

exports.setupBaseDir = function(inputBaseDir) {
    baseDir = inputBaseDir;
    basePathToData = path.join(baseDir, 'response');
}