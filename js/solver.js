/**
 * Initialize the solver and set variables.
 * 
 * @param {Object} maze The maze object.
 */
function mazeSolver(maze) {
	this.maze = maze;
	this.start = false;
	this.finish = false;
	this.solved = false;
	this.path = false;
}

/**
 * The main solve function.
 * Get cells that have connections to other nodes. 
 * Get the connections for every solve node.
 */
mazeSolver.prototype.solve = function() {
	const start = getEntryCells(this.maze.entryNodes, 'start');
	const end = getEntryCells(this.maze.entryNodes, 'end');
	const cells = this.getCells(start, end);
	const node = this.connectCells(cells);
	this.path = this.getPath(node);
}

/**
 * Find and draw the path to the exit
 * 
 * @param {Object} start start of the maze
 * @param {Object} end end of the maze
 * @return {Array} all of the maze cells
 */
mazeSolver.prototype.getCells = function(start, end) {
	const matrixArray = this.maze.matrixArray;
	const cells = [];
	const prev = undefined;
	const rowCount = matrixArray.length;
	
	for (let y = 0; y < rowCount; y++) {
		let rowLength = matrixArray[y].length;
		for (let x = 0; x < rowLength; x++) {

			//ha 1
			if (stringValue(matrixArray[y], x)) {
				continue;
			}

			//  amennyiben a lenti, első feltételek teljesülnek úgy megnézi, hogy az adott koordináta x vagy y helyén milyen string szerepel
			const nswe = {
				'n': (0 < y) && stringValue(matrixArray[y - 1], x),
				'w': (0 < x) && stringValue(matrixArray[y], (x - 1)),
				's': (rowCount > y) && stringValue(matrixArray[y + 1], x),
				'e': (rowLength > x) && stringValue(matrixArray[y], (x + 1))
			}

			if (start && end) {
				if ((x === start.x) && (y === start.y)) {
					this.start = cells.length;
					cells.push({ x, y, nswe, prev });
					continue;
				}

				if ((x === end.x) && (y === end.y)) {
					this.finish = cells.length;
					cells.push({ x, y, nswe, prev });
					continue;
				}
			}

			// left or right
			if (nswe['w'] || nswe['e']) {
				// left or right direction
				if (!nswe['w'] || !nswe['e']) {
					cells.push({ x, y, nswe, prev });
					continue;
				} else {
					// up or down direction
					if ((!nswe['n'] && nswe['s']) || (nswe['n'] && !nswe['s'])) {
						cells.push({ x, y, nswe, prev });
						continue;
					}
				}
			} else {
				// all directions
				if (!nswe['n'] && !nswe['s'] && !nswe['w'] && !nswe['e']) {
					cells.push({ x, y, nswe, prev });
					continue;
				} else {
					// up or down direction possible.
					if ((!nswe['n'] && nswe['s']) || (nswe['n'] && !nswe['s'])) {
						cells.push({ x, y, nswe, prev });
						continue;
					}
				}
			}
		}
	}
	return cells;
}

/**
 * Connect cells to their neighbours
 * 
 * @param {Array} cells Array of cells
 * @return {Array} Array of connected cells.
 */
mazeSolver.prototype.connectCells = function(cells) {
	const cell = {};
	const cells_length = cells.length;

	// connect
	for (let i = 0; i < cells_length; i++) {
		cells[i]['marked'] = {};
		let x = cells[i]['x'];

		// ha van már benne x a cell-ben és ha az nswe tulajdonságban az n helyén nem 1 van
		if (!cells[i]['nswe']['n'] && cell.hasOwnProperty(x)) {
			cells[i]['marked']['n'] = cell[x];
			if (cells.hasOwnProperty(cell[x])) {
				cells[cell[x]]['marked']['s'] = i;
				delete cell[x];
			}
		}

		//ha az nswe tulajdonságban az s helyén nem 1 van
		if (!cells[i]['nswe']['s']) {
			cell[x] = i;
		}

		if (!cells[i]['nswe']['w']) {
			cells[i]['marked']['w'] = i - 1;
		}

		if (!cells[i]['nswe']['e']) {
			cells[i]['marked']['e'] = i + 1;
		}

	}
	return cells;
}

/**
 * Get the path between the start and the end.
 * 
 * @param {Array} cells Array of the cells.
 * @return {Array} Array of cells.
 */
mazeSolver.prototype.getPath = function(cells) {
	this.solved = false;
	let start = 0;
	let end = cells.length - 1;
	if ((this.start !== false) && (this.finish !== false)) {
		start = this.start;
		end = this.finish;
	}

	let tempHelp = 0;
	let cell = false;
	let lastPlace = false;
	const multiple = [];
	const index = { 'n': 's', 's': 'n', 'w': 'e', 'e': 'w' };

	while (this.solved === false) {
		if (!cell) {
			tempHelp = start;
			cell = cells[tempHelp];
		}

		if (tempHelp === end) {
			this.solved = true;
			break
		}
		
		// The reduce() method executes a reducer function (that you provide) on each element of the array, resulting in single output value.
		cell['count'] = 4 - (Object.keys(cell['nswe'])
			.map(key => !cell['nswe'][key] ? 0 : 1)
			.reduce((a, b) => a + b, 0));

		if (cell.count > 2) {
			if (multiple.indexOf(tempHelp) ===  -1) {
				multiple.push(tempHelp);
			}
		}

		if (lastPlace !== false) {
			cell['nswe'][lastPlace] = 1;
			cell.count--;
			cells[tempHelp] = cell;
		}

		if (cell.count === 0) {
			lastPlace = false;
			// back to start
			if (!multiple.length) {
				tempHelp = start;
				cell = cells[start];
				continue;
			}
			//  back to multiple directions cell
			tempHelp = multiple.pop();
			cell = cells[tempHelp];
			if (cell.count > 1) {
				multiple.push(tempHelp);
			}
			continue;
		}
		//elkezdi feltérképezni az labirintust
		//amennyiben egy felé lehet menni úgy arra megy, amennyiben több felé, úgy végignézi minden lehetséges útvonalat majd ha elér egy olyan helyre ahonnan nem lehet tovább menni, visszaugrik és nézi a következő lehetséges útvonalat
		let dirs = Object.keys(cell['nswe']).filter(key => !cell['nswe'][key] ? true : false);
		let dir = dirs[Math.floor(Math.random() * dirs.length)];

		if (cell.count >= 1) {
			cell.count--;
			lastPlace = index[dir];
			cell['nswe'][dir] = 1;
			cell['previous'] = dir;
			cells[tempHelp] = cell;
		}

		if (cell['marked'].hasOwnProperty(dir)) {
			tempHelp = cell['marked'][dir];
			cell = cells[tempHelp];
		} else {
			break;
		}
	}
	return cells;
}

/**
 * Draw the path between the start and the end.
 */
mazeSolver.prototype.draw = function() {
	const cells = this.path;
	const wall = this.maze.wall;
	const canvas = document.getElementById('maze');
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = this.maze.solveColor;

	let start = 0;
	let end = cells.length - 1;
	let marked = false
	let cell = false;
	let tempHelp;

	// check if gate exist
	const gate = (this.start !== false) && (this.finish !== false);
	if (gate) {
		start = this.start;
		end = this.finish;
		const entryGate = getEntryCells(this.maze.entryNodes, 'start', true);
		ctx.fillRect((entryGate.x * wall), (entryGate.y * wall), wall, wall);
	}

	while (marked === false) {
		if (!cell) {
			cell = cells[start];
		}

		if (tempHelp === end) {
			marked = true;
			break
		}
		
		tempHelp = cell.marked[cell.previous];
		let marked_cell = cells[tempHelp];

		// west és east irányok amelyek meg vannak jelölve
		if (['w', 'e'].indexOf(cell.previous) !== -1) {
			let start = cell.x
			let toX = ((marked_cell.x - start) * wall) + wall;
			if ('w' === cell.previous) {
				start = marked_cell.x
				toX = ((cell.x - marked_cell.x) * wall) + wall;
			}
			ctx.fillRect((start * wall), (cell.y * wall), toX, wall);
		}

		// north és south irányok amelyek meg vannak jelölve
		if (['n', 's'].indexOf(cell.previous) !== -1) {
			let start = cell.y;
			let toY = ((marked_cell.y - start) * wall) + wall;
			if ('n' === cell.previous) {
				start = marked_cell.y
				toY = ((cell.y - marked_cell.y) * wall) + wall;
			}
			ctx.fillRect((cell.x * wall), (start * wall), wall, toY);
		}
		cell = cells[tempHelp];
	}

	if (gate) {
		const exitGate = getEntryCells(this.maze.entryNodes, 'end', true);
		ctx.fillRect((exitGate.x * wall), (exitGate.y * wall), wall, wall);
	}
}