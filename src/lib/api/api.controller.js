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
    let resolvedData;
    for (let i = 0; i < resolvers.length; i++) {
        resolver = resolvers[i];
        resolvedData = resolver.resolve(req, resp);
        if(resolvedData) {
            break;
        }
    }
    if(!resolvedData) {
        resolvedData = "404"
    }
    return dataController.responseData(resolvedData, req, resp, resolver);
}


