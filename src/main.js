const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const path = require('path');
const apiController = require('./lib/api/api.controller');
const resolverRegistry = require('./resolver/core/resolver.registry');


app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}))
global.__basedir = __dirname;

const port = 31333;
let resolver = resolverRegistry.init();
apiController.init(app, __basedir, resolver);


// http server
app.listen(process.env.PORT || port, () => {
    console.log('listening to ', port);
});


//// Uncomment below and comment above for the https 
//// https server

// const httpsOptions = {
//   key: fs.readFileSync('/usr/local/openresty/ssl/cert.key'),
//   cert: fs.readFileSync('/usr/local/openresty/ssl/cert.crt')
// };

// Replace app.listen with https server
// https.createServer(httpsOptions, app).listen(port, () => {
//   console.log('HTTPS server running on port '+port);
// });