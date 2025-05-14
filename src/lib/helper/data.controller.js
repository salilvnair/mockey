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

const processMockeySendFile = function (resolvedData, request, response, resolver) {
    return path.join(baseDir, resolvedData);
}

const processMockeyRedirect = function (resolvedData, request, response, resolver) {
    return resolvedData;
}

const processMockeyResponse = function (resolvedData, request, response, resolver) {
    const basePathToRoute = path.join(baseDir, 'route', 'mockey-route.json');
    let routes = JSON.parse(fs.readFileSync(basePathToRoute, "utf8"));

    if(!routes[resolvedData]) {
        resolvedData = "404"
    }
    let data = extractData(basePathToData, routes[resolvedData], resolver);

    if(resolver && resolver.process) {
        resolver.process(data, request, response);
    }

    return data;
}

exports.responseData = function (resolvedData, request, response, resolver) {
    const basePathToConfig = path.join(baseDir, 'config', 'mockey-config.json');
    let appConfig = JSON.parse(fs.readFileSync(basePathToConfig, "utf8"));
    let responseDelayInMillis = appConfig['responseDelayInMillis'];

    let data;
    if(resolver && resolver.sendFile) {
        data = processMockeySendFile(resolvedData, request, response, resolver);
    }
    else if(resolver && resolver.redirect) {
        data = processMockeyRedirect(resolvedData, request, response, resolver);
    }
    else {
        data = processMockeyResponse(resolvedData, request, response, resolver);
    }

    responseDelayInMillis = overrideResponseDelayIfAvailable(data, responseDelayInMillis);

    setTimeout(function() {
        if(resolver.responseHeaders) {
            for(var key in resolver.responseHeaders) {
                response.set(key, resolver.responseHeaders[key])
            }
        }
        if(resolver.redirect) {
            let redirectUri = data
            return response.status(301).redirect(redirectUri)
        }
        else if(resolver.sendFile) {
            let filePath = data;
            return response.sendFile(filePath);
        }
        else {
            return response.send(data);
        }
    }, responseDelayInMillis);
};

exports.setupBaseDir = function(inputBaseDir) {
    baseDir = inputBaseDir;
    basePathToData = path.join(baseDir, 'response');
}