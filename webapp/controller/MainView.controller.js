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
			this.stdDocTable = this.byId("idOriginalStdDocTable");
			this.getView().setModel(new JSONModel([{
				OrgSdn: ""
			}]), "orgsdnmodel");
			this.getView().setModel(new JSONModel({
				DocDate : new Date(),
				PostingDate : new Date(),
				SendToSABRAS : true
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
			this.getView().setModel(new JSONModel(selectedObject), "selectedOrgSDN");
		},
		onValueHelpCancelPress: function() {
			BO.onValueHelpCancelPress(this);
		},
		onValueHelpAfterClose: function() {
			BO.onValueHelpAfterClose(this);
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
					oData.SendAmt = oResponse.results[0].SendAmt;
					oData.SendQty = oResponse.results[0].SendQty;
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
				SendAmt: "0" //please provide in odata
			});
			oModel.setData(aData);
		},
		onSearchOriginalSDN: function() {
			this._filterVHTable("OriginalSDNFilter", "/OrginialSDNVHSet");
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
			var oModel = this.getView().getModel("receiverdata");
			var aData = oModel.getData();

			var totalData = this.getView().getModel("totalData").getData();

			//if(parseFloat(totalData.totalQty) > )

			oModel.create("/PostDocumentSet", aData, {
				success: function(oResponse) {
					sap.m.MessageBox.success("Data has been Posted");
				},
				error: function(oError) {
					sap.m.MessageBox.error();
				}
			}.bind(this));
		}

	});
});