sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device"
], function (Controller, History, Device) {
	"use strict";

	return Controller.extend("tireSelector.controller.BaseController", {

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		//This code makes no sense. Why would you want to send an email to yourself to report the error?
		onShareEmailPress: function () {
			var email, logonName;
			$.ajax({
				dataType: "json",
				url: "/appdata/whoAmI",
				type: "GET",
				success: function (userData) {
					email = userData.userContext.userInfo.email;
					logonName = userData.userContext.userInfo.logonName;
				},
				error: function (oError) {}
			});
			var dealer = {
				name: logonName,
				email: email
			};
			sap.m.URLHelper.triggerEmail(dealer.email);
		}
	});
});