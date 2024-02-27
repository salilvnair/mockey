const {AnotherTestResolver} = require("../provider/another-test.resolver");
const {RequestResolver} = require("../../lib/resolver/request.resolver");
const {TestResolver} = require("../provider/test.resolver");
const { PingPongResolver } = require("../provider/ping-pong.resolver");

exports.init = function () {
    let resolver = new RequestResolver();
    registerTestResolver(resolver);
    registerAnotherTestResolver(resolver);
    registerPingPong(resolver);
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