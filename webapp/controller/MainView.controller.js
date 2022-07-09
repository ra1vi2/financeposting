sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./MainBO",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(Controller, BO, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("comfinanceposting.controller.MainView", {
		onInit: function() {
			this.getView().setModel(new JSONModel({}), "OriginalSDNFilter");
			this.getView().setModel(new JSONModel({}), "FcnJonVHFilter");
			this.stdDocTable = this.byId("idOriginalStdDocTable");
			this.getView().setModel(new JSONModel([{
				OrgSdn: ""
			}]), "orgsdnmodel");
			this.getView().setModel(new JSONModel({
				DocDate: new Date(),
				PostingDate: new Date(),
				SendToSABRAS: true
			}), "MainData");
			this.getView().setModel(new JSONModel([]), "receiverdata");
			this.getView().setModel(new JSONModel({
				totalQty: 0,
				totalAmount: 0
			}), "totalData");

		},
		onOriginalSDNVH: function(oEvent) {
			this.getView().getModel("OriginalSDNFilter").setData({});
			var globalThis = this;
			var aFilter = [];
			var oData = this.getView().getModel("OriginalSDNFilter").getData();
			aFilter.push(new Filter("OrgSdn", FilterOperator.EQ, oData.OrgSdn));
			this.currentOriginalSDN = oEvent.getSource();
			BO.onInputVH(
				oEvent.getSource(),
				BO.createColumnModel("OriginalSDN"),
				this.getView().getModel(),
				"comfinanceposting.fragments.OriginalSDNVH",
				globalThis,
				"/OrginialSDNVHSet",
				aFilter
			);
		},
		onOriginalSDNVHOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			BO.onValueHelpOkPress(aTokens, this.currentOriginalSDN, this);
			this.selectedOrgSDN = aTokens[0].getKey();

			var oModel = this.getView().getModel("orgsdnmodel");
			var aData = oModel.getData();
			aData[0].OrgSdn = this.selectedOrgSDN;
			oModel.setData(aData);

			var selectedObject = oEvent.getSource()._oSelectedItems.items;
			var data = selectedObject["OrginialSDNVHSet('" + this.selectedOrgSDN + "')"];
			var aSelectedData = [];
			aSelectedData.push(data);
			this.getView().setModel(new JSONModel(aSelectedData), "selectedOrgSDN");
		},
		onValueHelpCancelPress: function() {
			BO.onValueHelpCancelPress(this);
		},
		onValueHelpAfterClose: function() {
			BO.onValueHelpAfterClose(this);
		},
		onFCNJonVH: function(oEvent) {
			var bldat = this.getView().getModel("MainData").getData().DocDate;
			var posnr = this.getView().getModel("selectedOrgSDN").getData()[0].Posnr;
			this.getView().getModel("FcnJonVHFilter").setData({
				Bldat : bldat,
				Posnr : posnr
			});
			var globalThis = this;
			
			//get current index
			var sPath = oEvent.getSource().getParent().getBindingContext("receiverdata").getPath();
			this.currentRecFcnJonindex = sPath.charAt(sPath.length - 1);
			
			
			var aFilter = [];
			//var oData = this.getView().getModel("FcnJonVHFilter").getData();
			//aFilter.push(new Filter("Bldat", FilterOperator.EQ, bldat));
			//aFilter.push(new Filter("Posnr", FilterOperator.EQ, posnr));
			this.currentFcnJon = oEvent.getSource();
			BO.onInputVH(
				oEvent.getSource(),
				BO.createColumnModel("FcnJonVH"),
				this.getView().getModel(),
				"comfinanceposting.fragments.FcnJonVH",
				globalThis,
				"/FCNJONVHSet",
				aFilter
			);
		},
		onFcnVHOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			BO.onValueHelpOkPress(aTokens, this.currentFcnJon, this);
			this.selectedFcnJon = aTokens[0].getKey();

			var oModel = this.getView().getModel("receiverdata");
			var aData = oModel.getData();
			aData[this.currentRecFcnJonindex].FcnJon = this.selectedFcnJon;
			
			var selectedObject = oEvent.getSource()._oSelectedItems.items;
			var data = selectedObject["FCNJONVHSet('" + this.selectedFcnJon + "')"];
			aData[this.currentRecFcnJonindex] = data;
			oModel.setData(aData);
		//	var aSelectedData = [];
		//	aSelectedData.push(data);
		//	this.getView().setModel(new JSONModel(aSelectedData), "selectedOrgSDN");
		},
		onPressCalculate: function() {
			var oModel = this.getView().getModel();
			var aFilter = [];
			var that = this;
			aFilter.push(new Filter("OrgSdn", FilterOperator.EQ, this.selectedOrgSDN));
			oModel.read("/CalculateSet", {
				filters: aFilter,
				success: function(oResponse) {
					that.getView().getModel("orgsdnmodel").setData(oResponse.results);
					var oModelRec = that.getView().getModel("selectedOrgSDN");
					var oData = oModelRec.getData();
					oData[0].SendAmt = oResponse.results[0].SendAmt;
					oData[0].SendQty = oResponse.results[0].SendQty;
					oModelRec.setData(oData);
				},
				error: function(oError) {
					sap.m.MessageBox.error();
				}
			});
		},
		onSetDocumentDate: function(oEvent) {
			this.byId("idPostingDate").setMinDate(oEvent.getSource().getDateValue());
		},
		onPressAddReceiver: function() {
			var oModel = this.getView().getModel("receiverdata");
			var aData = oModel.getData() || [];
			aData.push({
				RecFcnJon: "",
				RecQty: "0",
				SendAmt: "0", //please provide in odata
				OrgSdn : this.selectedOrgSDN
			});
			oModel.setData(aData);
		},
		onSearchOriginalSDN: function() {
			this._filterVHTable("OriginalSDNFilter", "/OrginialSDNVHSet");
		},
		onSearchFcnJon:function(){
			this._filterVHTable("FcnJonVHFilter", "/FCNJONVHSet");
		},
		_filterVHTable: function(sFilterModel, sEntitySet) {
			var aFilter = [];
			var oFilterQueryData = this.getView().getModel(sFilterModel).getData();

			if (oFilterQueryData) {
				aFilter = BO.getVHFilterQuery(oFilterQueryData);
				//this._oValueHelpDialog.setBusy(true);
				this._oValueHelpDialog.getTableAsync().then(
					function(oTable) {
						oTable.setBusy(true);
						if (oTable.bindRows) {
							oTable.bindAggregation("rows", {
								path: sEntitySet,
								filters: aFilter
							});
						}
						this._oValueHelpDialog.update();
						oTable.setBusy(false);
					}.bind(this)
				);
			}
		},
		onChangeAmount: function() {
			this.updateQtyAmount();
		},
		onChangeQty: function() {
			this.updateQtyAmount();
		},
		updateQtyAmount: function() {
			var oModel = this.getView().getModel("receiverdata");
			var aData = oModel.getData();
			var totalQty = 0,
				totalAmount = 0;
			aData.forEach(function(item) {
				totalQty = parseFloat(totalQty) + parseFloat(item.SendQty);
				totalAmount = parseFloat(totalAmount) + parseFloat(item.SendAmt);
			});
			this.getView().getModel("totalData").setData({
				totalQty: totalQty,
				totalAmount: totalAmount
			});
		},
		onPressPostDocument: function() {
			var oModel = this.getView().getModel();
			var oRecModel = this.getView().getModel("receiverdata");
			var aRecData = oRecModel.getData();

			var oMainModel = this.getView().getModel("MainData");
			var aMainData = oMainModel.getData();

			var oSenderModel = this.getView().getModel("selectedOrgSDN");
			var aSenderData = oSenderModel.getData();

			var oData = {
				Bldat: aMainData.DocDate,
				FcnJon: aSenderData[0].FcnJon,
				Budat: aMainData.PostingDate,
				IcnJon: aSenderData[0].IcnJon,
				SendToSabrs: aMainData.SendToSABRAS,
				KeyOp: aSenderData[0].KeyOp,
				OrgSdn: this.selectedOrgSDN,
				Shop: aSenderData[0].Shop,
				Ts: aSenderData[0].Ts,
				Tsd: aSenderData[0].Tsd,
				Posnr: aSenderData[0].Posnr,
				SendAmt: aSenderData[0].SendAmt,
				KeySDN: aRecData
			};

			//var totalData = this.getView().getModel("totalData").getData();

			//if(parseFloat(totalData.totalQty) > )

			oModel.create("/PostHeaderSet", oData, {
				success: function(oResponse) {
					sap.m.MessageBox.success("Data has been Posted");
				},
				error: function(oError) {
					sap.m.MessageBox.error();
				}
			});
		}

	});
});