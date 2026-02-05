
/**
 * Plots the history of a slave's attribute over time
 * any changes here should be reflected in historyChange.js
 * @param {FC.SlaveState} slave
 */
globalThis.slaveHistoryGraph = function(slave) {
	const frag = new DocumentFragment();

	const history = slave.history;

	if (history.length <= 1) {
		const p = document.createElement('p');
		p.textContent = "No history available, pass some weeks.";
		frag.appendChild(p);
		return frag;
	}
	const plotKeys = Object.keys(history[0]).filter(
		key => key !== 'week' && key !== 'lastAssignment' && key !== 'expenses' && key !== 'reputation_loss'
	);

	const tabBar = new App.UI.Tabs.TabBar("SlaveHistoryGraph");
	const f = new DocumentFragment();
	tabBar.customNode = f;

	for (const plotKey of plotKeys) {
		if (plotKey === "income") {
			tabBar.addTab(plotKey, plotKey, plotData(plotKey, "expenses"));
			continue;
		} else if (plotKey === "reputation") {
			tabBar.addTab(plotKey, plotKey, plotData(plotKey, "reputation_loss"));
			continue;
		} else {
			tabBar.addTab(plotKey, plotKey, plotData(plotKey));
		}
	}

	frag.appendChild(tabBar.render());

	/**
	 *
	 * @param {string} key
	 * @param {string} [keyNeg]
	 * @returns {HTMLDivElement}
	 */
	function plotData(key, keyNeg = null) {
		const container = document.createElement('div');

		const plotWidth = 800;
		const plotHeight = 450;
		const canvas = App.UI.DOM.createCanvas(800, 450);

		const leftPlotMargin = 50;
		const rightPlotMargin = 75;
		const innerPlotMargin = 50;
		container.appendChild(canvas);

		const weeksAssignment = [];
		for (let i = 0; i < history.length; i++) {
			const assignmentKey = Object.keys(globalThis.Job).find(key => globalThis.Job[key] === history[i].lastAssignment);
			weeksAssignment.push({week: history[i].week, assignment: toTitleCase(assignmentKey)});
		}

		const textKey = toTitleCase(key.replace("_", " "));
		const values = history.map(entry => entry[key]);
		const textKeyNeg = keyNeg ? toTitleCase(keyNeg.replace("_", " ")) : "";
		const negValues = keyNeg ? history.map(entry => -Math.abs(entry[keyNeg])) : null;

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, plotWidth, plotHeight);

		// set the font height,cannot access parent
		ctx.font = "16px/1 Helmet,Freesans,sans-serif";
		ctx.fillStyle = 'white';

		// Calculate min and max values for y-axis
		let minVal = Math.min(...values);
		if (negValues) {
			minVal = Math.min(minVal, ...negValues);
		}
		const axisMinInc = 20;
		const minAxis = (Math.floor((minVal -1) / axisMinInc)) * axisMinInc;

		let maxVal = Math.max(...values);
		let axisMaxInc;
		if (maxVal <= 100) {
			axisMaxInc = 20;
		} else if (maxVal <= 2000) {
			axisMaxInc = 100;
		} else {
			axisMaxInc = 1000;
		}
		const maxAxis = (Math.ceil((maxVal+1) / axisMaxInc)) * axisMaxInc;

		const xStep = (plotWidth - leftPlotMargin - rightPlotMargin - 2*innerPlotMargin) / (weeksAssignment.length - 1);
		const yScale = 300 / (maxAxis - minAxis);


		// Draw top y-axis line
		ctx.strokeStyle = 'gray';
		ctx.setLineDash([5, 15]);
		const topAxisMark = Math.round((maxVal+1) / axisMaxInc) * axisMaxInc;
		const yTopPos = 350 - (topAxisMark - minAxis) * yScale;
		ctx.beginPath();
		ctx.moveTo(leftPlotMargin, yTopPos);
		ctx.lineTo(plotWidth - rightPlotMargin, yTopPos);
		ctx.stroke();
		ctx.fillText(topAxisMark.toString(), 10, yTopPos);

		// Draw bottom y-axis line
		ctx.strokeStyle = 'gray';
		ctx.setLineDash([5, 15]);
		const botAxisMark = Math.round((minVal-1) / axisMinInc) * axisMaxInc;
		const yBotPos = 350 - (botAxisMark - minAxis) * yScale;
		ctx.beginPath();
		ctx.moveTo(leftPlotMargin, yBotPos);
		ctx.lineTo(plotWidth - rightPlotMargin, yBotPos);
		ctx.stroke();
		ctx.fillText(botAxisMark.toString(), 10, yBotPos);

		// Draw 0 y-axis line if present
		if (minVal < 0 && maxVal > 0) {
			ctx.strokeStyle = 'gray';
			ctx.setLineDash([5, 15]);
			const yZeroPos = 350 - (0 - minAxis) * yScale;
			ctx.beginPath();
			ctx.moveTo(50, yZeroPos);
			ctx.lineTo(plotWidth  - rightPlotMargin, yZeroPos);
			ctx.stroke();
			ctx.fillText('0', 10, yZeroPos);
		}

		// Set white color for lines and text
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		ctx.setLineDash([]);

		// Draw Box Border Over any tracing lines
		ctx.beginPath();
		ctx.moveTo(leftPlotMargin, 350);
		ctx.lineTo(plotWidth - rightPlotMargin, 350);
		ctx.lineTo(plotWidth - rightPlotMargin, 50);
		ctx.lineTo(leftPlotMargin, 50);
		ctx.lineTo(leftPlotMargin, 350);
		ctx.stroke();

		// Plot data
		ctx.beginPath();
		ctx.moveTo(leftPlotMargin + innerPlotMargin, 350 - (values[0] - minAxis) * yScale);
		for (let i = 0; i < weeksAssignment.length; i++) {
			ctx.lineTo(innerPlotMargin + leftPlotMargin + i * xStep, 350 - (values[i] - minAxis) * yScale);
		}
		ctx.stroke();
		// label x axis (weeks + assignment label)
		ctx.fillStyle = 'white';
		for (let i = 0; i < weeksAssignment.length; i++) {
			ctx.fillText(`Week ${weeksAssignment[i].week.toString()}`, 30 + innerPlotMargin + i * xStep, 370);
			ctx.fillText(weeksAssignment[i].assignment.toString(), 30 +innerPlotMargin + i * xStep, 390);
		}

		// Label y-values for each data point
		ctx.fillStyle = 'yellow';
		ctx.fillText(textKey, 100, 30);
		for (let i = 0; i < values.length; i++) {
			const xPos = innerPlotMargin + leftPlotMargin - 10 + i * xStep;
			const yPos = 350 - (values[i] - minAxis) * yScale;
			ctx.fillText(values[i].toString(), xPos, yPos - 10);
		}

		// Plot negative data if keyNeg is provided
		if (keyNeg) {
			ctx.strokeStyle = 'lightcoral';
			ctx.fillStyle = 'lightcoral';
			ctx.beginPath();
			ctx.moveTo(leftPlotMargin + innerPlotMargin, 350 - (negValues[0] - minAxis) * yScale);
			for (let i = 1; i < weeksAssignment.length; i++) {
				ctx.lineTo(leftPlotMargin + innerPlotMargin + i * xStep, 350 - (negValues[i] - minAxis) * yScale);
			}
			ctx.stroke();
			ctx.fillText(textKeyNeg.toString(), 250, 30);

			// label y-values for each negative data point
			for (let i = 0; i < negValues.length; i++) {
				const xPos = leftPlotMargin + innerPlotMargin - 10 + i * xStep;
				const yPos = 350 - (negValues[i] - minAxis) * yScale;
				ctx.fillText(negValues[i].toString(), xPos, yPos - 10);
			}
		}
		return container;
	}
	return frag;
};
