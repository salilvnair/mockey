const express = require('express')
const app = express()
const path = require('path')
const apiController = require('./api/api.controller')

app.use(express.static(path.join(__dirname, 'build')));
global.__basedir = __dirname;

const port = 8888;

apiController.init(app, __basedir);

app.listen(process.env.PORT || port, () => {
    console.log('listening to ', port)
});