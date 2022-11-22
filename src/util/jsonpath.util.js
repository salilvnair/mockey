let jp = require('jsonpath');

exports.JsonPathUtil = function () {
    return {
        /**
         * returns either array of data or empty array if no data found
         * @param object valid javascript object or array
         * @param path valid jsonpath , JsonPathBuilder can be used for convenience
         */
        search : function (object, path) {
            return jp.query(object, path)
        }
    }
}



exports.JsonPathBuilder = function () {
    const JSON_PATH_EXPR_SELECT_PLACEHOLDER = "<SELECT>";
    const JSON_PATH_EXPR_DOT = ".";

    const JSON_PATH_EXPR_SELECT_ALL = "*";

    const JSON_PATH_EXPR_ARRAYNODE_OPEN = "[";

    const JSON_PATH_EXPR_ARRAYNODE_CLOSE = "]";

    const JSON_PATH_EXPR_WHERE_PLACEHOLDER = "<WHERE>";

    const JSON_PATH_EXPR_IS_PLACEHOLDER = "<IS>";

    const JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER = "(@.<WHERE> == <IS>)";

    const JSON_PATH_EXPR_LIST_IS_PLACEHOLDER = "(@ == <IS>)";

    const JSON_PATH_EXPR_QUERY_PLACEHOLDER = "?";

    const JSON_PATH_EXPR_EQUAL_QUERY_PLACEHOLDER = "==";

    const JSON_PATH_EXPR_LESS_THAN_QUERY_PLACEHOLDER = "<";

    const JSON_PATH_EXPR_LESS_THAN_EQUAL_QUERY_PLACEHOLDER = "<=";

    const JSON_PATH_EXPR_GREATER_THAN_QUERY_PLACEHOLDER = ">";

    const JSON_PATH_EXPR_GREATER_THAN_EQUAL_QUERY_PLACEHOLDER = ">=";

    const JSON_PATH_EXPR_NOT_EQUAL_QUERY_PLACEHOLDER = "!=";

    const JSON_PATH_EXPR_REGEX_QUERY_PLACEHOLDER = "=~";

    const JSON_PATH_EXPR_IN_QUERY_PLACEHOLDER = "in";

    const JSON_PATH_EXPR_NOT_IN_QUERY_PLACEHOLDER = "nin";

    const JSON_PATH_EXPR_QUERY_PLACEHOLDER_MULTICONDITION_OPEN = "?(";

    const JSON_PATH_EXPR_QUERY_PLACEHOLDER_MULTICONDITION_CLOSE = ")";

    let jsonPathExpressionString = "$";
    let hasMultipleConditions = false;
    let isArrayNodeOfData = false;
    let arrayNodeConditions = [];
    let selectWhere = JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER;
    let description;
    let isFinished = false;
    let dueDate;

    return {
        printArrayNodeConditions: function () {
            let arrayNodeConditionBuilder = JSON_PATH_EXPR_ARRAYNODE_OPEN;
            if (hasMultipleConditions) {
                arrayNodeConditionBuilder += JSON_PATH_EXPR_QUERY_PLACEHOLDER_MULTICONDITION_OPEN;
            } else {
                arrayNodeConditionBuilder += JSON_PATH_EXPR_QUERY_PLACEHOLDER;
            }
            arrayNodeConditions.forEach(condition => {
                arrayNodeConditionBuilder += condition
            })
            if (hasMultipleConditions) {
                arrayNodeConditionBuilder += JSON_PATH_EXPR_QUERY_PLACEHOLDER_MULTICONDITION_CLOSE;
            }
            arrayNodeConditionBuilder += JSON_PATH_EXPR_ARRAYNODE_CLOSE;
            return arrayNodeConditionBuilder.toString();
        },

        objectnode: function (...parameters) {
            let key = null;
            if (parameters.length !== 0) {
                key = parameters[0];
            }
            if (key != null) {
                jsonPathExpressionString += JSON_PATH_EXPR_DOT + key;
            } else {
                jsonPathExpressionString += JSON_PATH_EXPR_DOT;
            }
            return this;
        },

        any: function (key) {
            jsonPathExpressionString += JSON_PATH_EXPR_DOT + JSON_PATH_EXPR_DOT + key;
            return this;
        },
        key: function (key) {
            return this.objectnode(key);
        },

        arraynode: function (...parameters) {
            let key = null;
            isArrayNodeOfData = false;
            if (parameters.length !== 0) {
                key = parameters[0];
            }
            if (arrayNodeConditions.length !== 0) {
                this.buildNode();
            }
            arrayNodeConditions = []
            if (key != null) {
                jsonPathExpressionString += JSON_PATH_EXPR_DOT + key + JSON_PATH_EXPR_SELECT_PLACEHOLDER;
            } else {
                jsonPathExpressionString += JSON_PATH_EXPR_DOT + JSON_PATH_EXPR_SELECT_PLACEHOLDER;
            }

            if (parameters.length > 1 && parameters[1] != null) {
                let arrayNodeOfData = parameters[1];
                if (arrayNodeOfData) {
                    isArrayNodeOfData = true;
                }
            }

            if (parameters.length > 2 && parameters[2] != null) {
                let arrayNodeInCondition = parameters[1];
                if (arrayNodeInCondition) {
                    jsonPathExpressionString = '';
                    jsonPathExpressionString += key + JSON_PATH_EXPR_SELECT_PLACEHOLDER;
                }
            }

            return this;
        },

        buildNode: function () {
            if (arrayNodeConditions.length === 0) {
                return;
            } else if (arrayNodeConditions.length > 1) {
                hasMultipleConditions = true;
            }
            let position = jsonPathExpressionString.lastIndexOf(JSON_PATH_EXPR_SELECT_PLACEHOLDER);
            let replaceString = jsonPathExpressionString.slice(position, position + JSON_PATH_EXPR_SELECT_PLACEHOLDER.length);
            jsonPathExpressionString = jsonPathExpressionString.replace(replaceString, this.printArrayNodeConditions());
        },

        select: function (...parameters) {
            let key = null;
            if (parameters.length !== 0) {
                key = parameters[0];
                if (key === JSON_PATH_EXPR_SELECT_ALL|| typeof key === 'number') {
                    let position = jsonPathExpressionString.lastIndexOf(JSON_PATH_EXPR_SELECT_PLACEHOLDER);
                    let replaceString = jsonPathExpressionString.slice(position, position + JSON_PATH_EXPR_SELECT_PLACEHOLDER.length);
                    jsonPathExpressionString = jsonPathExpressionString.replace(replaceString, JSON_PATH_EXPR_ARRAYNODE_OPEN + key + JSON_PATH_EXPR_ARRAYNODE_CLOSE + "");
                }
            }
            selectWhere = '';
            if (isArrayNodeOfData) {
                selectWhere += JSON_PATH_EXPR_LIST_IS_PLACEHOLDER;
            } else {
                selectWhere += JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER;
            }
            return this;
        },
        selectAll: function () {
            return this.select(JSON_PATH_EXPR_SELECT_ALL);
        },

        where: function (...parameters) {
            let key = parameters[0];
            let reverseCondition = false;
            if (parameters.length > 1 && parameters[1] != null) {
                reverseCondition = parameters[1];
            }
            if (reverseCondition) {
                selectWhere = '';
                selectWhere += "(<WHERE> == @.<IS>)";
            }
            let position = selectWhere.lastIndexOf(JSON_PATH_EXPR_WHERE_PLACEHOLDER);
            let replaceString = selectWhere.slice(position, position + JSON_PATH_EXPR_WHERE_PLACEHOLDER.length);
            selectWhere = selectWhere.replace(replaceString, key);
            return this;
        },

        is: function (...parameters) {
            let key = parameters[0];
            let forceNonString = false;
            if (parameters.length > 1 && parameters[1] != null) {
                forceNonString = parameters[1];
            }
            let position = selectWhere.lastIndexOf(JSON_PATH_EXPR_IS_PLACEHOLDER);
            if (forceNonString) {
                let replaceString = selectWhere.slice(position, position + JSON_PATH_EXPR_IS_PLACEHOLDER.length);
                selectWhere = selectWhere.replace(replaceString, key);
            } else {
                if (key instanceof String) {
                    let replaceString = selectWhere.slice(position, position + JSON_PATH_EXPR_IS_PLACEHOLDER.length);
                    selectWhere = selectWhere.replace(replaceString, "\"" + key.toString() + "\"");
                } else {
                    let replaceString = selectWhere.slice(position, position + JSON_PATH_EXPR_IS_PLACEHOLDER.length);
                    selectWhere = selectWhere.replace(replaceString, key + "");
                }
            }
            arrayNodeConditions.push(selectWhere.toString());
            return this;
        },

        lt: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_LESS_THAN_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        lte: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_LESS_THAN_EQUAL_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        gt: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_GREATER_THAN_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        gte: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_GREATER_THAN_EQUAL_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        neq: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_NOT_EQUAL_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        regex: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_REGEX_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        in: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_IN_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },
        nin: function (...parameters) {
            let key = parameters[0];
            this.replaceOperationPlaceHolder(JSON_PATH_EXPR_NOT_IN_QUERY_PLACEHOLDER);
            if (parameters.length > 1 && parameters[1] != null) {
                return this.is(key, parameters[1]);
            }
            return this.is(key);
        },

        replaceOperationPlaceHolder: function (queryPlaceHolder) {
            let position = selectWhere.lastIndexOf(JSON_PATH_EXPR_EQUAL_QUERY_PLACEHOLDER);
            let replaceString = selectWhere.slice(position, position + JSON_PATH_EXPR_EQUAL_QUERY_PLACEHOLDER.length);
            if (JSON_PATH_EXPR_LESS_THAN_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_LESS_THAN_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_LESS_THAN_EQUAL_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_LESS_THAN_EQUAL_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_GREATER_THAN_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_GREATER_THAN_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_GREATER_THAN_EQUAL_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_GREATER_THAN_EQUAL_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_NOT_EQUAL_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_NOT_EQUAL_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_REGEX_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_REGEX_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_IN_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_IN_QUERY_PLACEHOLDER);
            } else if (JSON_PATH_EXPR_NOT_IN_QUERY_PLACEHOLDER.equals(queryPlaceHolder)) {
                selectWhere = selectWhere.replace(replaceString, JSON_PATH_EXPR_NOT_IN_QUERY_PLACEHOLDER);
            }
        },

        and: function () {
            arrayNodeConditions.push(" && ");
            selectWhere = ''
            if (isArrayNodeOfData) {
                selectWhere += JSON_PATH_EXPR_LIST_IS_PLACEHOLDER;
            } else {
                selectWhere += JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER;
            }
            return this;
        },

        or: function () {
            arrayNodeConditions.push(" || ");
            selectWhere = ''
            if (isArrayNodeOfData) {
                selectWhere += JSON_PATH_EXPR_LIST_IS_PLACEHOLDER;
            } else {
                selectWhere += JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER;
            }
            return this;
        },

        not: function () {
            arrayNodeConditions.push("!");
            selectWhere = ''
            if (isArrayNodeOfData) {
                selectWhere += JSON_PATH_EXPR_LIST_IS_PLACEHOLDER;
            } else {
                selectWhere += JSON_PATH_EXPR_WHERE_IS_PLACEHOLDER;
            }
            return this;
        },

        clear: function () {
            jsonPathExpressionString = '';
            arrayNodeConditions = [];
            selectWhere = ''
            jsonPathExpressionString.concat("$");
            return this;
        },
        build: function (clear) {
            this.buildNode();
            return jsonPathExpressionString.toString();
        }
    };
}