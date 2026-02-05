/** Show all the markets
 */
App.UI.market = function() {
	const span = document.createElement("span");
	span.id = "slave-markets";
	span.append(App.UI.buySlaves());
	span.append(App.UI.sellSlaves());
	span.append(App.UI.tradeMenials(false));

	const menialTransactionResult = document.createElement("div");
	menialTransactionResult.id = "menial-transaction-result";
	span.append(menialTransactionResult);

	return span;
};
