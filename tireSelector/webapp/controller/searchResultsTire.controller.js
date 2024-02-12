sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/Filter',
	'sap/m/ObjectIdentifier',
	'tireSelector/controller/BaseController',
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	'sap/m/MessageToast'
], function (Controller, JSONModel, ResourceModel, Filter, ObjectIdentifier, BaseController, History, MessageBox, MessageToast) {
	"use strict";
	var that, DealerNet, MSRP, oTable, tempData, VIN, VehicleSeries, VModelYear, VehicleSeriesDescp, sSelectedLocale, sDivision, DivUser,
		localLang, ModelDesc;

	return BaseController.extend("tireSelector.controller.searchResultsTire", {
		onInit: function () {
			that = this;
			// oTable = that.getView().byId("idTireSelectionTable");
			sap.ushell.components.oTable = that.getView().byId("idTireSelectionTable");

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			}
			that.nodeJsUrl = "/node";

			that.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			that.getView().setModel(that.oI18nModel, "i18n");

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "EN"; // default is english 
			}
			if (sSelectedLocale == "fr") {
				localLang = "F";
				that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				this.getView().setModel(that.oI18nModel, "i18n");
				this.sCurrentLocale = 'FR';
			} else {
				localLang = "E";
				that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				this.getView().setModel(that.oI18nModel, "i18n");
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
			sap.ui.core.UIComponent.getRouterFor(that).attachRoutePatternMatched(that._oSelectTireRoute, that);

			that.oTable = that.getView().byId("idTireSelectionTable");
			var oBindingInfo = that.oTable.getBindingInfo("rows");
			that.oTable.bindRows(oBindingInfo);
			this.byId("idVBox").addItem(that.oTable);
			sap.ushell.components.FacetFilters = that.byId("idVBox");
		},

		_oSelectTireRoute: function (oEvent) {
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/tireSelector-dest"; 
				that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			} else {
				this.sPrefix = "";
			}
			// this.sPrefix = "";
			that.nodeJsUrl = this.sPrefix + "/node";

			that.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			that.getView().setModel(that.oI18nModel, "i18n");

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "EN"; // default is english 
			}
			if (sSelectedLocale == "fr") {
				localLang = "F";
				that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				this.getView().setModel(that.oI18nModel, "i18n");
				this.sCurrentLocale = 'FR';
			} else {
				localLang = "E";
				that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				this.getView().setModel(that.oI18nModel, "i18n");
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
			if (sSelectedLocale == "fr") {
				var oViewModel = new sap.ui.model.json.JSONModel({
					localLang: "F"
				});
			} else {
				oViewModel = new sap.ui.model.json.JSONModel({
					localLang: "E"
				});
			}

			this.getView().setModel(oViewModel, "languageModel");

			//fetching data from HDB for porduct markup 
			that.oXSOServiceModel = that.getOwnerComponent().getModel("XsodataModel");
			that.oProdMarkupModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(that.oProdMarkupModel, "ProdMarkupModel");
			sap.ui.getCore().setModel(that.oProdMarkupModel, "ProdMarkupModel");

			that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			that.userDetails = sap.ui.getCore().getModel("DealerModel").getData();

			that.oXSOServiceModel.read("/DealerMarkUp", {
				urlParameters: {
					"$filter": "Dealer_code eq" + "'" + (that.userDetails.DealerData.DealerCode) + "' and Dealer_Brand eq '" + sDivision + "'"
				},
				success: $.proxy(function (oData) {
					if (oData.results.length > 0) {
						that.oProdMarkupModel.setData(oData);
						that.oProdMarkupModel.updateBindings(true);
						that.getView().setModel(that.oProdMarkupModel, "ProdMarkupModel");
					} else {
						// sap.m.MessageBox.error(
						// 	"NO Data found for Product Markup"
						// );
					}
				}, that),
				error: function (oError) {
					// sap.m.MessageBox.error(
					// 	"NO Data found for Product Markup"
					// );
				}
			});

			sap.ushell.components.oTable.getColumns()[7].setVisible(false);
			sap.ushell.components.oTable.getColumns()[8].setVisible(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[0].setSelected(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[1].setSelected(false)
			//sap.ushell.components.oTable.getToolbar().getContent()[0].setSelected(false);
			//sap.ushell.components.oTable.getToolbar().getContent()[1].setSelected(false);

			that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableDealerNet: false,
				enableProfit: false,
				enableProdMarkup: false
			});

			that.getView().setModel(that._oViewModel, "FitmentPageModel");

			that.AddressID = that.userDetails.DealerData.AddressID;
			that.BusinessPartner = that.userDetails.DealerData.BusinessPartner;
			that.oBusinessPartnerModel = that.getOwnerComponent().getModel("BusinessPartnerModel");
			var queryString1 = "(BusinessPartner='" + that.BusinessPartner + "',AddressID='" + that.AddressID + "')/to_PhoneNumber";
			jQuery.sap.delayedCall(5000, that, function () {
				that.oBusinessPartnerModel.read("/A_BusinessPartnerAddress" + queryString1, {
					success: $.proxy(function (oDealerContactData) {
						var dealerPhoneNumber = oDealerContactData.results.length > 0 ? oDealerContactData.results[0].PhoneNumber : null;
						sap.ushell.components.dealerPhoneNumber = dealerPhoneNumber;
						sap.ui.getCore().getModel("DealerModel").getData().DealerData.PhoneNumber = dealerPhoneNumber;
						sap.ui.getCore().getModel("DealerModel").updateBindings(true);
					}, that),
					error: function (oError) {
						// sap.m.MessageBox.error(
						// 	"NO Data found for BusinessPartner Phone Number"
						// );
					}
				});
			});

			//START: uncomment below for cloud testing
			var scopes = that.userDetails.userContext.scopes;
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
				that._oViewModel.setProperty("/enableProdMarkup", true);
			} else {
				that._oViewModel.setProperty("/enableProdMarkup", false);
			}
			
			//  END : uncomment below for cloud testing
			that.oTireFitmentJSONModel = new sap.ui.model.json.JSONModel();
			oTable = that.getView().byId("idTireSelectionTable");

			that.oPriceModel = new sap.ui.model.json.JSONModel();
			that.oPriceServiceModel = that.getOwnerComponent().getModel("PriceServiceModel");

			var filterData;
			that.fromTireCenter = false;
			that.oSuggestedBpData = [{
				"BPNumber": "2400599987",
				"BPRegion": "AB"
			}, {
				"BPNumber": "2400599982",
				"BPRegion": "BC"
			}, {
				"BPNumber": "2400599983",
				"BPRegion": "MB"
			}, {
				"BPNumber": "2400599984",
				"BPRegion": "SK"
			}, {
				"BPNumber": "2400599985",
				"BPRegion": "QC"
			}, {
				"BPNumber": "2400599992",
				"BPRegion": "NB"
			}, {
				"BPNumber": "2400599993",
				"BPRegion": "NL"
			}, {
				"BPNumber": "2400599994",
				"BPRegion": "NS"
			}, {
				"BPNumber": "2400599995",
				"BPRegion": "PE"
			}, {
				"BPNumber": "2400599996",
				"BPRegion": "NT"
			}, {
				"BPNumber": "2400599997",
				"BPRegion": "NU"
			}, {
				"BPNumber": "2400599998",
				"BPRegion": "YT"
			}, {
				"BPNumber": "2400599999",
				"BPRegion": "ON"
			}];
			var CustomerRegion = that.userDetails.DealerData.Region;
			var BPFiltered = that.oSuggestedBpData.filter(function (val) {
				return val.BPRegion == CustomerRegion;
			});
			that.SoldtoParty = BPFiltered[0].BPNumber;

			if (oEvent.getParameter("arguments").modelData !== undefined) {
				that.oModelData = JSON.parse(oEvent.getParameter("arguments").modelData);
				VIN = that.oModelData.SearchOptionVIN;
				VModelYear = that.oModelData.ModelSeriesCombo;
				VehicleSeries = that.oModelData.SearchOptionVehicle;
				VehicleSeriesDescp = that.oModelData.SeriesDescp;
				ModelDesc = that.oModelData.ModelDesc;
				filterData = "?$filter=TIRE_SIZE eq '" + that.oModelData.ZtireSize +
					"' and CLASS eq 'TIRE_INFORMATION' and Division eq '00' and DocType eq 'ZAF' and SalesOrg eq '7000' and DistrChan eq '10' and SoldtoParty eq '" +
					that.SoldtoParty + "' and LANGUAGE eq '" + localLang + "'&$format=json";

			} else if (oEvent.getParameter("arguments").tireData !== undefined) {
				that.fromTireCenter = true;
				that.oTireData = JSON.parse(oEvent.getParameters().arguments.tireData);
				VIN = that.oTireData.SearchOptionVIN;
				VModelYear = that.oTireData.ModelSeriesCombo;
				VehicleSeries = that.oTireData.SearchOptionVehicle;
				VehicleSeriesDescp = that.oTireData.SeriesDescp;
				ModelDesc = "";
				filterData = "?$filter=TIRE_SIZE eq '" + that.oTireData.TIRE_SIZE +
					"' and CLASS eq 'TIRE_INFORMATION' and Division eq '00' and DocType eq 'ZAF' and SalesOrg eq '7000' and DistrChan eq '10' and SoldtoParty eq '" +
					that.SoldtoParty + "' and LANGUAGE eq '" + localLang + "'&$format=json";
			}
			if (filterData !== undefined) {
				sap.ui.core.BusyIndicator.show();
				that.oFitmentModel = that.getOwnerComponent().getModel("FitmentModel");
				that.tempModel = new sap.ui.model.json.JSONModel();

				that.oFitmentModel.read("/ZC_Characteristic_InfoSet" + filterData, {
					success: $.proxy(function (oData) {
							that.oTireFitmentJSONModel.setData(null);
							that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							sap.ushell.components.oTable.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							sap.ushell.components.FacetFilters.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							that.oTireFitmentJSONModel.updateBindings(true);
							that.oBundle = that.getView().getModel("i18n").getResourceBundle();
							if (oData.results.length > 0) {
								that.tempModel.setData(oData);
								that.tempModel.updateBindings(true);
								if (that.tempModel.getData().results.length <= 0) {
									sap.ui.core.BusyIndicator.hide();
									sap.m.MessageBox.error(
										that.oBundle.getText("ErrNOData"), {
											actions: [sap.m.MessageBox.Action.CLOSE],
											onClose: function (oAction) {
												that.oTireFitmentJSONModel.setData({});
												that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												sap.ushell.components.oTable.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												sap.ushell.components.FacetFilters.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												that.oTireFitmentJSONModel.refresh(true);
												that.oTireFitmentJSONModel.updateBindings(true);
											}
										}
									);
								} else {
									jQuery.sap.delayedCall(0, that, function () {
										that.oBundle = that.getView().getModel("i18n").getResourceBundle();
										if (that.tempModel.getData().results !== undefined) {
											for (var n = 0; n < that.tempModel.getData().results.length; n++) {
												//Check with Pranay if we can skip
												if (that.tempModel.getData().results[n].TIRE_CATEGORY == "?") {
													that.tempModel.getData().results[n].TIRE_CATEGORY = "";
												}
												if (that.tempModel.getData().results[n].TIRE_BRAND_NAME == "?") {
													that.tempModel.getData().results[n].TIRE_BRAND_NAME = "";
												}
												if (that.tempModel.getData().results[n].TIRE_MFG_PART_NUM == "?") {
													that.tempModel.getData().results[n].TIRE_MFG_PART_NUM = "";
												}
												if (that.fromTireCenter != true) {
													if (that.tempModel.getData().results[n].TIRE_FITMENT == "PF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = that.oBundle.getText("Perfect");
														that.tempModel.getData().results[n].colorCell = "Green";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "AF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = that.oBundle.getText("Acceptable");
														that.tempModel.getData().results[n].colorCell = "Yellow";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "OE") {
														that.tempModel.getData().results[n].TIRE_FITMENT = "OE";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "OF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = that.oBundle.getText("Other");
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "DC") {
														that.tempModel.getData().results[n].TIRE_FITMENT = that.oBundle.getText("Discontinued");
														that.tempModel.getData().results[n].colorCell = "Magenta";
													}
												} else {
													if (that.tempModel.getData().results[n].TIRE_FITMENT == "PF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = "";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "AF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = "";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "OE") {
														that.tempModel.getData().results[n].TIRE_FITMENT = "";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "OF") {
														that.tempModel.getData().results[n].TIRE_FITMENT = "";
													} else if (that.tempModel.getData().results[n].TIRE_FITMENT == "DC") {
														that.tempModel.getData().results[n].TIRE_FITMENT = that.oBundle.getText("Discontinued");
														that.tempModel.getData().results[n].colorCell = "Magenta";
													}

												}

												var temp = that.tempModel.getData().results[n];
												if (that.oProdMarkupModel.getData().results != undefined) {
													if (that.oProdMarkupModel.getData().results.length > 0) {
														that.oProdMarkupModel = sap.ui.getCore().getModel("ProdMarkupModel");
														for (var k = 0; k < that.oProdMarkupModel.getData().results.length; k++) {
															if (temp.TIRE_BRAND_NAME == that.oProdMarkupModel.getData().results[k].Manufacturer_code) {
																if (that.oProdMarkupModel.getData().results[k].Live_Markup_Percentage != undefined) {
																	temp.Live_Markup_Percentage = that.oProdMarkupModel.getData().results[k].Live_Markup_Percentage;
																	that.tempModel.updateBindings(true);
																} else {
																	temp.Live_Markup_Percentage = 0;
																	that.tempModel.updateBindings(true);
																}
															}
															if (temp.TIRE_BRAND_NAME == that.oProdMarkupModel.getData().results[k].Manufacturer_code) {
																if (that.oProdMarkupModel.getData().results[k].Preview_Markup_Percentage != undefined) {
																	temp.Preview_Markup_Percentage = that.oProdMarkupModel.getData().results[k].Preview_Markup_Percentage;
																	that.tempModel.updateBindings(true);
																} else {
																	temp.Preview_Markup_Percentage = 0;
																	that.tempModel.updateBindings(true);
																}
															}
														}
													} else {
														temp.Live_Markup_Percentage = 0;
														temp.Preview_Markup_Percentage = 0;
														that.tempModel.updateBindings(true);
													}
												}
											}
										}
									});

									that.msgFlag = false;
									that.FitmentToCharac = {
										"results": []
									};

									setTimeout(function () {
										that.tempStorage = that.tempModel.getData().results;
										that.oBundle = that.getView().getModel("i18n").getResourceBundle(); //that.oBundle.getText("TireFitment")
										that.Filters = [{
											"type": that.oBundle.getText("TireFitment"),
											"values": []
										}, {
											"type": that.oBundle.getText("TireCategory"),
											"values": []
										}, {
											"type": that.oBundle.getText("TireBrand"),
											"values": []
										}, {
											"type": that.oBundle.getText("TireSpeedRating"),
											"values": []
										}, {
											"type": that.oBundle.getText("TireMFGPartNo"),
											"values": []
										}];

										for (var l = 0; l < that.tempModel.getData().results.length; l++) {
											that.Filters[0].values.push({
												"text": that.tempModel.getData().results[l].TIRE_FITMENT
											});
											that.Filters[1].values.push({
												"text": that.tempModel.getData().results[l].TIRE_CATEGORY
											});
											that.Filters[2].values.push({
												"text": that.tempModel.getData().results[l].TIRE_BRAND_NAME
											});
											that.Filters[3].values.push({
												"text": that.tempModel.getData().results[l].TIRE_SPEED_RATING
											});
											that.Filters[4].values.push({
												"text": that.tempModel.getData().results[l].TIRE_MFG_PART_NUM
											});

											var tempTireData = that.tempModel.getData().results[l];
											if (tempTireData.DealerNet !== null && tempTireData.DealerNet != undefined) {
												if (tempTireData.Live_Markup_Percentage == undefined) {
													tempTireData.Live_Markup_Percentage = 0;
												}
												if (tempTireData.Live_Markup_Percentage != "" && tempTireData.Live_Markup_Percentage != undefined) {
													if (Number(tempTireData.DealerNet) != 0 && Number(tempTireData.Live_Markup_Percentage != 0)) {
														that.tempModel.getData().results[l].Retails = Number(tempTireData.DealerNet) + (Number(tempTireData.DealerNet) *
															(Number(tempTireData.Live_Markup_Percentage) / 100));
													} else {
														that.tempModel.getData().results[l].Retails = Number(tempTireData.MSRP);
													}
												} else {
													if (Number(tempTireData.MSRP) != 0) {
														that.tempModel.getData().results[l].Retails = Number(tempTireData.MSRP);
													}
												}
												that.tempModel.getData().results[l].Profit = (Number(tempTireData.Retails)) - (Number(tempTireData.DealerNet));
												that.tempModel.updateBindings(true);
											} else {
												that.msgFlag = true;
												that.tempModel.getData().results[l].Profit = 0;
												that.tempModel.getData().results[l].Retails = 0;
												that.tempModel.getData().results[l].DealerNet = 0;
												that.tempModel.updateBindings(true);
											}
											that.tempModel.updateBindings(true);
										}

										function removeDuplicates(array) {
											var obj = {};
											for (var i = 0, len = array.values.length; i < len; i++)
												obj[array.values[i]['text']] = array.values[i];

											array.values = new Array();
											for (var key in obj)
												array.values.push(obj[key]);
											return array;
										}
										// Sort Filter 
										that.Filters[0] = removeDuplicates(that.Filters[0]);

										that.Filters[1] = removeDuplicates(that.Filters[1]);

										that.Filters[2] = removeDuplicates(that.Filters[2]);
										var tierBrandFilterValues = that.Filters[2].values;
										/* Defect ID: 9146
										 *  Description :  Tire Brand filter sort order should be alphabatically with All at the top
										 *   Date: 11/03/2019
										 *   Developer : Abhijeet Parihar
										 *	START
										 */
										tierBrandFilterValues.sort(function (a, b) {
											var nameA = a.text,
												nameB = b.text;
											if (nameA < nameB) //sort string ascending
												return -1;
											if (nameA > nameB)
												return 1;
											return 0; //default return value (no sorting)
										});
										/* Defect ID: 9146
										 *  Description :  Tire Brand filter sort order should be alphabatically with All at the top
										 *   Date: 11/03/2019
										 *   Developer : Abhijeet Parihar
										 *	END
										 */
										that.Filters[3] = removeDuplicates(that.Filters[3]);

										that.Filters[4] = removeDuplicates(that.Filters[4]);
										that.oBundle = that.getView().getModel("i18n").getResourceBundle(); 
										$.each(that.tempModel.getData().results, function (i, item) {
											that.FitmentToCharac.results.push({
												"Tire Fitment": item.TIRE_FITMENT,
												"Utilisation de pneu": item.TIRE_FITMENT,
												"TireFitment": item.TIRE_FITMENT,
												"Tire Speed Rating": item.TIRE_SPEED_RATING,
												"Tire Load Rating": item.TIRE_LOAD_RATING,
												"Indice de vitesse": item.TIRE_SPEED_RATING,
												"Indice de charge": item.TIRE_LOAD_RATING,
												"TireSpeed": item.TIRE_SPEED_RATING,
												"TireLoad": item.TIRE_LOAD_RATING,
												"Tire Brand": item.TIRE_BRAND_NAME,
												"Description de marque de pneu": item.TIRE_BRAND_NAME,
												"TireBrand": item.TIRE_BRAND_NAME,
												"Tire Category": item.TIRE_CATEGORY,
												"Catégorie de pneu": item.TIRE_CATEGORY,
												"TireCategory": item.TIRE_CATEGORY,
												"Marque de pneu": item.TIRE_BRAND_NAME,
												"TireBrandID": item.TIRE_BRAND_ID,
												"Material": item.MATERIAL,
												"Tire MFG Part No": item.TIRE_MFG_PART_NUM,
												"N° de pièce du fabricant de pneus": item.TIRE_MFG_PART_NUM,
												"TireMFGPartNo": item.TIRE_MFG_PART_NUM,
												"MSRP": item.MSRP,
												"DealerNet": item.DealerNet,
												"Retails": item.Retails,
												"Profit": item.Profit,
												"TireSize": item.TIRE_SIZE,
												"Model": item.Model,
												"Preview_Markup_Percentage": item.Preview_Markup_Percentage,
												"Live_Markup_Percentage": item.Live_Markup_Percentage,
												"MatDesc": item.MatDesc,
												"localLang": localLang,
												"ModelDesc": ModelDesc,
												"VehicleSeries": VehicleSeries,
												"VModelYear": VModelYear,
												"VehicleSeriesDescp": VehicleSeriesDescp
											});
										});
										that.oTireFitmentJSONModel.setData(that.FitmentToCharac);
										that.oTireFitmentJSONModel.getData().Filters = [];
										that.oTireFitmentJSONModel.getData().Filters.push(that.Filters[0]);
										that.oTireFitmentJSONModel.getData().Filters.push(that.Filters[1]);
										that.oTireFitmentJSONModel.getData().Filters.push(that.Filters[2]);
										that.oTireFitmentJSONModel.getData().Filters.push(that.Filters[3]);
										that.oTireFitmentJSONModel.getData().Filters.push(that.Filters[4]);
										that.oTireFitmentJSONModel.updateBindings(true);

										
											that.getView().byId("idTireSelectionTable").setVisibleRowCount(20);
										
										
										
										that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.oTable.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.FacetFilters.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ui.core.BusyIndicator.hide();
										that.oTireFitmentJSONModel.refresh(true);
										that.oTireFitmentJSONModel.updateBindings(true);
									
										
									}, 2000);

									if (that.msgFlag == true) {
										sap.ui.core.BusyIndicator.hide();
										sap.m.MessageBox.error(
											that.oBundle.getText("MissingPricing"), {
												actions: [sap.m.MessageBox.Action.CLOSE],
												onClose: function (oAction) {
													that.msgFlag = false;
												}
											}
										);
									}

									function decimalFormatter(oDecVal) {
										if (oDecVal != undefined && oDecVal !== null && oDecVal != "" && !isNaN(oDecVal)) {
											var returnVal = parseFloat(oDecVal).toFixed(2);
											if (returnVal == 0.00) {
												return "";
											} else {
												return returnVal;
											}
										} else {
											return "";
										}
									}

								}
							} else {
								sap.ui.core.BusyIndicator.hide();
								sap.m.MessageBox.error(that.oBundle.getText("NoData"), {
									actions: [sap.m.MessageBox.Action.CLOSE],
									onClose: function (oAction) {
										that.oTireFitmentJSONModel.setData({});
										that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										that.oTireFitmentJSONModel.refresh(true);
										that.oTireFitmentJSONModel.updateBindings(true);
									}
								});
							}
						},
						that),
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						// sap.m.MessageBox.error(
						// 	"NO Data found for Fitment"
						// );
					}
				});
			}
			// }//end for routing loop
		},

		colorFormatter: function (oFitval) {
			that.oBundle = that.getView().getModel("i18n").getResourceBundle();
			if (oFitval == that.oBundle.getText("Perfect")) {
				this.getView().byId("cell_Fitment").addStyleClass("colorPerfect"); //
			} else if (oFitval == that.oBundle.getText("Acceptable")) {
				this.getView().byId("cell_Fitment").addStyleClass("colorAcceptable"); //yellow
			} else if (oFitval == that.oBundle.getText("Disconitnued")) {
				this.getView().byId("cell_Fitment").addStyleClass("colorDisconitnued"); //magenta
			}
			return oFitval;
		},

		decimalFormatter: function (oDecVal) {
			if (oDecVal != undefined && oDecVal !== null && oDecVal != "" && !isNaN(oDecVal)) {
				var returnVal = parseFloat(oDecVal).toFixed(2);
				if (returnVal == 0.00) {
					return "";
				} else {
					return returnVal;
				}
			} else {
				return "";
			}
		},

		onCheckPreview: function (oCheck) {
			that.checked = oCheck.getSource();
			that.selectedCheck = oCheck.getParameters("selected").selected;
			sap.ui.core.BusyIndicator.show();
			jQuery.sap.delayedCall(2000, that, function () {
				var Model = that.checked.getParent().getParent().getModel("TireFitmentJSONModel");
				if (Model.getData().results !== undefined) {
					var oData = Model.getData().results;
					var l;

					if (that.selectedCheck == true) {
						for (l = 0; l < oData.length; l++) {
							if (oData[l].DealerNet !== null && oData[l].DealerNet != undefined && oData[l].DealerNet !== "" && oData[l].DealerNet != 0) {
								if (oData[l].Preview_Markup_Percentage != 0 && oData[l].Preview_Markup_Percentage != undefined) {
									oData[l].Retails = Number(oData[l].DealerNet) + (Number(oData[l].DealerNet) * (Number(oData[l].Preview_Markup_Percentage) /
										100));
									oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);
									that.oTireFitmentJSONModel.refresh(true);
									that.oTireFitmentJSONModel.updateBindings(true);
									sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
								} else {
									oData[l].Retails = Number(oData[l].MSRP);
									oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);
									that.oTireFitmentJSONModel.refresh(true);
									that.oTireFitmentJSONModel.updateBindings(true);
									sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
								}
							} else {
								oData[l].Retails = 0.00;
								oData[l].Profit = 0.00;
							}
						}
						sap.ui.core.BusyIndicator.hide();
					} else {
						for (l = 0; l < oData.length; l++) {
							if (oData[l].DealerNet !== null && oData[l].DealerNet != undefined && oData[l].DealerNet !== "" && oData[l].DealerNet != 0) {
								if (oData[l].Live_Markup_Percentage != 0 && oData[l].Live_Markup_Percentage != undefined) {
									oData[l].Retails = Number(oData[l].DealerNet) + (Number(oData[l].DealerNet) * (Number(oData[l].Live_Markup_Percentage) /
										100));
									oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);
									that.oTireFitmentJSONModel.refresh(true);
									that.oTireFitmentJSONModel.updateBindings(true);
									sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
								} else {
									oData[l].Retails = Number(oData[l].MSRP);
									oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);
									that.oTireFitmentJSONModel.refresh(true);
									that.oTireFitmentJSONModel.updateBindings(true);
									sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
								}
							} else {
								oData[l].Retails = 0.00;
								oData[l].Profit = 0.00;
							}
						}
						sap.ui.core.BusyIndicator.hide();
					}
				}
			});
		},

		/*Functions for Table Checkbox options*/
		onCheckPress: function (oCheck) {
			if (oCheck.getParameters("selected").selected == true) {
				that._oViewModel.setProperty("/enableDealerNet", true);
				that._oViewModel.setProperty("/enableProfit", true);
				sap.ushell.components.oTable.getColumns()[7].setVisible(true);
				sap.ushell.components.oTable.getColumns()[8].setVisible(true);
			} else {
				oCheck.getSource().setSelected(false);
				sap.ushell.components.oTable.getColumns()[7].setVisible(false);
				sap.ushell.components.oTable.getColumns()[8].setVisible(false);
				that._oViewModel.setProperty("/enableDealerNet", false);
				that._oViewModel.setProperty("/enableProfit", false);
			}
		},

		onPressBreadCrumb: function (oEvtLink) {
			sap.ui.core.UIComponent.getRouterFor(that).navTo("master");
		},

		NavBackToSearch: function () {
			sap.ushell.components.oTable.getColumns()[7].setVisible(false);
			sap.ushell.components.oTable.getColumns()[8].setVisible(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[0].setSelected(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[1].setSelected(false);
			if (that.oTireFitmentJSONModel != undefined) {
				that.oTireFitmentJSONModel.setData(null);
				that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				sap.ushell.components.oTable.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				sap.ushell.components.FacetFilters.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				that.oTireFitmentJSONModel.updateBindings(true);
			}
			sap.ui.core.UIComponent.getRouterFor(that).navTo("master");
		},

		//Facet Filter logic starts here
		_applyFilter: function (oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var aVBoxItems = this.getView().byId("idVBox").getItems();
			var oTable = aVBoxItems[aVBoxItems.length - 1];
			oTable.getBinding().filter(oFilter);
		},

		handleFacetFilterReset: function (oEvent) {
			var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var aFacetFilterLists = oFacetFilter.getLists();
			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._applyFilter([]);
		},

		handleListClose: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource().getParent();
			this._filterModel(oFacetFilter);
		},

		handleFacetConfirm: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
			/* DEFECT ID : 10207
			 *
			 *
			 * START */
			oEvent.bCancelBubble = true;
			oEvent.preventDefault();
			oEvent.bPreventDefault = true;
			/*DEFECT ID : 10207
			END
			*/
		},

		_filterModel: function (oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
				return oList.getSelectedItems().length;
			});

			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function (oList) {
					return new Filter(oList.getSelectedItems().map(function (oItem) {
						return new Filter(oList.getTitle(), "EQ", oItem.getText());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		},
		//Facet Filter logic ends here

		onRowPress: function (oRowEvt) {
			// Do nothing on empty row
			if (!oRowEvt.getParameter("rowBindingContext")) {
				return;
			}

			var oPath = {};
			var Data = oRowEvt.getSource().getModel("TireFitmentJSONModel").getProperty(oRowEvt.getParameters().rowBindingContext.sPath);

			// TODO: look into a better way to escape chars e.g. using encodeURIComponent()
			oPath.TireFitment = Data.TireFitment;
			oPath.TireSpeed = Data.TireSpeed.replace(/\//gi, "%2F");
			oPath.TireLoad = Data.TireLoad.replace(/\//gi, "%2F");
			oPath.TireBrand = Data.TireBrand;
			oPath.TireCategory = Data.TireCategory;
			oPath.TireBrandID = Data.TireBrandID;
			oPath.Material = Data.Material;
			oPath.TireMFGPartNo = Data.TireMFGPartNo;
			oPath.MSRP = Data.MSRP;
			oPath.DealerNet = Data.DealerNet;
			oPath.Retails = Data.Retails;
			oPath.Profit = Data.Profit;
			oPath.TireSize = Data.TireSize.replace(/\//gi, "%2F");
			oPath.MatDesc = Data.MatDesc.replace(/\//gi, "%2F");
			oPath.Model = Data.Model;
			oPath.Preview_Markup_Percentage = Data.Preview_Markup_Percentage;
			oPath.Live_Markup_Percentage = Data.Live_Markup_Percentage;
			oPath.VIN = VIN;
			oPath.VehicleSeries = VehicleSeries;
			oPath.VModelYear = VModelYear;
			oPath.ModelDesc = ModelDesc;
			oPath.VehicleSeriesDescp = VehicleSeriesDescp;
			sap.ui.core.UIComponent.getRouterFor(that).navTo("tireQuotation", {
				rowData: JSON.stringify(oPath)
			});
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				that.getRouter().navTo("master");
			} else if (_oSelectedScreen == that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == that.oI18nModel.getResourceBundle().getText("ReportError")) {
				that.getRouter().navTo("reportError");
			}
		},
		onExit: function () {
			sap.ushell.components.oTable.getColumns()[7].setVisible(false);
			sap.ushell.components.oTable.getColumns()[8].setVisible(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[0].setSelected(false);
			sap.ushell.components.oTable.getExtension()[0].getContent()[1].setSelected(false);
			if (that.oTireFitmentJSONModel != undefined) {
				that.oTireFitmentJSONModel.setData(null);
				that.getView().setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				sap.ushell.components.oTable.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				sap.ushell.components.FacetFilters.setModel(that.oTireFitmentJSONModel, "TireFitmentJSONModel");
				that.oTireFitmentJSONModel.updateBindings(true);
			}
			that.destroy();
		}
	});
});