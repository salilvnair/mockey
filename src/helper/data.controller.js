const path = require('path');
const fs = require('fs');

let baseDir;

let basePathToData;


const extractJsonData = function (basePathToData, filename) {
    const fullFilename = path.join(basePathToData, filename);
    return JSON.parse(fs.readFileSync(fullFilename, 'utf-8'));
};

exports.responseData = function (url, request, response) {
    const basePathToRoute = path.join(baseDir, 'route', 'mock-route.json');
    let routes = JSON.parse(fs.readFileSync(basePathToRoute, "utf8"));
    const data = extractJsonData(basePathToData, routes[url]);
    setTimeout(function() {
        return response.send(data);
    }, 100);
};

exports.setupBaseDir = function(inputBaseDir) {
    baseDir = inputBaseDir;
    basePathToData = path.join(baseDir, 'response');
}