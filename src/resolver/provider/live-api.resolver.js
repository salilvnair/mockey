exports.MockOrderSubmitResolver = function () {
    return {
        resolve: function () {
            return 'LIVE_ORDER_SUBMIT';
        },
        process: function (data, request) {
            const body = request.body || {};
            const ts = Date.now();
            data.orderId = body.orderId || ('ORD-' + ts);
            data.customerId = body.customerId || 'CUST-1001';
            data.submittedByRole = body.submittedByRole || 'ADMIN';
            data.sourceCity = body.sourceCity || 'Mumbai';
            data.targetCity = body.targetCity || 'Bengaluru';
        }
    }
}

exports.MockOrderStatusResolver = function () {
    return {
        resolve: function () {
            return 'LIVE_ORDER_STATUS';
        },
        process: function (data, request) {
            const orderId = (request.query && request.query.orderId) || 'ORD-UNKNOWN';
            data.orderId = orderId;
            data.status = orderId.endsWith('9') ? 'FAILED' : 'SUBMITTED';
            data.api3Status = 'SUCCESS';
            data.api4AsyncStatus = orderId.endsWith('7') ? null : 'PENDING';
        }
    }
}

exports.MockOrderAsyncTraceResolver = function () {
    return {
        resolve: function () {
            return 'LIVE_ORDER_ASYNC_TRACE';
        },
        process: function (data, request) {
            const orderId = (request.query && request.query.orderId) || 'ORD-UNKNOWN';
            data.orderId = orderId;
            data.traceId = 'TRACE-' + Math.floor(Math.random() * 1000000);
            data.api4AsyncStatus = orderId.endsWith('7') ? null : 'DELIVERED';
            data.callbackReceivedAt = orderId.endsWith('7') ? null : new Date().toISOString();
        }
    }
}

exports.MockCustomerProfileResolver = function () {
    return {
        resolve: function () {
            return 'LIVE_CUSTOMER_PROFILE';
        },
        process: function (data, request) {
            const customerId = (request.query && request.query.customerId) || 'CUST-1001';
            data.customerId = customerId;
            data.fullName = customerId === 'CUST-9999' ? 'Priority Enterprise User' : 'Salil Demo User';
            data.segment = customerId === 'CUST-9999' ? 'ENTERPRISE' : 'RETAIL';
        }
    }
}

exports.LoanCreditRatingResolver = function () {
    return {
        resolve: function () {
            return 'LOAN_CREDIT_RATING';
        },
        process: function (data, request) {
            const customerId = (request.query && request.query.customerId) || 'CUST-1001';
            data.customerId = customerId;
            data.creditRating = customerId === 'CUST-LOW' ? 690 : (customerId === 'CUST-EDGE' ? 750 : 782);
            data.ratingProvider = 'CreditUnionMock';
            data.eligibleForFraudCheck = data.creditRating > 750;
        }
    }
}

exports.LoanFraudCheckResolver = function () {
    return {
        resolve: function () {
            return 'LOAN_FRAUD_CHECK';
        },
        process: function (data, request) {
            const customerId = (request.query && request.query.customerId) || 'CUST-1001';
            data.customerId = customerId;
            data.flagged = customerId === 'CUST-FRAUD';
            data.riskLevel = data.flagged ? 'HIGH' : 'LOW';
            data.source = 'CreditCardFraudWatchMock';
        }
    }
}

exports.LoanDebtSummaryResolver = function () {
    return {
        resolve: function () {
            return 'LOAN_DEBT_SUMMARY';
        },
        process: function (data, request) {
            const customerId = (request.query && request.query.customerId) || 'CUST-1001';
            data.customerId = customerId;
            if (customerId === 'CUST-HIGH-DEBT') {
                data.monthlyDebt = 145000;
                data.monthlyIncome = 165000;
                data.dti = 0.88;
                data.availableCredit = 30000;
            }
            else {
                data.monthlyDebt = 28000;
                data.monthlyIncome = 125000;
                data.dti = 0.22;
                data.availableCredit = 420000;
            }
        }
    }
}

exports.LoanApplicationSubmitResolver = function () {
    return {
        resolve: function () {
            return 'LOAN_APPLICATION_SUBMIT';
        },
        process: function (data, request) {
            const body = request.body || {};
            const customerId = body.customerId || 'CUST-1001';
            data.customerId = customerId;
            data.applicationId = 'APP-' + Math.floor(Math.random() * 1000000);
            data.status = 'SUBMITTED';
            data.requestedAmount = body.requestedAmount || 350000;
            data.tenureMonths = body.tenureMonths || 36;
        }
    }
}
