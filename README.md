## Steps to start server and writing our own mocks

### Step 1 : Create a user defined request resolver

> `POST` Request json at `http://localhost:8888/customerData`
```json
{
    "config": [
        {
            "components": [
                "CUSTOMER_DATA_SCENARIO_1"
            ]
        }
    ],
    "inputParams": {
        "paginationRequest": {
            "currentPage": 1,
            "pageSize": 100
        }
    }
}
```

> Create a new javascript file `anyname_of_your_choice.resolver.js` in [`src/resolver/provider`](src/resolver/provider) folder 

> Implement a `resolve` function like below , you can also use the `JsonPathBuilder` and `JsonPathUtil` to condtionally check the request and based on that either return a `routeKey` or `null`

```javascript
const { JsonPathBuilder, JsonPathUtil } = require("../../util/jsonpath.util");

exports.CustomerDataResolver = function () {
    return {
        resolve: function (request, response) {
            let requestBody = request.body;
            let builder = new JsonPathBuilder();
            let path = builder
                        .arraynode("config")
                        .select(0)
                        .arraynode("components")
                        .select(0)
                        .build();
            let jsonPathUtil = new JsonPathUtil();
            let data = jsonPathUtil.search(requestBody, path)
            return data[0] === 'CUSTOMER_DATA_SCENARIO_1' ? 'CUSTOMER_DATA_SCENARIO_1' : null;
        }
    }
}
```

> Optionally a `process` function like below where you can modify data based on some conditions or checks.

```javascript
const { uuidv4 } = requires("../../lib/helper/uuid.helper")

exports.CustomerDataResolver = function () {
    return {
        // omitted for the better readability
        process: function (data, request, response) {
            data.transactionId = uuidv4();
        }
    }
}
```

> Optionally a `responseType` in case the return type is `string`, defualt type is `json` 😏.

```javascript
const { uuidv4 } = requires("../../lib/helper/uuid.helper")

exports.CustomerDataResolver = function () {
    return {
        // omitted for the better readability
        responseType: 'string'
    }
}
```

> Optionally a `responseHeaders` in case if you want to send some weird headers for fun 😜.

```javascript
const { uuidv4 } = requires("../../lib/helper/uuid.helper")

exports.CustomerDataResolver = function () {
    return {
        // omitted for the better readability
        responseHeaders: {
            "X-custom-header-test": "Blablabla"
        }
    }
}
```

### Step 2 : Register the user defined request resolver

> Register the resolver in `resolver.registry.js` created in `Step 1` at [`src/resolver/core/resolver.registry.js`](src/resolver/core/resolver.registry.js) along with the HttpMethod i.e. either `'POST'` or `'GET'`

```javascript
const {RequestResolver} = require("../../lib/resolver/request.resolver");

// omitted for the better readability
 
const {CustomerDataResolver} = require("../provider/customerData.resolver");

exports.init = function () {
    let resolver = new RequestResolver();
    
    // omitted for the better readability
    
    registerCustomerDataResolver(resolver);
    
    return resolver;
}

function registerTestResolver(resolver){
    // omitted for the better readability
}

function registerAnotherTestResolver(resolver){
    // omitted for the better readability
}

function registerCustomerDataResolver(resolver) {
  let customerDataResolver = new CustomerDataResolver();
  resolver.register('POST', '/customerData', customerDataResolver);
}

```

### Step 3 : Register the mockey route and add the mocked response

> Whatever the return value we have given for the resolver's resolve in our case `CUSTOMER_DATA_SCENARIO_1` in `Step 1` we need to map that value in `mockey-route.json` at [`src/route/mockey-route.json`](src/route/mockey-route.json) with key as the returned string `CUSTOMER_DATA_SCENARIO_1` and value as the path where the mocked response resides for example `src/response/customerData/customerData.json` 

```json
{
  "404": "404.json",
  "TEST": "/test/test.json",
  "ANOTHER_TEST": "/test/anotherTest.json",
  "CUSTOMER_DATA_SCENARIO_1": "/customer/customerData.json"
}

```

> Now we can create a file named customerData.json at [`src/response/customer/customerData.json`](src/response) and add the mocked response which will then be sent back whenever we invoke a `POST` request to `http://localhost:8888/customerData`



## Mocking the delay in response:

### Option 1:  mockey-config.json

> We can mock the response delay in `mockey-config.json` at [`src/config/mockey-config.json`](src/config/mockey-config.json) default value is 5000 millis (5 seconds)

```json
{
  "name" : "App Name",
  "responseDelayInMillis" : 5000
}
```
### Option 2:  add "responseDelayInMillis" property in the response

> For a response to have different delay other than config we can configure it using  "responseDelayInMillis" in the response body.

> see below example of customerData.json
```json 
{
  "responseDelayInMillis": 3000,
  "data": {}
}
```

> refer `anotherTest.json` at [`src/response/test/anotherTest.json`](src/response/test/anotherTest.json) for the complete response.