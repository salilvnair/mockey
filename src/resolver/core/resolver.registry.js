const {AnotherTestResolver} = require("../provider/another-test.resolver");
const {RequestResolver} = require("../../lib/resolver/request.resolver");
const {TestResolver} = require("../provider/test.resolver");
const { PingPongResolver } = require("../provider/ping-pong.resolver");
const { AuthLoginResolver, AuthTokenResolver, AuthLoginPageResolver } = require("../provider/auth-token.resolver");


exports.init = function () {
    let resolver = new RequestResolver();
    registerTestResolver(resolver);
    registerAnotherTestResolver(resolver);
    registerPingPong(resolver);
    registerAuthTokenResolver(resolver);
    return resolver;
}

function registerPingPong(resolver){
    let pingPongResolver = new PingPongResolver();
    resolver.register('GET', '/ping', pingPongResolver);
}

function registerTestResolver(resolver){
    let testResolver = new TestResolver();
    resolver.register('POST', '/generate', testResolver);
}

function registerAnotherTestResolver(resolver){
    let anotherTestResolver = new AnotherTestResolver();
    resolver.register('POST', '/generate', anotherTestResolver);
}

function registerAuthTokenResolver(resolver) {
    let loginResolver = new AuthLoginResolver();
    let loginPageResolver = new AuthLoginPageResolver();
    let authTokenResolver = new AuthTokenResolver();
    resolver.register('GET', '/login', loginPageResolver);
    resolver.register('GET', '/redirectToSource', loginResolver);
    resolver.register('POST', '/authenticate', authTokenResolver);
}