let y = 0;
let x = 0;

/**
 * Initialize Maze and set variables.
 * 
 * @param {string} args Arguments from the main.js.
 */
function Maze(args) {
	const defs = {
		width: getInput('width', 40)/2,
		height: getInput('height', 40)/2,
		wall: 10,
		color: '#000000',
		backgroundColor: '#FFFFFF',
		solveColor: 'royalblue',
		entryType: 'maze',
	}
	// The Object.assign() method copies all enumerable own properties from one or more source objects to a target object. It returns the target object.
	const values = Object.assign({}, defs, args);

	this.width = values['width'];
	if(!Number.isInteger(this.width)) {
		this.width = this.width +0.5;
	} 
	this.height = values['height'];
	if(!Number.isInteger(this.height)) {
		this.height = this.height +0.5;
	} 
	this.wall = values['wall'];
	this.color = values['color'];
	this.backgroundColor = values['backgroundColor'];
	this.solveColor = values['solveColor'];
	this.entryNodes = this.getEntryCells(values['entryType']);
	this.matrixArray = [];
}

/**
 * Generate the cells, configurate the maze and finally generate the matrix of the maze.
 */
Maze.prototype.generate = function() {
	let cells = this.generateCells();
	cells = this.configMaze(cells);
	this.generateMatrix(cells);
}

/**
 * Generate the cells using the width and the height of the maze.
 * 
 * @return {string} The cells array with the 0 or 1 coordinates.
 */
Maze.prototype.generateCells = function() {
	const count = this.width * this.height;
	let cells = [];
	// initialize the cells array with 0 or 1 coordinates
	for (let i = 0; i < count; i++) {
		// visited, nswe
		cells[i] = "01111";
	}
	return cells;
}

/**
 * Generate the complete maze in a matrix where 1 is a wall and 0 is a corridor.
 * 
 * @param {Object} cells The cells of the matrix full of 0 or 1.
 */
Maze.prototype.generateMatrix = function(cells) {
	const maze = this.width * this.height;
	let rowA = '';
	let rowB = '';

	// generate the whole maze
	for (let i = 0; i < maze; i++) {
		rowA += !rowA.length ? '1' : '';
		rowB += !rowB.length ? '1' : '';
		
		// 1 esetén belép
		if (stringValue(cells[i], 1)) {
			rowA += '11';
			// 1 esetén belép
			if (stringValue(cells[i], 4)) {
				rowB += '01';
			} else {
				rowB += '00';
			}
		} else {
			// The hasOwnProperty() method returns a boolean indicating whether the object has the specified property as its own property (as opposed to inheriting it).
			let aboveA = cells.hasOwnProperty(i - this.width);
			let aboveB = aboveA && stringValue(cells[i - this.width], 4);
			let nextA = cells.hasOwnProperty(i + 1);
			let nextB = nextA && stringValue(cells[i + 1], 1);
			if (stringValue(cells[i], 4)) {
				rowA += '01';
				rowB += '01';
			} else if (nextB || aboveB) {
				rowA += '01';
				rowB += '00';
			} else {
				rowA += '00';
				rowB += '00';
			}
		}
		if (((i + 1) % this.width) === 0) {
			this.matrixArray.push(rowA);
			this.matrixArray.push(rowB);
			rowA = '';
			rowB = '';
		}
	}

	// closing row
	this.matrixArray.push('1'.repeat((this.width *2) + 1));
}

/**
 * Configure the maze.
 * 
 * @param {Object} cells The cells of the matrix full of 0 or 1.
 * @return {Object} The parsed maze.
 */
Maze.prototype.configMaze = function(cells) {
	const maze = cells.length;
	const index = { 'n': 1, 's': 2, 'w': 3, 'e': 4, };
	const index2 = { 'n': 2, 's': 1, 'w': 4, 'e': 3 };
	let moveCells = [];
	let marked = 0;
	let pos = parseInt(Math.floor(Math.random() * cells.length), 10);
	
	// start cell marked.
	cells[pos] = replace(cells[pos], 0, 1);

	while ((maze - 1) > marked ) {
		let next = this.getCellNeighbour(pos);
		// The Object.keys() method returns an array of a given object's own enumerable property names, iterated in the same order that a normal loop would.
		// amennyiben 1-sel kezdődik a string, azaz meg van már jelölve akkor azt az irányt kidobja
		let dir = Object.keys(next).filter(function(key) {
			return (-1 !== next[key]) && !stringValue(this[next[key]], 0);
		}, cells);

		if (dir.length) {
			++marked;
			if (1 < dir.length) {
				moveCells.push(pos);
			}
			//visszaadja azt, hogy N W S E és lecseréli a poziciókat úgy, hogy az index tömbbe belerakja a kiválasztott irányt és ott pedig kiválasztja az irányhoz tartozó számot, majd a cella tömbben lecseréli a visszaadott szám helyén lévő 1-est 0-ra
			let direction = dir[Math.floor(Math.random() * dir.length)];

			// current pos
			cells[pos] = replace(cells[pos], index[direction], 0);

			// new pos
			pos = next[direction];
			
			// next pos
			cells[pos] = replace(cells[pos], index2[direction], 0);
			cells[pos] = replace(cells[pos], 0, 1);
		} else {
			if (!moveCells.length) {
				break;
			}
			pos = moveCells.pop();
		}
	}

	return cells;
}

/**
 * Get the entrance and the exit of the maze.
 * 
 * @param {string} type Start or end of the maze.
 * @return {Object} Start and end coordinates.
 */
Maze.prototype.getEntryCells = function(type) {
	let entryNodes = {};

	// set the end cells of x and y coordinates in terms of width and height
	if(this.width % 2 == 0 && this.height % 2 == 0) {
		x = ((this.width *2 ) + 1) - 2;
		y = ((this.height *2) + 1) - 2;
	} else if(this.width % 2 == 0 && this.height % 2 !== 0) {
		x = ((this.width *2 ) + 1);
		y = ((this.height *2) + 1) - 1;
	} else if(this.width % 2 !== 0 && this.height % 2 == 0) {
		x = ((this.width *2 ) + 1);
		y = ((this.height *2) + 1) - 1;
	} else if(this.width % 2 !== 0 && this.height % 2 !== 0) {
		x = ((this.width *2 ) + 1);
		y = ((this.height *2) + 1) - 2;
	}

	// set the start and the end of the labyrinth in terms of width and height
	if(this.width % 2 == 0 && this.height % 2 == 0) {
		entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
		entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x+1, 'y': y } };
	} else if(this.width % 2 == 0 && this.height % 2 !== 0 ) {
		if(Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x-1, 'y': y-1 } };
		} else if(!Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x-1, 'y': y } };
		}
	} else if(this.width % 2 !== 0 && this.height % 2 == 0) {
		if(Number.isInteger(this.width)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x-1, 'y': y-1 } };
		} else if(!Number.isInteger(this.width)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x, 'y': y-1 } };
		}
	} else if(this.width % 2 !== 0 && this.height % 2 !== 0) {
		if(Number.isInteger(this.width) && Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 0, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x-1, 'y': y } };
		} else if(!Number.isInteger(this.width) && !Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x, 'y': y+1 } };
		} else if(Number.isInteger(this.width) && !Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x-1, 'y': y+1 } };
		} else if(!Number.isInteger(this.width) && Number.isInteger(this.height)) {
			entryNodes.start = { 'x': 1, 'y': 1, 'gate': { 'x': 0, 'y': 1 } };
			entryNodes.end = { 'x': x, 'y': y, 'gate': { 'x': x, 'y': y } };
		}
	}

	return entryNodes;
}

/**
 * Get the neighbours of the cells
 * 
 * @param {number} position Position of surrounding cells.
 */
Maze.prototype.getCellNeighbour = function(position) {
	return {
		'n': ((position - this.width) >= 0) ? position - this.width : -1,
		'w': ((position > 0) && ((position % this.width) !== 0)) ? position - 1 : -1,
		's': ((this.width * this.height) > (position + this.width)) ? position + this.width : -1,
		'e': (((position + 1) % this.width) !== 0) ? position + 1 : -1,
	};
}

/**
 * Initialize and draw the maze with all the options.
 */
Maze.prototype.draw = function() {
	const canvas = document.getElementById('maze');
	canvas.width = ((this.width * 2) + 1) * this.wall;
	canvas.height = ((this.height * 2) + 1) * this.wall;

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = this.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = this.color;

	const row = this.matrixArray.length;
	const entryGate = getEntryCells(this.entryNodes, 'start', true);
	const exitGate = getEntryCells(this.entryNodes, 'end', true);

	// draw the whole maze
	for (let i = 0; i < row; i++) {
		let row_length = this.matrixArray[i].length;
		for (let j = 0; j < row_length; j++) {
			if (entryGate && exitGate) {
				if ((j === entryGate.x) && (i === entryGate.y)) {
					continue;
				}
				if ((j === exitGate.x) && (i === exitGate.y)) {
					continue;
				}
			}
			let s = parseInt(this.matrixArray[i].charAt(j), 10);
			if (s) {
				ctx.fillRect((j * this.wall), (i * this.wall), this.wall, this.wall);
			}
		}
	}
}