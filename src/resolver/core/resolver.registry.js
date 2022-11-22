const {AnotherTestResolver} = require("../user-defined/another-test.resolver");
const {RequestResolver} = require("./request.resolver");
const {TestResolver} = require("../user-defined/test.resolver");

exports.init = function () {
    let resolver = new RequestResolver();
    registerTestResolver(resolver);
    registerAnotherTestResolver(resolver);
    return resolver;
}

function registerTestResolver(resolver){
    let testResolver = new TestResolver();
    resolver.register('POST', '/generate', testResolver);
}

function registerAnotherTestResolver(resolver){
    let anotherTestResolver = new AnotherTestResolver();
    resolver.register('POST', '/generate', anotherTestResolver);
}