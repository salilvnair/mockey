const {JsonPathUtil} = require("../../lib/helper/jsonpath.util");
const {JsonPathBuilder} = require("../../lib/helper/jsonpath.util");

exports.AnotherTestResolver = function () {
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
            return data[0] === 'ANOTHER_TEST' ? 'ANOTHER_TEST' : null;
        }
    }
}