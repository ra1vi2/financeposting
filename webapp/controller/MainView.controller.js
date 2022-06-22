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
			this.getView().setModel(new JSONModel({
				OrgSdn: ""
			}), "orgsdnmodel");
			this.getView().setModel(new JSONModel({}), "MainData");
			this.getView().setModel(new JSONModel({}), "receiverdata");
		},
		onOriginalSDNVH: function(oEvent) {
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
			oModel.read("/CalculateSet", {
				filters: aFilter,
				success: function(oResponse) {
					this.getView().getModel("orgsdnmodel").setData(oResponse);
				},
				error: function(oError) {
					sap.m.MessageBox.error();
				}
			}.bind(this));
		},
		onSetDocumentDate: function(oEvent) {
			this.byId("idPostingDate").setMinDate(oEvent.getSource().getDateValue());
		},
		onPressAddReceiver: function() {
			var oModel = this.getView().getModel("receiverdata");
			var aData = oModel().getData();
			aData.push({

			});
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
		}

	});
});