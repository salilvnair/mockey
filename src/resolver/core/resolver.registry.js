const {AnotherTestResolver} = require("../provider/another-test.resolver");
const {RequestResolver} = require("../../lib/resolver/request.resolver");
const {TestResolver} = require("../provider/test.resolver");
const { PingPongResolver } = require("../provider/ping-pong.resolver");
const { AuthLoginResolver, AuthTokenResolver, AuthLoginPageResolver, AuthJwkValidator } = require("../provider/auth-token.resolver");
const {
    MockOrderSubmitResolver,
    MockOrderStatusResolver,
    MockOrderAsyncTraceResolver,
    MockCustomerProfileResolver,
    LoanCreditRatingResolver,
    LoanFraudCheckResolver,
    LoanDebtSummaryResolver,
    LoanApplicationSubmitResolver
} = require("../provider/live-api.resolver");

exports.init = function () {
    let resolver = new RequestResolver();
    registerTestResolver(resolver);
    registerAnotherTestResolver(resolver);
    registerPingPong(resolver);
    registerAuthTokenResolver(resolver);
    registerLiveApiResolvers(resolver);
    registerLoanApiResolvers(resolver);
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
    let authJwkValidator = new AuthJwkValidator();
    resolver.register('GET', '/login', loginPageResolver);
    resolver.register('GET', '/redirectToSource', loginResolver);
    resolver.register('POST', '/authenticate', authTokenResolver);
    resolver.register('GET', '/jwks', authJwkValidator);
}

function registerLiveApiResolvers(resolver) {
    let orderSubmitResolver = new MockOrderSubmitResolver();
    let orderStatusResolver = new MockOrderStatusResolver();
    let orderAsyncTraceResolver = new MockOrderAsyncTraceResolver();
    let customerProfileResolver = new MockCustomerProfileResolver();

    resolver.register('POST', '/api/mock/order/submit', orderSubmitResolver);
    resolver.register('GET', '/api/mock/order/status', orderStatusResolver);
    resolver.register('GET', '/api/mock/order/async/trace', orderAsyncTraceResolver);
    resolver.register('GET', '/api/mock/customer/profile', customerProfileResolver);
}

function registerLoanApiResolvers(resolver) {
    let creditRatingResolver = new LoanCreditRatingResolver();
    let fraudCheckResolver = new LoanFraudCheckResolver();
    let debtSummaryResolver = new LoanDebtSummaryResolver();
    let submitResolver = new LoanApplicationSubmitResolver();

    resolver.register('GET', '/api/mock/loan/credit-union/rating', creditRatingResolver);
    resolver.register('GET', '/api/mock/loan/credit-card/fraud-check', fraudCheckResolver);
    resolver.register('GET', '/api/mock/loan/debt-credit/summary', debtSummaryResolver);
    resolver.register('POST', '/api/mock/loan/application/submit', submitResolver);
}
