const dataController = require('../helper/data.controller');

exports.init = function (app, baseDir) {
    dataController.setupBaseDir(baseDir)
    initRoutes(app)
}


function initRoutes(app) {

    app.get('/test-service/user', (req, resp) => {
        return dataController.responseData('/test-service/user', req, resp);
    });


}


