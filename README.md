# mockey

`mockey` is a lightweight, code-first mock API server built on Express.

It routes incoming requests to resolver functions, maps resolver keys to response files, and returns JSON/text/file/redirect responses with optional delay and dynamic data mutation.

## What You Get

- Mock multiple endpoints with `GET`/`POST`
- Chain multiple resolvers for a single route (first match wins)
- Return static JSON/text, dynamic responses, files, or redirects
- Global delay + per-response delay override
- Simple auth/JWKS simulation endpoints
- Ready demo APIs for order + loan workflows

## Prerequisites

- Node.js 18+
- npm

## Quick Start

```bash
npm install
npm start
```

Server starts on:
- `http://localhost:31333` (or `PORT` env var if provided)

Health check style endpoint:

```bash
curl "http://localhost:31333/ping"
```

## Project Structure

```text
src/
  main.js                          # app bootstrap
  config/mockey-config.json        # global config (delay)
  route/mockey-route.json          # routeKey -> response file mapping
  resolver/
    core/resolver.registry.js      # register endpoint + resolver(s)
    provider/*.resolver.js         # resolver implementations
  response/
    ...                            # mocked payload files
  lib/
    api/api.controller.js          # binds Express handlers
    helper/data.controller.js      # response extraction + delay + send
```

## Core Runtime Model

### 1) Endpoint registration

In `src/resolver/core/resolver.registry.js`, each resolver is registered by:
- HTTP method
- path
- resolver instance

Example:

```js
resolver.register('POST', '/generate', new TestResolver());
```

You can register multiple resolvers for the same method+path. They run in order.

### 2) Resolver execution

For an incoming request:
- framework runs each resolver’s `resolve(req, res)`
- first truthy return value is selected as `routeKey`
- if nothing matches, fallback key is `404`

### 3) Route key -> payload file

`src/route/mockey-route.json` maps `routeKey` to a response file under `src/response`.

Example:

```json
{
  "404": "404.json",
  "TEST": "/test/test.json"
}
```

### 4) Optional post-processing

If resolver has `process(data, req, res)`, it can mutate response before sending.

### 5) Response type and delivery mode

Resolver options supported:
- `responseType: 'string'` -> read response file as plain text
- `responseHeaders: { ... }` -> custom response headers
- `sendFile: true` -> send file path directly
- `redirect: true` -> send 301 redirect to returned URL

### 6) Response delay

- Global delay from `src/config/mockey-config.json` (`responseDelayInMillis`)
- Per-response override by adding `responseDelayInMillis` in response JSON file

## Existing Endpoints (Current Repo)

## Basic/Demo

1. `GET /ping`
2. `POST /generate` (multiple resolvers registered)

## Auth Simulation

1. `GET /login` (serves login HTML page)
2. `GET /redirectToSource` (builds redirect URL with `state` + `code`)
3. `POST /authenticate` (returns id_token)
4. `GET /jwks` (returns mock JWKS)

## Order APIs

1. `POST /api/mock/order/submit`
2. `GET /api/mock/order/status?orderId=ORD-1001`
3. `GET /api/mock/order/async/trace?orderId=ORD-1001`
4. `GET /api/mock/customer/profile?customerId=CUST-1001`

## Loan APIs

1. `GET /api/mock/loan/credit-union/rating?customerId=CUST-1001`
2. `GET /api/mock/loan/credit-card/fraud-check?customerId=CUST-1001`
3. `GET /api/mock/loan/debt-credit/summary?customerId=CUST-1001`
4. `POST /api/mock/loan/application/submit`

## Example Calls

```bash
curl -X POST "http://localhost:31333/api/mock/order/submit" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-1001","orderId":"ORD-7007","submittedByRole":"ADMIN"}'
```

```bash
curl "http://localhost:31333/api/mock/loan/credit-union/rating?customerId=CUST-LOW"
```

```bash
curl -X POST "http://localhost:31333/api/mock/loan/application/submit" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-1001","requestedAmount":350000,"tenureMonths":36}'
```

## Add Your Own Mock (Step-by-Step)

### Step 1: Create resolver file

Create `src/resolver/provider/customer-data.resolver.js`:

```js
const { JsonPathBuilder, JsonPathUtil } = require("../../lib/helper/jsonpath.util");

exports.CustomerDataResolver = function () {
  return {
    resolve: function (request) {
      const body = request.body || {};
      const path = new JsonPathBuilder()
        .arraynode("config")
        .select(0)
        .arraynode("components")
        .select(0)
        .build();

      const value = new JsonPathUtil().search(body, path);
      return value && value[0] === "CUSTOMER_DATA_SCENARIO_1"
        ? "CUSTOMER_DATA_SCENARIO_1"
        : null;
    },
    process: function (data) {
      data.transactionId = "TRX-" + Date.now();
    }
  };
};
```

### Step 2: Register resolver in registry

Edit `src/resolver/core/resolver.registry.js`:

```js
const { CustomerDataResolver } = require("../provider/customer-data.resolver");

function registerCustomerDataResolver(resolver) {
  resolver.register("POST", "/customerData", new CustomerDataResolver());
}

// inside init()
registerCustomerDataResolver(resolver);
```

### Step 3: Map route key to response file

Edit `src/route/mockey-route.json`:

```json
{
  "CUSTOMER_DATA_SCENARIO_1": "/customer/customerData.json"
}
```

### Step 4: Add response payload file

Create `src/response/customer/customerData.json`:

```json
{
  "responseDelayInMillis": 300,
  "status": "SUCCESS",
  "data": {
    "items": []
  }
}
```

### Step 5: Test

```bash
curl -X POST "http://localhost:31333/customerData" \
  -H "Content-Type: application/json" \
  -d '{
    "config":[{"components":["CUSTOMER_DATA_SCENARIO_1"]}],
    "inputParams":{"paginationRequest":{"currentPage":1,"pageSize":100}}
  }'
```

## Resolver Interface Contract

A resolver can implement any of these properties:

```js
{
  resolve: (req, res) => "ROUTE_KEY" | null,
  process: (data, req, res) => void,
  responseType: "string", // optional
  responseHeaders: { "Header": "Value" }, // optional
  sendFile: true, // optional
  redirect: true  // optional
}
```

Behavior:
- `resolve` decides which route key to use.
- `process` mutates loaded data.
- `responseType: 'string'` for txt/plain payload files.
- `sendFile` bypasses JSON parsing and sends file.
- `redirect` sends HTTP `301` redirect.

## Delay Configuration

### Global delay

`src/config/mockey-config.json`

```json
{
  "name": "App Name",
  "responseDelayInMillis": 1000
}
```

### Response-level override

Any JSON payload can override delay:

```json
{
  "responseDelayInMillis": 2500,
  "data": {}
}
```

Framework removes `responseDelayInMillis` from response body before sending.

## Troubleshooting

1. Always getting 404 response:
- Ensure resolver is registered for correct method+path.
- Ensure `resolve()` returns a key that exists in `mockey-route.json`.

2. Resolver is called but wrong payload returns:
- Check resolver order for same method+path (first truthy match wins).

3. Text response coming as JSON parse error:
- Set `responseType: 'string'` in resolver.

4. Delay not applying:
- Check global config and payload-level `responseDelayInMillis` type (number/string parseable).

5. File/redirect behavior not working:
- Use `sendFile: true` or `redirect: true` explicitly in resolver.

## Notes

- Default internal port constant is `31333`.
- `process.env.PORT` takes precedence at runtime.
- API responses are loaded from `src/response` based on route mapping.

## ConvEngine-Focused Examples

These mocks are ready to support ConvEngine MCP and HTTP tool testing.

### Example 1: Order Diagnostics Flow

Use these APIs in sequence when testing order-status troubleshooting scenarios:

1. Submit order

```bash
curl -X POST "http://localhost:31333/api/mock/order/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId":"ORD-7007",
    "customerId":"CUST-1001",
    "submittedByRole":"ADMIN",
    "sourceCity":"Mumbai",
    "targetCity":"Bengaluru"
  }'
```

2. Check order status

```bash
curl "http://localhost:31333/api/mock/order/status?orderId=ORD-7007"
```

3. Trace async callback

```bash
curl "http://localhost:31333/api/mock/order/async/trace?orderId=ORD-7007"
```

4. Fetch customer profile

```bash
curl "http://localhost:31333/api/mock/customer/profile?customerId=CUST-1001"
```

Notes for ConvEngine behavior testing:
- `orderId` ending with `9` returns status `FAILED`.
- `orderId` ending with `7` returns async fields as `null` in trace/status flow.

### Example 2: Loan Application Orchestration Flow

Use these APIs in sequence for MCP planner/tool-chain testing:

1. Credit rating

```bash
curl "http://localhost:31333/api/mock/loan/credit-union/rating?customerId=CUST-1001"
```

2. Fraud check

```bash
curl "http://localhost:31333/api/mock/loan/credit-card/fraud-check?customerId=CUST-1001"
```

3. Debt summary

```bash
curl "http://localhost:31333/api/mock/loan/debt-credit/summary?customerId=CUST-1001"
```

4. Submit loan application

```bash
curl -X POST "http://localhost:31333/api/mock/loan/application/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":"CUST-1001",
    "requestedAmount":350000,
    "tenureMonths":36
  }'
```

Useful test customer IDs:
- `CUST-LOW` -> lower rating path
- `CUST-EDGE` -> boundary rating path (750)
- `CUST-FRAUD` -> fraud flagged path
- `CUST-HIGH-DEBT` -> poor debt profile path

## Health Checks and Startup Validation

### Basic health endpoint

```bash
curl "http://localhost:31333/ping"
```

Expected:
- HTTP 200
- plain text response from mapped ping route

### Quick startup check sequence

Run after `npm start`:

```bash
curl -i "http://localhost:31333/ping"
curl -i "http://localhost:31333/api/mock/order/status?orderId=ORD-1001"
curl -i "http://localhost:31333/api/mock/loan/credit-union/rating?customerId=CUST-1001"
```

If these pass, server, resolver registration, route mapping, and response file loading are all healthy.

## Copy-Paste Template Pack

Use these minimal templates to create new mocks quickly.

### 1) JSON mock template

Resolver (`src/resolver/provider/sample-json.resolver.js`):

```js
exports.SampleJsonResolver = function () {
  return {
    resolve: function () {
      return "SAMPLE_JSON_OK";
    },
    process: function (data, req) {
      data.requestId = req.headers["x-request-id"] || "REQ-" + Date.now();
    }
  };
};
```

Route map (`src/route/mockey-route.json`):

```json
{
  "SAMPLE_JSON_OK": "/sample/json-ok.json"
}
```

Payload (`src/response/sample/json-ok.json`):

```json
{
  "status": "SUCCESS",
  "message": "JSON mock response"
}
```

### 2) TEXT mock template

Resolver (`src/resolver/provider/sample-text.resolver.js`):

```js
exports.SampleTextResolver = function () {
  return {
    resolve: function () {
      return "SAMPLE_TEXT_OK";
    },
    responseType: "string"
  };
};
```

Route map:

```json
{
  "SAMPLE_TEXT_OK": "/sample/text-ok.txt"
}
```

Payload (`src/response/sample/text-ok.txt`):

```text
pong-from-text-mock
```

### 3) Redirect mock template

Resolver (`src/resolver/provider/sample-redirect.resolver.js`):

```js
exports.SampleRedirectResolver = function () {
  return {
    resolve: function (req) {
      const state = req.query.state || "NA";
      return "https://example.com/callback?state=" + state;
    },
    redirect: true
  };
};
```

No `mockey-route.json` entry is needed for this pattern because resolver returns final redirect URL directly.

### 4) sendFile mock template

Resolver (`src/resolver/provider/sample-file.resolver.js`):

```js
const path = require("path");

exports.SampleFileResolver = function () {
  return {
    resolve: function () {
      return path.join("response", "sample", "sample.html");
    },
    sendFile: true,
    responseHeaders: {
      "Content-Type": "text/html; charset=utf-8"
    }
  };
};
```

Payload file:
- `src/response/sample/sample.html`

### 5) Registry wiring template

Add to `src/resolver/core/resolver.registry.js`:

```js
const { SampleJsonResolver } = require("../provider/sample-json.resolver");
const { SampleTextResolver } = require("../provider/sample-text.resolver");
const { SampleRedirectResolver } = require("../provider/sample-redirect.resolver");
const { SampleFileResolver } = require("../provider/sample-file.resolver");

function registerSampleResolvers(resolver) {
  resolver.register("GET", "/sample/json", new SampleJsonResolver());
  resolver.register("GET", "/sample/text", new SampleTextResolver());
  resolver.register("GET", "/sample/redirect", new SampleRedirectResolver());
  resolver.register("GET", "/sample/file", new SampleFileResolver());
}

// inside init()
registerSampleResolvers(resolver);
```

### 6) Test commands

```bash
curl "http://localhost:31333/sample/json"
curl "http://localhost:31333/sample/text"
curl -i "http://localhost:31333/sample/redirect?state=abc123"
curl -i "http://localhost:31333/sample/file"
```
