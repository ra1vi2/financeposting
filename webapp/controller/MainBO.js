sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/m/Token"
		//,"../utils/Utility"
	],
	function(JSONModel, Filter, FilterOperator, Fragment, Token) {
		"use strict";
		return {
			validate: function(total, orgSdn) {
				var totalData = total.getData();
				orgSDNData = orgSdn.getData();
				if (totalData.totalQty > orgSDNData[0].AvailQty) {
					return true;
				} else {
					return false;
				}
			},
			onInputVH: function(
				oControl,
				ColModel,
				oDataModel,
				sFragment,
				globalThis,
				sEntity,
				aFilter
			) {
				var aCols = ColModel.getData().cols;

				Fragment.load({
					name: sFragment,
					controller: globalThis
				}).then(
					function name(oFragment) {
						globalThis._oValueHelpDialog = oFragment;
						globalThis.getView().addDependent(globalThis._oValueHelpDialog);

						globalThis._oValueHelpDialog.getTableAsync().then(
							function(oTable) {
								oTable.setModel(oDataModel);
								oTable.setModel(ColModel, "columns");

								/*	oTable.bindAggregation("rows", {
										path: sEntity,
										filters: aFilter
									});*/

								if (oTable.bindItems) {
									oTable.bindAggregation("items", sEntity, function() {
										return new sap.m.ColumnListItem({
											cells: aCols.map(function(column) {
												return new sap.m.Label({
													text: "{" + column.template + "}"
												});
											})
										});
									});
								}
								globalThis._oValueHelpDialog.update();
							}.bind(globalThis)
						);

						var oToken = new Token();
						oToken.setKey(oControl.getSelectedKey());
						oToken.setText(oControl.getValue());
						globalThis._oValueHelpDialog.setTokens([oToken]);
						globalThis._oValueHelpDialog.open();
					}.bind(globalThis)
				);
			},

			onValueHelpOkPress: function(aTokens, oControl, globalThis) {
				if (aTokens.length > 0) {
					oControl.setSelectedKey(aTokens[0].getKey());
					oControl.setValue(aTokens[0].getKey());

				}
				globalThis._oValueHelpDialog.close();
			},

			onValueHelpCancelPress: function(globalThis) {
				globalThis._oValueHelpDialog.close();
			},

			onValueHelpAfterClose: function(globalThis) {
				globalThis._oValueHelpDialog.destroy();
			},
			getVHFilterQuery: function(oFilterQueryData) {
				var aQueryKeys = Object.keys(oFilterQueryData);
				var aFilter = [];
				aQueryKeys.forEach((key, index) => {
					if (oFilterQueryData[key]) {
						aFilter = this._updateFilterArray(
							aFilter,
							key,
							oFilterQueryData[key]
						);
					}
				});
				return aFilter;
			},
			_updateFilterArray(aFilter, sProperty, sValue) {
				aFilter.push(new Filter(sProperty, FilterOperator.EQ, sValue));
				return aFilter;
			},

			createColumnModel: function(sRequestedVH) {
				if (sRequestedVH === "OriginalSDN") {
					return new JSONModel({
						cols: [{
							label: "Original SDN",
							template: "OrgSdn"
						}, {
							label: "FcnJon",
							template: "FcnJon"
						}, {
							label: "IcnJon",
							template: "IcnJon"
						}, {
							label: "KeyOp",
							template: "KeyOp"
						}, {
							label: "Shop",
							template: "Shop"
						}, {
							label: "Ts",
							template: "Ts"
						}, {
							label: "Tsd",
							template: "Tsd"
						}, {
							label: "WBS Element",
							template: "Posnr"
						}]
					});
				}
				if (sRequestedVH === "FcnJonVH") {
					return new JSONModel({
						cols: [{
							label: "RecFcnJon",
							template: "RecFcnJon"
						}, {
							label: "RecIcnJon",
							template: "RecIcnJon"
						}, {
							label: "RecKeyOp",
							template: "RecKeyOp"
						}, {
							label: "RecShop",
							template: "RecShop"
						}, {
							label: "RecTs",
							template: "RecTs"
						}, {
							label: "RecTsd",
							template: "RecTsd"
						}, {
							label: "WBS Element",
							template: "RecPosnr"
						}, {
							label: "SDN",
							template: "RecSdn"
						}]
					});
				}
			}
		};

	});