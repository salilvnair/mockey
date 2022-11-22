exports.requestResolverPathResources = {};
exports.RequestResolver = function () {
    return {
        register: function (method, path, resolver) {
            if(!this.requestResolverPathResources || Object.keys(this.requestResolverPathResources).length=== 0){
                this.requestResolverPathResources = {}
            }
            if(this.requestResolverPathResources[method + '_'+path]) {
                this.requestResolverPathResources[method + '_'+path].push(resolver);
            }
            else {
                this.requestResolverPathResources[method + '_'+path] = [resolver];
            }
        }
    }
}