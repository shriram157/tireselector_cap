sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/Filter',
	'sap/ui/core/Fragment',
	"sap/m/MessageBox"
], function (Controller, JSONModel, ResourceModel, BaseController, MessageToast, Filter, Fragment, MessageBox) {
	"use strict";
	var sDivision, DivUser, _that, count = 0,
		sTerm, sSelectedLocale, localLang;
	return BaseController.extend("tireSelector.controller.master", {
		/* Function for Initialization of model and variables for view */

		onInit: function () {
			_that = this;
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				_that.DealerData = {
					"Attribute": "01",
					"BusinessPartner": "2400042120",
					"BusinessPartnerAddress1": "3300 Steeles Ave E",
					"BusinessPartnerAddress2": "Markham,CA-L3R 1G9",
					"BusinessPartnerKey": "42120",
					"BusinessPartnerName": "Don Valley North Toyota...",
					"BusinessPartnerName2": "WEINS CANADA",
					"BusinessPartnerPhone": "",
					"BusinessPartnerType": "Z001",
					"DealerCode": "42120",
					"DealerName": "42120test",
					"Division": "10",
					"SearchTerm2": "42120",
					"CurrentDate": new Date(),
					"AddressID": "31298",
					"Div": "TOY",
					"Region": "ON"
				};
				_that._oDealerModel = new sap.ui.model.json.JSONModel();
				var dealer = _that.DealerData.BusinessPartner;
				var addressID = _that.DealerData.AddressID;
				_that.getPhoneNumber(dealer, addressID);
				_that._oDealerModel.getData().DealerData = _that.DealerData;
				_that._oDealerModel.updateBindings(true);
				_that.getView().setModel(_that._oDealerModel, "DealerModel");
				sap.ui.getCore().setModel(_that._oDealerModel, "DealerModel");
			}
			_that.nodeJsUrl = "/node";

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableSearchBtn: false,
				enableVin: true,
				enableTireSize: false,
				enableVehicleInputs: false,
				enableTable: false,
				enableProdMarkup: true,
				enableMore: false
			});

			_that.getView().setModel(_that._oViewModel, "MasterModel");

			_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			_that.getView().setModel(_that.oI18nModel, "i18n");

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "EN"; // default is english 
			}
			if (sSelectedLocale == "fr") {
				localLang = "F";
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				this.getView().setModel(_that.oI18nModel, "i18n");
				this.sCurrentLocale = 'FR';
			} else {
				localLang = "E"
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				this.getView().setModel(_that.oI18nModel, "i18n");
				this.sCurrentLocale = 'EN';
			}

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

			//appdata
			$.ajax({
				dataType: "json",
				url: "/appdata/whoAmI",
				type: "GET",
				success: function (userData) {
					_that._oDealerModel = new sap.ui.model.json.JSONModel(userData);
					_that.userData = userData;
					//2400599999
					if (_that.userData.userContext.userAttributes.DealerCode !== undefined) {
						_that.dealerCode = _that.userData.userContext.userAttributes.DealerCode[0];
					} else if (_that.userData.userContext.userAttributes.UserType[0] == "National" || _that.userData.userContext.userAttributes.UserType[
							0] == "Zone") {
						_that.dealerCode = "2400599999";
					} else {
						_that.dealerCode = "";
					}
					_that.dealerName = _that.userData.userContext.userInfo.logonName;
					//Start: comment for local testing
					var scopes = _that.userData.userContext.scopes;
					var accessAll = false,
						accesslimited = false;

					for (var s = 0; s < scopes.length; s++) {
						if (scopes[s] != "openid") {
							if (scopes[s].split(".")[1] == "Manage_Product_Markups") {
								accessAll = true;
							} else if (scopes[s].split(".")[1] == "View_Tire_Quotes") {
								accesslimited = true;
							} else {
								accessAll = false;
								accesslimited = false;
							}
						}
					}
					if (accessAll == true && accesslimited == true) {
						_that._oViewModel.setProperty("/enableProdMarkup", true);
					} else {
						_that._oViewModel.setProperty("/enableProdMarkup", false);
					}
					// Stop: comment zfor local testing
					_that.DealerData = {};
					_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
					var queryString1;
					if (_that.userData.userContext.userAttributes.UserType[0] == "National" || _that.userData.userContext.userAttributes.UserType[
							0] == "Zone") {
						queryString1 = "?$filter=BusinessPartner eq'" + _that.dealerCode + "' &$expand=to_BusinessPartnerAddress";
					} else {
						queryString1 = "?$filter=SearchTerm2 eq'" + _that.dealerCode + "' &$expand=to_BusinessPartnerAddress";
					}

					_that.oBusinessPartnerModel.read("/A_BusinessPartner" + queryString1, {
						success: $.proxy(function (oDealerData) {
							for (var i = 0; i < oDealerData.results.length; i++) {
								var address = oDealerData.results[i].to_BusinessPartnerAddress.results[0];
								_that.DealerData.AddressID = address.AddressID;
								_that.DealerData.BusinessPartnerNo = address.BusinessPartner;
								_that.getPhoneNumber(_that.DealerData.BusinessPartnerNo, _that.DealerData.AddressID);

								_that.DealerData.BusinessPartnerAddress1 = address.StreetName + "," + address.CityName;
								_that.DealerData.BusinessPartnerAddress2 = address.Country + "-" + address.PostalCode;
								_that.DealerData.BusinessPartnerPhone = "";
								_that.DealerData.Region = address.Region;
								_that._oDealerModel.getData().DealerData = _that.DealerData;
								_that._oDealerModel.updateBindings(true);
								var queryString;
								if (_that.userData.userContext.userAttributes.UserType[0] == "National" || _that.userData.userContext.userAttributes.UserType[
										0] == "Zone") {
									queryString = "?$filter=BusinessPartner eq'" + _that.dealerCode + "' &$expand=to_Customer";
								} else {
									queryString = "?$filter=SearchTerm2 eq'" + _that.dealerCode + "' &$expand=to_Customer";
								}
								_that.oBusinessPartnerModel.read("/A_BusinessPartner" + queryString, {
									success: $.proxy(function (oDealerData) {
										for (var i = 0; i < oDealerData.results.length; i++) {

											var BpLength = oDealerData.results[i].BusinessPartner.length;

											_that.getPhoneNumber(_that.DealerData.BusinessPartnerNo, _that.DealerData.AddressID);
											_that.DealerData.BusinessPartnerName = oDealerData.results[i].OrganizationBPName1;
											_that.DealerData.BusinessPartnerName2 = oDealerData.results[i].OrganizationBPName2;
											_that.DealerData.BusinessPartner = oDealerData.results[i].BusinessPartner;
											_that.DealerData.BusinessPartnerKey = oDealerData.results[i].BusinessPartner.substring(5, BpLength);
											_that.DealerData.BusinessPartnerType = oDealerData.results[i].BusinessPartnerType;
											_that.DealerData.SearchTerm2 = oDealerData.results[i].SearchTerm2;
											_that.DealerData.CustomerRegion = oDealerData.results[i].Region;
											_that._oDealerModel.getData().BusinessPartnerData = oDealerData.results;
											_that.DealerData.DealerCode = _that.dealerCode;
											_that.DealerData.DealerName = _that.dealerName;
											_that.DealerData.Div = DivUser;
											_that.DealerData.Division = sDivision;

											_that._oDealerModel.getData().DealerData = _that.DealerData;
											_that._oDealerModel.updateBindings(true);
											_that._oDealerModel.refresh(true);

											_that.getView().setModel(_that._oDealerModel, "DealerModel");
											sap.ui.getCore().setModel(_that._oDealerModel, "DealerModel");
											_that.userDetails = _that.getView().getModel("DealerModel").getData();
											_that._oDealerModel.updateBindings(true);
											_that._oDealerModel.refresh(true);

											_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
											_that.oProdMarkupModel = new sap.ui.model.json.JSONModel();
											sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");

											_that.oXSOServiceModel.read("/DealerMarkUp", {
												urlParameters: {
													"$filter": "Dealer_code eq" + "'" + (_that.userDetails.DealerData.DealerCode) + "' and Dealer_Brand eq '" +
														sDivision + "'"
												},
												success: $.proxy(function (oData) {
													if (oData.results.length > 0) {
														_that.oProdMarkupModel.setData(oData);
														_that.oProdMarkupModel.updateBindings(true);
														_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
													} else {
														// sap.m.MessageBox.error(
														// 	"NO Data found for Product Markup"
														// );
													}
												}, _that),
												error: function (oError) {
													// sap.m.MessageBox.error(
													// 	"NO Data found for Product Markup"
													// );
												}
											});
										}
									}, _that),
									error: function (oError) {
										// sap.m.MessageBox.error(
										// 	"NO Data found for BusinessPartner"
										// );
									}
								});
							}
						}, _that),
						error: function (oError) {
							// sap.m.MessageBox.error(
							// 	"NO Data found for BusinessPartner Address"
							// );
						}
					});
				},
				error: function (oError) {}
			});

			_that.oGlobalJSONModel = new sap.ui.model.json.JSONModel();
			_that.oGlobalJSONModel.setSizeLimit(5000);
			_that.getView().setModel(_that.oGlobalJSONModel, "GlobalJSONModel");
			_that.oGlobalJSONModel.updateBindings();

			_that.SearchOptionList = _that.getView().byId("searchOptionList");
			_that.ForVehicleSearchOnly = _that.getView().byId("forVehicleSearchOnly");
			_that.SearchOptionLabel = _that.getView().byId("searchOptionLabel");
			_that.SearchOptionVIN = _that.getView().byId("searchOptionVIN");
			_that.SearchOptionTireSize = _that.getView().byId("searchOptionTireSize");
			_that.ModelSeriesCombo = _that.getView().byId("ModelSeriesCombo");
			_that.SearchOptionVehicle = _that.getView().byId("VehicleSearchCombo");

			var selectedSearchVals = {};
			selectedSearchVals.SearchOptionVehicle = _that.getView().byId("VehicleSearchCombo");
			selectedSearchVals.ModelSeriesCombo = _that.getView().byId("ModelSeriesCombo");
			selectedSearchVals.SearchOptionVIN = _that.getView().byId("searchOptionVIN");
			selectedSearchVals.SearchOptionTireSize = _that.getView().byId("searchOptionTireSize");

			_that._oSearchCriteriaModel = new sap.ui.model.json.JSONModel(selectedSearchVals);
			_that._oSearchCriteriaModel.updateBindings(true);
			sap.ui.getCore().setModel(_that._oSearchCriteriaModel, "SearchCriteriaModel");
			_that.oGlobalJSONModel.getData().vehicleSeriesData = [];
			_that.oGlobalJSONModel.getData().vinData = [];

			/* JSON Model for the View */
			_that.oSelectJSONModel = new JSONModel();
			_that.getView().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			sap.ui.getCore().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			_that.oSelectJSONModel.getData().SearchOptionVal = "";
			/* Dummy JSON data */
			_that.objList = {
				"SearchOptionsList": [{
					SearchText: _that.oI18nModel.getResourceBundle().getText("VIN")
				}, {
					SearchText: _that.oI18nModel.getResourceBundle().getText("VehicleSeries")
				}, {
					SearchText: _that.oI18nModel.getResourceBundle().getText("TireSize")
				}]
			};

			_that.oSelectJSONModel.setData(_that.objList);
			_that.oSelectJSONModel.updateBindings();
			_that.SearchOptionList.setSelectedKey(_that.oI18nModel.getResourceBundle().getText("VIN"));
			_that.SearchOptionLabel.setText(_that.oI18nModel.getResourceBundle().getText("VIN"));
		},

		getPhoneNumber: function (dealer, addressID) {
			_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
			var queryString1 = "(BusinessPartner='" + dealer + "',AddressID='" + addressID + "')/to_PhoneNumber";
			_that.oBusinessPartnerModel.read("/A_BusinessPartnerAddress" + queryString1, {
				success: $.proxy(function (oDealerContactData) {
					_that.DealerData.PhoneNumber = oDealerContactData.results.length > 0 ? oDealerContactData.results[0].PhoneNumber : null;
				}, _that),
				error: function (oError) {
					// sap.m.MessageBox.error(
					// 	"NO Data found for BusinessPartner Phone Number"
					// );
				}
			});
		},

		_oMasterRoute: function (oRoute) {

		},

		onBeforeRendering: function () {
			sap.ui.core.UIComponent.getRouterFor(_that).attachRoutePatternMatched(_that._oMasterRoute, _that);
		},

		handleVINSuggest: function (oEvent) {
			sTerm = oEvent.getParameter("suggestValue");
			_that._forhandleVINSuggesCallData(sTerm);
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("VIN", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().getBinding("suggestionItems").refresh(true);
			_that._oViewModel.setProperty("/enableSearchBtn", true);
		},
		_forhandleVINSuggesCallData: function (sTerm) {
			_that.firstload = false;
			$.ajax({
				url: _that.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/ZC_GET_VLCVEHICLE_VIN?$filter=startswith(VIN,'" + sTerm + "')&$top=200&$skip=" +
					count + "",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					if (oDataResponse.d.results.length <= 0) {
						_that.firstload = false;
					} else {
						count = 0;
						_that.firstload = true;
						for (var n = 0; n < oDataResponse.d.results.length; n++) {
							_that.oGlobalJSONModel.getData().vinData = oDataResponse.d.results;
						}
						_that.oGlobalJSONModel.updateBindings(true);
						_that.oGlobalJSONModel.refresh(true);
						if (_that.firstload == true) {
							count = _that.oGlobalJSONModel.getData().vinData.length;
							$.ajax({
								url: _that.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/ZC_GET_VLCVEHICLE_VIN?$filter=startswith(VIN,'" + sTerm +
									"')&$top=100&$skip=" +
									count + "",
								type: "GET",
								dataType: "json",
								success: function (oDataResponse2) {
									if (oDataResponse.d.results.length <= 0) {
										_that.firstload = false;
										return;
									} else {
										_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
										for (var n = 0; n < oDataResponse2.d.results.length; n++) {
											_that.oGlobalJSONModel.getData().vinData.push(oDataResponse2.d.results[n]);
										}
										_that.getView().byId("searchOptionVIN").getModel("GlobalJSONModel").setSizeLimit(_that.oGlobalJSONModel.getData().vinData
											.length);
										_that.oGlobalJSONModel.updateBindings(true);
										_that.oGlobalJSONModel.refresh(true);
									}
								},
								error: function (oError) {
									// MessageBox.error(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
								}
							});
						}
					}
				},
				error: function (oError) {
					_that.firstload = false;
					// MessageBox.error(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
				}
			});
		},

		loadMoreVin: function () {
			count = _that.oGlobalJSONModel.getData().vinData.length;
			$.ajax({
				url: _that.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/ZC_GET_VLCVEHICLE_VIN?$filter=startswith(VIN,'" + sTerm + "')&$top=100&$skip=" +
					count + "",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					if (oDataResponse.d.results.length <= 0) {} else {
						for (var n = 0; n < oDataResponse.d.results.length; n++) {
							_that.oGlobalJSONModel.getData().vinData.push(oDataResponse.d.results[n]);
						}
						_that.oGlobalJSONModel.updateBindings(true);
						_that.oGlobalJSONModel.refresh(true);

						var aFilters = [];
						if (sTerm) {
							aFilters.push(new Filter("VIN", sap.ui.model.FilterOperator.StartsWith, sTerm));
						}
						_that.getView().byId("searchOptionVIN").getBinding("suggestionItems").filter(aFilters);
						_that.getView().byId("searchOptionVIN").getBinding("suggestionItems").refresh(true);
					}
				},
				error: function (oError) {
					// MessageBox.error(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
				}
			});
		},
		handleTireSizeSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("TIRE_SIZE", sap.ui.model.FilterOperator.StartsWith, sTerm));
				for (var i = 1; i <= sTerm.length; i++) {
					var newaTerm = sTerm.substr(0, i) + "/" + sTerm.substr(i, sTerm.length);
					aFilters.push(new Filter("TIRE_SIZE", sap.ui.model.FilterOperator.StartsWith, newaTerm));
				}
			}
			oEvent.getSource().getBinding("suggestionItems").filter(new Filter({
				filters: aFilters
			}));
			oEvent.getSource().getBinding("suggestionItems").refresh(true);
		},

		/*Functions for searchOption value change*/
		onVehicleChange: function () {
			// _that.oGlobalBusyDialog = new sap.m.BusyDialog();
			if (!_that.SearchOptionVehicle.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
			_that.ModelNodataFlag = false;
			sap.ui.core.BusyIndicator.show();

			_that.oGlobalJSONModel.getData().modelDetailsData = [];
			var ModelSeriesNo = _that.SearchOptionVehicle.getSelectedKey();
			var modelYearURl = _that.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/ZC_SERIES_YEARSet?$filter=Series eq '" + ModelSeriesNo + "'";
			$.ajax({
				url: modelYearURl,
				type: "GET",
				dataType: "json",
				success: function (oDataResponse2) {
					sap.ui.core.BusyIndicator.hide();
					if (oDataResponse2.d.results.length > 0) {
						_that.oGlobalJSONModel.getData().modelDetailsData = oDataResponse2.d.results;
						_that.oGlobalJSONModel.updateBindings(true);
					} else {
						_that.ModelNodataFlag = true;
					}
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					_that.ModelNodataFlag = true;
				}
			});

			if (_that.ModelNodataFlag == true) {
				sap.ui.core.BusyIndicator.hide();
				// sap.m.MessageBox.error(
				// 	"NO Data found"
				// );
			}
		},
		onInputEntryChange: function (oEntry) {
			if (!_that.ModelSeriesCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onInputEntryVIN: function (oEntry) {
			if (!_that.SearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onInputEntryTireSize: function (oEntry) {
			if (!_that.SearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onComboInputChange: function (oEntry) {
			if (!_that.ModelSeriesCombo.getValue() || !_that.SearchOptionVehicle.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onLiveChangeVIN: function (oEntry) {
			if (!_that.SearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onLiveChangeTireSize: function (oEntry) {
			if (!_that.SearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				var sTerm = oEntry.getParameter("newValue");
				var aFilters = [];
				if (sTerm) {
					aFilters.push(new Filter("TIRE_SIZE", sap.ui.model.FilterOperator.Contains, sTerm));
				}
				//	oEntry.getSource().getBinding("suggestionItems").filter(aFilters);
				//	oEntry.getSource().getBinding("suggestionItems").refresh(true);
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		/*Function for Change options on Search By Dropdownlist */
		changeOptionPress: function (oChangeOption) {
			_that = this;
			if (_that.SearchOptionVehicle) {
				_that.SearchOptionVehicle.setValue();
				_that.ModelSeriesCombo.setValue();
			}
			if (_that.SearchOptionVIN) {
				_that.SearchOptionVIN.setValue();
			}
			if (_that.SearchOptionTireSize) {
				_that.SearchOptionTireSize.setValue();
			}
			_that._oSearchCriteriaModel.setData();
			_that._oSearchCriteriaModel.updateBindings(true);

			var selectedOption = _that.SearchOptionList.getSelectedKey();
			_that._oViewModel.setProperty("/enableTable", false);

			_that.SearchOptionList.setValueState(sap.ui.core.ValueState.None);
			if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VehicleSeries")) {
				_that.SearchOptionVehicle.setValueState(sap.ui.core.ValueState.None);
				_that.ModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
				_that.ModelNodataFlag = false;
				$.ajax({
					url: _that.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields?$filter=Division eq '" + DivUser + "'",
					type: "GET",
					dataType: "json",
					success: function (oDataResponse) {
						if (oDataResponse.d.results.length > 0) {
							_that.vehicleSeriesData = {
								"results": []
							};
							$.each(oDataResponse.d.results, function (i, item) {
								if (item.ModelSeriesNo != "") {
									_that.vehicleSeriesData.results.push({
										"ModelSeriesNo": item.ModelSeriesNo,
										"TCISeriesDescriptionEN": item.TCISeriesDescriptionEN
									});
								}
							});
							_that.oGlobalJSONModel.getData().vehicleSeriesData = _that.vehicleSeriesData.results;
							_that.oGlobalJSONModel.updateBindings(true);
						} else {
							_that.ModelNodataFlag = true;
						}
					},
					error: function (oError) {
						_that.ModelNodataFlag = true;
					},
					complete: function () {
						_that.SearchOptionVehicle.setValue();
						_that.ModelSeriesCombo.setValue();
						_that.SearchOptionVehicle.setSelectedKey(null);
						_that.ModelSeriesCombo.setSelectedKey(null);
					}

				});

				if (_that.ModelNodataFlag == true) {
					// _that.oGlobalBusyDialog.close();
					// sap.m.MessageBox.error(
					// 	"NO Data found"
					// );
				}
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that.SearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
			} else {
				_that.SearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
				$.ajax({
					dataType: "json",
					url: _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/TireSizeSet", //_that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet",
					type: "GET",
					success: function (oDataResponse) {
						if (oDataResponse.d.results.length > 0) {
							for (var n = 0; n < oDataResponse.d.results.length; n++) {
								oDataResponse.d.results[n].__metadata = "";
							}
							_that.oFitmentDataModel = new JSONModel();
							_that.getView().setModel(_that.oFitmentDataModel, "FitmentDataModel");
							_that.oFitmentDataModel.setData(oDataResponse.d);
							_that.oFitmentDataModel.updateBindings();
						} else {
							// sap.m.MessageBox.error(
							// 	"NO Data found for Tire Size"
							// );
						}
					},
					error: function (oError) {
						// sap.m.MessageBox.error(
						// 	"NO Data found for Tire Size"
						// );
					}
				});
			}
			_that.SearchOptionLabel.setText(selectedOption);
			if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VehicleSeries")) {
				_that.SearchOptionVehicle.setValue();
				_that.ModelSeriesCombo.setValue();
				_that._oViewModel.setProperty("/enableVehicleInputs", true);
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableTireSize", false);
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that._oViewModel.setProperty("/enableVin", true);
				_that.SearchOptionVIN.setValue();
				_that._oViewModel.setProperty("/enableTireSize", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			} else {
				_that._oViewModel.setProperty("/enableTireSize", true);
				_that.SearchOptionTireSize.setValue();
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			}
			_that.SearchOptionLabel.setText(selectedOption);
		},

		/*Function for clearing search criteria when user clicks on Clear Search Fields */
		handleClearSearch: function () {
			_that = this;
			var selectedOption = _that.SearchOptionList.getSelectedKey();
			if ((_that.SearchOptionList.getSelectedKey() == "") && (_that.SearchOptionTireSize.getValue() == "" || _that.SearchOptionVIN.getValue() ==
					"" || (_that.SearchOptionVehicle.getValue() ==
						"" && _that.ModelSeriesCombo.getValue() == ""))) {
				_that.SearchOptionList.setValueState(sap.ui.core.ValueState.Warning);
				_that.SearchOptionVehicle.setValueState(sap.ui.core.ValueState.Warning);
				_that.SearchOptionVIN.setValueState(sap.ui.core.ValueState.Warning);
				_that.SearchOptionTireSize.setValueState(sap.ui.core.ValueState.Warning);
				_that.ModelSeriesCombo.setValueState(sap.ui.core.ValueState.Warning);
				var msg = 'No values added';
				MessageToast.show(msg);
			} else {
				if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VehicleSeries")) {
					_that.SearchOptionVehicle.setValue();
					_that.ModelSeriesCombo.setValue();
					_that.SearchOptionVehicle.setValueState(sap.ui.core.ValueState.None);
					_that.ModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
					_that.SearchOptionVIN.setValue();
					_that.SearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("TireSize")) {
					_that.SearchOptionTireSize.setValue();
					_that.SearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
				}
				_that.SearchOptionList.setValueState(sap.ui.core.ValueState.None);
			}
			_that._oViewModel.setProperty("/enableSearchBtn", false);
			_that.SearchResultModel.setData();
			_that.SearchResultModel.updateBindings(true);
			_that.SearchResultModel.refresh(true);
		},

		/*Function for Routing/Navigating to search results */
		NavToSearchResults: function (oSearchResults) {
			_that = this;

			function validateVin(vin) {
				var re = new RegExp("[a-zA-Z0-9]{9}[a-zA-Z0-9-]{2}[0-9]{6}");
				return vin.match(re);
			}
			var Searchkey = _that.SearchOptionList.getSelectedKey();
			if ((Searchkey == _that.oI18nModel.getResourceBundle().getText("VIN") || Searchkey == _that.oI18nModel.getResourceBundle().getText(
					"VehicleSeries")) &&
				(_that.SearchOptionTireSize.getValue() != "" || _that.SearchOptionVIN.getValue() != "" || _that.SearchOptionVehicle.getSelectedKey() !=
					"")) {
				_that.SearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				if (Searchkey == _that.oI18nModel.getResourceBundle().getText("VehicleSeries")) {
					_that.SearchOptionVehicle.setValueState(sap.ui.core.ValueState.Success);
					_that.ModelSeriesCombo.setValueState(sap.ui.core.ValueState.Success);
					_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
					_that.showResultsData();
				} else {
					if (validateVin(_that.SearchOptionVIN.getValue())) {
						_that.SearchOptionVIN.setValueState(sap.ui.core.ValueState.Success);
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
						_that.showResultsData();
					} else {
						_that._oViewModel.setProperty("/enableTable", false);
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
						_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
					}
				}
			} else if (Searchkey == _that.oI18nModel.getResourceBundle().getText("TireSize") && _that.SearchOptionTireSize.getValue() !== "") {
				_that.SearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				_that.SearchOptionTireSize.setValueState(sap.ui.core.ValueState.Success);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
				_that.routeToTireSelect(oSearchResults);
			} else {
				_that._oViewModel.setProperty("/enableTable", false);
				if (_that.SearchOptionList.getSelectedKey() == "") {
					_that.SearchOptionList.setValueState(sap.ui.core.ValueState.Error);
				} else if ((_that.SearchOptionTireSize.getValue() == "" || _that.SearchOptionVIN.getValue() == "") && (_that.SearchOptionTireSize
						.getVisible() == true || _that.SearchOptionVIN.getVisible() == true)) {
					_that.SearchOptionTireSize.setValueState(sap.ui.core.ValueState.Error);
					_that.SearchOptionVIN.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.SearchOptionVehicle.getSelectedKey() == "" && _that.SearchOptionVehicle.getVisible() == true) {
					_that.SearchOptionVehicle.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.ModelSeriesCombo.getSelectedKey() == "" && _that.ModelSeriesCombo.getVisible() == true) {
					_that.ModelSeriesCombo.setValueState(sap.ui.core.ValueState.Error);
				}
				_that.oSelectJSONModel.getData().SearchOptionVal = "";
				_that.oSelectJSONModel.updateBindings();
			}
		},

		routeToTireSelect: function (oSearchResults) {
			var oBj = {};
			oBj.SearchOptionVehicle = _that.SearchOptionVehicle.getSelectedKey();
			if (_that.SearchOptionVehicle.getSelectedItem() != null) {
				oBj.SeriesDescp = _that.SearchOptionVehicle.getSelectedItem().getText().split("-")[1];
			}
			oBj.ModelSeriesCombo = _that.ModelSeriesCombo.getSelectedKey();
			oBj.SearchOptionVIN = _that.SearchOptionVIN.getValue();

			var oTireData = oSearchResults.getSource().getModel("FitmentDataModel").getData().results;
			for (var n = 0; n < oTireData.length; n++) {
				if (_that.SearchOptionTireSize.getValue() == oTireData[n].TIRE_SIZE) {
					oBj.TIRE_SIZE = oTireData[n].TIRE_SIZE.replace("/", "%2F");
				}
			}
			sap.ui.core.UIComponent.getRouterFor(_that).navTo("searchResultsTireNoData", {
				tireData: JSON.stringify(oBj)
			});
		},

		showResultsData: function () {
			_that._oViewModel.setProperty("/enableTable", true);
			_that.SearchResultModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");
			var serviceURL;
			if (_that.SearchOptionVIN.getValue() != "" && _that.SearchOptionVIN.getValue() !== undefined) {
				var serviceURL1 = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_VLCVEHICLE?$filter=VHVIN eq '" + _that.SearchOptionVIN
					.getValue() + "'";
				$.ajax({
					dataType: "json",
					url: serviceURL1,
					type: "GET",
					success: function (oData) {
						_that.vinResultdata = {
							"results": []
						};
						if (oData.d.results.length > 0) {
							$.each(oData.d.results, function (i, item) {
								_that.vinResultdata.results.push({
									"modelVal": item.Model,
									"modelYearVal": item.ZZMOYR,
									"suffixVal": item.ZZSUFFIX,
									"seriesVal": item.ZZSERIES
								});
							});
						} else {
							_that._oViewModel.setProperty("/enableSearchBtn", false);
							// sap.m.MessageBox.error(
							// 	"NO Data found, Please update search criteria", {
							// 		actions: [sap.m.MessageBox.Action.CLOSE],
							// 		onClose: function (oAction) {
							// 			_that._oViewModel.setProperty("/enableSearchBtn", false);
							// 		}
							// 	}
							// );
						}
						var v;
						_that.searchresultObj = {
							"results": []
						};
						for (v = 0; v < _that.vinResultdata.results.length; v++) {
							var modelYearVal = _that.vinResultdata.results[v].modelYearVal;
							var seriesVal = _that.vinResultdata.results[v].seriesVal;
							var serviceURL2 = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_YEAR_DETAILSet?$filter=Series eq '" + seriesVal +
								"' and Zdivision eq '" + DivUser + "' and ModelYear eq '" + modelYearVal + "' and LANGUAGE eq '" + localLang + "'";
							$.ajax({
								dataType: "json",
								url: serviceURL2,
								type: "GET",
								success: function (oSearchData) {
									if (oSearchData.d.results.length > 0) {
										$.each(oSearchData.d.results, function (i, item) {
											_that.searchresultObj.results.push({
												"ModelDesc_EN": item.ModelDesc_EN,
												"Zzsuffix": item.Zzsuffix,
												"ZtireSize": item.ZtireSize,
												"ZrimType": item.ZrimType,
												"SuffixDesc": item.SuffixDesc,
												"ModelYear": item.ModelYear,
												"Front_Rear": item.Front_Rear //Addine Field for CR1032
											});
										});
										_that.SearchResultModel.setData(_that.searchresultObj);
										_that.SearchResultModel.updateBindings(true);
										_that.SearchResultModel.refresh(true);
									} else {
										// _that._oViewModel.setProperty("/enableSearchBtn", false);
										// sap.m.MessageBox.error(
										// 	"NO Data found for tire size", {
										// 		actions: [sap.m.MessageBox.Action.CLOSE],
										// 		onClose: function (oAction) {
										// 			_that._oViewModel.setProperty("/enableSearchBtn", false);
										// 		}
										// 	}
										// );
									}
								},
								error: function (oError) {}
							});
						}
						_that.SearchResultModel.setData(_that.searchresultObj);
						_that.SearchResultModel.updateBindings(true);
						_that.SearchResultModel.refresh(true);
					},
					error: function (oError) {}
				});
			} else if (_that.ModelSeriesCombo !== "" && _that.SearchOptionVehicle !== "" && _that.ModelSeriesCombo !== undefined && _that.SearchOptionVehicle !==
				undefined) {
				var TCIseries = _that.SearchOptionVehicle.getSelectedKey();
				var modelyear = _that.ModelSeriesCombo.getSelectedKey();
				var flagNODATFOUND = false;
				serviceURL = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_YEAR_DETAILSet?$filter=Series eq '" + TCIseries + "' and Zdivision eq '" +
					DivUser + "' and ModelYear eq '" + modelyear + "' and LANGUAGE eq '" + localLang + "'";
				$.ajax({
					dataType: "json",
					url: serviceURL,
					type: "GET",
					success: function (oData) {
						if (oData.d.results.length > 0) {
							_that.SearchResultModel.setData(oData.d);
							_that.SearchResultModel.updateBindings(true);
							_that.SearchResultModel.refresh(true);
						} else {
							flagNODATFOUND = true;
						}
					},
					error: function (oError) {
						flagNODATFOUND = true;
					}
				});
				if (flagNODATFOUND == true) {
					_that._oViewModel.setProperty("/enableSearchBtn", false);
					// sap.m.MessageBox.error(
					// 	"NO Data found, Please update search criteria", {
					// 		actions: [sap.m.MessageBox.Action.CLOSE],
					// 		onClose: function (oAction) {
					// 			_that._oViewModel.setProperty("/enableSearchBtn", false);
					// 		}
					// 	}
					// );
				}
			}
		},

		navToSelectTire: function (oEvtModel) {
			// Do nothing on empty row
			if (!oEvtModel.getParameter("rowBindingContext")) {
				return;
			}

			var oBj = {};
			oBj.SearchOptionVehicle = _that.SearchOptionVehicle.getSelectedKey();
			if (_that.SearchOptionVehicle.getSelectedItem() != null) {
				oBj.SeriesDescp = _that.SearchOptionVehicle.getSelectedItem().getText().split("-")[1];
			}
			oBj.ModelSeriesCombo = _that.ModelSeriesCombo.getSelectedKey();
			oBj.SearchOptionVIN = _that.SearchOptionVIN.getValue();

			var oPath = oEvtModel.getSource().getModel("SearchResultModel").getProperty(oEvtModel.getParameters().rowBindingContext.sPath);
			oBj.ZtireSize = oPath.ZtireSize.replace("/", "%2F");
			oBj.ModelDesc = oPath.ModelYear + " " + oPath.SuffixDesc; //removing +" "+oPath.ModelDesc_EN as discussed

			sap.ui.core.UIComponent.getRouterFor(_that).navTo("searchResultsTire", {
				modelData: JSON.stringify(oBj)
			});
		},

		formatTireSize: function (oSize) {
			var tireSize = oSize.replace("%2F", "/");
			return tireSize;
		},

		/*Function for Routing/Navigating from menu option as per selection */
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("master");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},

		/*Exit Function for refreshing/resetting view */
		onExit: function () {
			if (_that.getView().byId("VehicleSearchCombo") != undefined) {
				_that.getView().byId("ModelSeriesCombo").setValue();
				_that.getView().byId("VehicleSearchCombo").setValue();
			}
			if (_that.getView().byId("searchOptionVIN") != undefined) {
				_that.getView().byId("searchOptionVIN").setValue();
			}
			if (_that.getView().byId("searchOptionTireSize") != undefined) {
				_that.getView().byId("searchOptionTireSize").setValue();
			}
			_that.SearchResultModel.refresh(true);
			_that.oGlobalJSONModel.refresh(true);
			_that.oSelectJSONModel.refresh(true);
			_that.destroy();
		}
	});
});