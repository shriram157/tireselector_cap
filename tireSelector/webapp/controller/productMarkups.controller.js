var _localScope;
var ChngedMarkupValsArr = []; // array to maintain index for changed markup values in the table
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter'
], function (Controller, JSONModel, ResourceModel, BaseController, History, Filter) {
	"use strict";


	var sDivision, DivUser;
	return BaseController.extend("tireSelector.controller.productMarkups", {
		onInit: function () {
			_localScope = this;

			_localScope.getRouter().attachRouteMatched(function (oEvent) {
				_localScope._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableProdMarkup: false
				});

				_localScope.getView().setModel(_localScope._oViewModel, "propertiesModel");

				_localScope.oProdMarkupModel = new JSONModel();
				sap.ui.getCore().setModel(_localScope.oProdMarkupModel, "ProdMarkupModel");
				_localScope.getView().setModel(_localScope.oProdMarkupModel, "ProdMarkupModel");

				_localScope.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				_localScope.userData = sap.ui.getCore().getModel("DealerModel").getData();
				var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
				if (isDivisionSent) {
					sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
					var currentImageSource;
					if (sDivision == '10') // set the toyoto logo
					{
						DivUser = "TOY";
						currentImageSource = this.getView().byId("idLexusLogo");
						currentImageSource.setProperty("src", "images/toyota_logo_colour.png");

					} else { // set the lexus logo
						DivUser = "LEX";
						currentImageSource = this.getView().byId("idLexusLogo");
						currentImageSource.setProperty("src", "images/LexusNew.png");
					}
				}
				/* Do not uncomment.*/
				// var scopes = _localScope.userData.userContext.scopes;
				// console.log("scopes", scopes);
				// var accessAll = false,
				// 	accesslimited = false;

				// for (var s = 0; s < scopes.length; s++) {
				// 	if (scopes[s] != "openid") {
				// 		if (scopes[s].split(".")[1] == "Manage_Product_Markups") {
				// 			accessAll = true;
				// 		} else if (scopes[s].split(".")[1] == "View_Tire_Quotes") {
				// 			accesslimited = true;
				// 		} else {
				// 			accessAll = false;
				// 			accesslimited = false;
				// 		}
				// 	}
				// }
				// if (accessAll == true && accesslimited == true) {
				// 	_localScope._oViewModel.setProperty("/enableProdMarkup", true);
				// } else {
				// 	_localScope._oViewModel.setProperty("/enableProdMarkup", false);
				// }

				// if (scopes[1] == "tireSelectorS!t1188.View_Tire_Quotes" && scopes[2] == "tireSelectorS!t1188.Manage_Product_Markups") {
				// 	_localScope._oViewModel.setProperty("/enableProdMarkup", true);
				// } else {
				// 	_localScope._oViewModel.setProperty("/enableProdMarkup", false);
				// }

				jQuery.sap.require("sap.ui.core.format.DateFormat");
				_localScope.oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:MM:ss"
				});

				function callECCData() {
					_localScope.oProdMarkupModel.setData();
					_localScope.oProdMarkupModel.updateBindings(true);
					_localScope.oPriceServiceModel = _localScope.getOwnerComponent().getModel("PriceServiceModel");
					_localScope.oPriceServiceModel.read("/ZC_TireBrandSet?$format=json", {
						success: $.proxy(function (data) {
							_localScope.tireBrandData = {
								"results": []
							};
							$.each(data.results, function (i, item) {
								_localScope.tireBrandData.results.push({
									"Dealer_code": _localScope.userData.DealerData.DealerCode,
									"Dealer_Brand": _localScope.userData.DealerData.Division,
									"Manufacturer_code": item.VALUE, 
									"Preview_Markup_Percentage": "0.00",
									"Live_Markup_Percentage": "0.00",
									"Live_Last_Updated": _localScope.oDateFormat.format(new Date()),
									"Live_Last_Updated_update": "",
									"Live_Last_Updated_By": _localScope.userData.DealerData.BusinessPartnerName, // DEFECT ID: 9157 Point 4
									"User_First_Name": _localScope.userData.DealerData.BusinessPartnerName,
									"User_Last_Name": _localScope.userData.DealerData.BusinessPartnerName2,
									"tooltipText": _localScope.oI18nModel.getResourceBundle().getText("tooltip")
								});
							});
							_localScope.oProdMarkupModel.setData(_localScope.tireBrandData);
							_localScope.oProdMarkupModel.updateBindings(true);
						}, _localScope),
						error: function (oError) {}
					});
				}

				_localScope.oXSOServiceModel = _localScope.getOwnerComponent().getModel("XsodataModel");
				_localScope.oXSOServiceModel.read("/DealerMarkUp", {
					urlParameters: {
						"$filter": "Dealer_code eq" + "'" + (_localScope.userData.DealerData.DealerCode) + "' and Dealer_Brand eq '" + _localScope.userData
							.DealerData.Division + "'"
					},
					success: $.proxy(function (oData) {
						if (oData.results.length == 0) {
							callECCData();
						} else {
							_localScope.oProdMarkupModel.setData(oData);
							_localScope.oProdMarkupModel.updateBindings(true);
						}
					}, _localScope),
					error: function (oError) {}
				});
			
				_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties"
				});
				_localScope.getView().setModel(_localScope.oI18nModel, "i18n");

				var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
				if (isLocaleSent) {
					_localScope.sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
				} else {
					_localScope.sSelectedLocale = "EN"; // default is english 
				}
				if (_localScope.sSelectedLocale == "fr") {
					_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl: "i18n/i18n.properties",
						bundleLocale: ("fr")
					});
					this.getView().setModel(_localScope.oI18nModel, "i18n");
					this.sCurrentLocale = 'FR';
				} else {
					_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl: "i18n/i18n.properties",
						bundleLocale: ("en")
					});
					this.getView().setModel(_localScope.oI18nModel, "i18n");
					this.sCurrentLocale = 'EN';
				}
			}, _localScope);
		},

		onPressBreadCrumb: function (oEvtLink) {
			_localScope.getRouter().navTo("master");
		},

		updatePostdateLive: function (oUpdatedDate) {
			_localScope.oProdMarkupModel.getProperty(oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getPath()).Live_Last_Updated_update =new Date();
			ChngedMarkupValsArr[parseInt(oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getPath().split('/')[2])] = true;
			_localScope.oProdMarkupModel.updateBindings(true);
			_localScope.oProdMarkupModel.refresh(true);
		},

		updateXSALiveTable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			var modelData = _localScope.oProdMarkupModel.getData().results;
			_localScope.oBundle = _localScope.getView().getModel("i18n").getResourceBundle(); //_localScope.oBundle.getText("ErrNOData")

			var postSuccessFlag = false;
			var updateSuccessFlag = false;
			for (var i = 0; i < modelData.length; i++) { 
				if (ChngedMarkupValsArr[i]) {
					var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
						"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";
					var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

					var bindingContext = oModel.getContext(sContextPathInfo);
					var bindingContextPath = bindingContext.getPath();
					var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);

					if (dataFromModel) {
						/*Fixes for Defect number 12147 start*/
						dataFromModel.Live_Markup_Percentage = Number((parseFloat(modelData[i].Preview_Markup_Percentage)).toFixed(2));
						/*Fixes for Defect number 12147 end*/
						dataFromModel.Preview_Markup_Percentage = "0.00";
						if (modelData[i].Live_Last_Updated_update !== "" && modelData[i].Live_Last_Updated_update != undefined) {
							dataFromModel.Live_Last_Updated = new Date();
							dataFromModel.IsLive = "Y";
						} else {
							dataFromModel.Live_Last_Updated = new Date();
							dataFromModel.IsLive = "";
							if (dataFromModel.Live_Markup_Percentage == "0.00") {
								dataFromModel.tooltipText = _localScope.oI18nModel.getResourceBundle().getText("tooltip");
							}
						}
						dataFromModel.Live_Last_Updated_By = _localScope.userData.DealerData.BusinessPartnerName;
						dataFromModel.User_First_Name = _localScope.userData.DealerData.BusinessPartnerName;
						dataFromModel.User_Last_Name = _localScope.userData.DealerData.BusinessPartnerName2;

						oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
							updateSuccessFlag = true;
						});
						updateSuccessFlag = true;
					} else {
						var newDataFromModel = {};
						newDataFromModel.Dealer_code = modelData[i].Dealer_code;
						newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
						newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
						if (modelData[i].Preview_Markup_Percentage != "0.00") {
							/*Fixes for Defect number 12147 start*/
							newDataFromModel.Live_Markup_Percentage = Number((parseFloat(modelData[i].Preview_Markup_Percentage)).toFixed(2));
							/*Fixes for Defect number 12147 end*/
							newDataFromModel.Preview_Markup_Percentage = "0.00";
						} else {
							newDataFromModel.Live_Markup_Percentage = "0.00";
							newDataFromModel.tooltipText = _localScope.oI18nModel.getResourceBundle().getText("tooltip");
							newDataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
						}

						if (modelData[i].Live_Last_Updated_update !== "") {
							newDataFromModel.IsLive = "Y";
						} else {
							newDataFromModel.IsLive = "";
						}
						newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
						newDataFromModel.User_First_Name = modelData[i].User_First_Name;
						newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
						oModel.create("/DealerMarkUp", newDataFromModel, null, {
							urlParameters: {
								"$filter": "Dealer_code eq" + "'" + (_localScope.userData.DealerData.DealerCode) + "' and Dealer_Brand eq '" + _localScope.userData
									.DealerData.Division + "'"
							},
							success: function (oData, oResponse) {
								postSuccessFlag = true;
							},
							error: function (oError) {
								postSuccessFlag = false;
							}
						});
						postSuccessFlag = true;
					}
				}
			}

			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					_localScope.oBundle.getText("Successful"), {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					_localScope.oBundle.getText("Successful"), {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							ChngedMarkupValsArr = [];
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_localScope.callUpdatedProdMarkupTab();
			// ===================================================== Update Functionality - End ===============================
		},

		updateXSATable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			var modelData = _localScope.oProdMarkupModel.getData().results;
			_localScope.oBundle = _localScope.getView().getModel("i18n").getResourceBundle(); //_localScope.oBundle.getText("ErrNOData")
			var postSuccessFlag = false;
			var updateSuccessFlag = false;
			for (var i = 0; i < modelData.length; i++) { //modelData.length
				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";
				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath); //bindingContext.getModel().getContext(bindingContextPath); //Updated by RT 20-12-2018 //bindingContext.getModel().getProperty(bindingContextPath); 

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					/*Fixes for Defect number 12147 start*/
					dataFromModel.Preview_Markup_Percentage = Number((parseFloat(modelData[i].Preview_Markup_Percentage)).toFixed(2));
					/*Fixes for Defect number 12147 end*/
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					if (dataFromModel.Live_Markup_Percentage == "0.00") {
						dataFromModel.tooltipText = _localScope.oI18nModel.getResourceBundle().getText("tooltip");
					}
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "";

					oModel.update(bindingContextPath, dataFromModel, null, {
						success: function (oData, oResponse) {
							updateSuccessFlag = true;
						},
						error: function (oError) {
							updateSuccessFlag = false;
						}
					});
					updateSuccessFlag = true;
				} else {
					var newDataFromModel = {};
					newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					newDataFromModel.Live_Markup_Percentage = "0.00";
					newDataFromModel.tooltipText = _localScope.oI18nModel.getResourceBundle().getText("tooltip");
					/*Fixes for Defect number 12147 start*/
					newDataFromModel.Preview_Markup_Percentage = Number((parseFloat(modelData[i].Preview_Markup_Percentage)).toFixed(2));
					/*Fixes for Defect number 12147 end*/
					newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					newDataFromModel.IsLive = "";
					oModel.refreshSecurityToken();
					oModel.create("/DealerMarkUp", newDataFromModel, null, {
						urlParameters: {
							"$filter": "Dealer_code eq" + "'" + (_localScope.userData.DealerData.DealerCode) + "' and Dealer_Brand eq '" + _localScope.userData
								.DealerData.Division + "'"
						},
						success: function (oData, oResponse) {
							postSuccessFlag = true;
						},
						error: function (oError) {
							postSuccessFlag = false;
						}
					});
					postSuccessFlag = true;
				}
			}
			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					_localScope.oBundle.getText("Successful"), {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					_localScope.oBundle.getText("Successful"), {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_localScope.callUpdatedProdMarkupTab();
			// ===================================================== Update Functionality - End ===============================
		},
		
		callUpdatedProdMarkupTab: function () {
			_localScope.oXSOServiceModel = this.getOwnerComponent().getModel("XsodataModel");
			var flagNoData = false;
			_localScope.oXSOServiceModel.read("/DealerMarkUp", {
				urlParameters: {
					"$filter": "Dealer_code eq" + "'" + (_localScope.userData.DealerData.DealerCode) + "' and Dealer_Brand eq '" + _localScope.userData
						.DealerData.Division + "'"
				},
				success: $.proxy(function (oData) {
					if (oData.results.length > 0) {
						_localScope.oProdMarkupModel.setData(oData);
						_localScope.oProdMarkupModel.updateBindings(true);
					} else {
						flagNoData = true;
					}
				}, _localScope),
				error: function (oError) {
					flagNoData = true;
				}
			});
			if (flagNoData == true) {
				// sap.m.MessageBox.error(
				// 	"No data found in Product Markup Table"
				// );
			}
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_localScope.getRouter().navTo("master");
			} else if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_localScope.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("ReportError")) {
				_localScope.getRouter().navTo("reportError");
			}
		},

		BackToHistory: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				sap.ui.core.UIComponent.getRouterFor(_localScope).navTo("master");
			}
		},

		onExit: function () {
			_localScope.destroy();
			_localScope.oSelectJSONModel.refresh();
		}

	});
});