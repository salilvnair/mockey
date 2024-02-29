const path = require('path');
const fs = require('fs');

let baseDir;

let basePathToData;


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
        delete data['responseDelayInMillis'];
    }
    return responseDelayInMillis;
}


const extractData = function (basePathToData, filename, resolver) {
    const fullFilename = path.join(basePathToData, filename);
    if(resolver.responseType && resolver.responseType === 'string') {
        return fs.readFileSync(fullFilename, 'utf-8');
    }
    else {
        return JSON.parse(fs.readFileSync(fullFilename, 'utf-8'));
    }
};

exports.responseData = function (routeKey, request, response, resolver) {
    const basePathToRoute = path.join(baseDir, 'route', 'mockey-route.json');
    let routes = JSON.parse(fs.readFileSync(basePathToRoute, "utf8"));

    const basePathToConfig = path.join(baseDir, 'config', 'mockey-config.json');
    let appConfig = JSON.parse(fs.readFileSync(basePathToConfig, "utf8"));

    if(!routes[routeKey]) {
        routeKey = "404"
    }

    let responseDelayInMillis = appConfig['responseDelayInMillis'];

    let data = extractData(basePathToData, routes[routeKey], resolver);

    if(resolver && resolver.process) {
        resolver.process(data, request, response);
    }

    responseDelayInMillis = overrideResponseDelayIfAvailable(data, responseDelayInMillis);

    setTimeout(function() {
        if(resolver.responseHeaders) {
            for(var key in resolver.responseHeaders) {
                response.set(key, resolver.responseHeaders[key])
            }
        }
        return response.send(data);
    }, responseDelayInMillis);
};

exports.setupBaseDir = function(inputBaseDir) {
    baseDir = inputBaseDir;
    basePathToData = path.join(baseDir, 'response');
}