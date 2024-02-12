/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

var express = require("express");
var xsenv = require("@sap/xsenv");
module.exports = function (appContext) {
	var router = express.Router();

	router.get("/whoAmI", (req, res) => {
		var userContext = {
			scopes: JSON.parse(JSON.stringify(req.authInfo.scopes)),
			userAttributes: JSON.parse(JSON.stringify(req.authInfo.userAttributes)),
			userInfo: JSON.parse(JSON.stringify(req.authInfo.userInfo))
		};
		res.type('application/json').status(200).send(JSON.stringify({
			userContext: userContext
		}));
	});

	return router;
};