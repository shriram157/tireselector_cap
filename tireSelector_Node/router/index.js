/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

var apiProxy = require("./routes/api-proxy");
var appData = require("./routes/app-data");

module.exports = (app, appContext) => {
	app.use("/node", apiProxy(appContext));
	app.use("/appdata", appData(appContext));
};