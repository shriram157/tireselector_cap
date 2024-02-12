var _scopeLocal; 
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("tireSelector.controller.reportError", {
		
		onInit: function () {
			_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/_scopeLocal.oI18nModelproperties"
			});
			_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");

			if (window.location.search == "?language=fr") {
				_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");
				_scopeLocal.sCurrentLocale = 'FR';
			} else {
				_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");
				_scopeLocal.sCurrentLocale = 'EN';
			}
		},
		
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_scopeLocal.getRouter().navTo("master");
			} else if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_scopeLocal.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("ReportError")) {
				_scopeLocal.getRouter().navTo("reportError");
			}
		},
		
		NavBackToSearch: function () {
			_scopeLocal.getRouter().navTo("master");
		},

		onExit: function () {
			_scopeLocal.destroy();
		}
	});
});