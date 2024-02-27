const dataController = require('../helper/data.controller');
exports.init = function (app, baseDir, resolver) {
    dataController.setupBaseDir(baseDir)
    initRequestResolvers(app, resolver);
}

function initRequestResolvers(app, resolver) {
    let requestResolverPathResources = resolver.requestResolverPathResources;
    Object.keys(requestResolverPathResources).forEach(methodPath => {
        let resolvers = requestResolverPathResources[methodPath];
        let method = methodPath.split("_")[0];
        let path = methodPath.split("_")[1];
        if(method === 'POST') {
            app.post(path, (req, resp) => {
                return extractResponse(resolvers, req, resp);
            });
        }
        else if(method === 'GET') {
            app.get(path, (req, resp) => {
                return extractResponse(resolvers, req, resp);
            });
        }
    });
}

function extractResponse(resolvers, req, resp) {
    let resolver;
    let resolvedDataPath;
    for (let i = 0; i < resolvers.length; i++) {
        resolver = resolvers[i];
        resolvedDataPath = resolver.resolve(req);
        if(resolvedDataPath) {
            break;
        }
    }
    if(!resolvedDataPath) {
        resolvedDataPath = "404"
    }
    return dataController.responseData(resolvedDataPath, req, resp, resolver);
}


