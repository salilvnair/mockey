const express = require('express');
const app = express();
const path = require('path');
const apiController = require('./lib/api/api.controller');
const resolverRegistry = require('./resolver/core/resolver.registry');


app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
global.__basedir = __dirname;

const port = 8888;
let resolver = resolverRegistry.init();
apiController.init(app, __basedir, resolver);


app.listen(process.env.PORT || port, () => {
    console.log('listening to ', port);
});