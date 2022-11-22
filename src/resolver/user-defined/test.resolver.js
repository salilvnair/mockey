const { JsonPathBuilder, JsonPathUtil } = require("../../util/jsonpath.util");

exports.TestResolver = function () {
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
            return data[0] === 'TEST' ? 'TEST' : null;
        }
    }
}