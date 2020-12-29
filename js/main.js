let cells = {};

/** 
 * CreateMaze function, which get the width and the height from the user and a static wall size. 
 * Generate and draw the maze and then pass the information to the cells array.
 */
function createMaze() {
	const values = {
		width: getInput('width', 40)/2,
		height: getInput('height', 40)/2,
		wall: 10,
	}
	
	const maze = new Maze(values);
	maze.generate();
	maze.draw();

	cells = {}
	if (maze.matrixArray.length) {
		cells = maze;
	}
}


/** 
 * SolveMaze function. 
 * Solve the generated maze and draw the path between the points.
 */
function solveMaze() {
	const solver = new mazeSolver(cells);
	solver.solve();
	solver.draw();
	cells = {}
}

/**
 * Get the width and the height from the user.
 * 
 * @param {string} id The id element from the html.
 * @param {number} defVal The default value of the input.
 * @return {number} The new values.
 */
function getInput(id, defVal) {
	const nM = document.getElementById(id);
	// ha nullánál kisebb inputot adunk meg akkor 40x40-re állítja
	if (nM) {
		let nM_val = parseInt(nM.value, 10);
		nM_val = (nM_val > 0) ? nM_val : defVal;
		nM.val = nM_val;
		return nM_val;
	}
	nM.value = defVal;
	return defVal;
}

/**
 * Replace a character at index in a string.
 * 
 * @param {string} str The string to replace.
 * @param {number} i The index.
 * @param {string} newStr The new string which replace the old string.
 * @return {string} The new string at the index location.
 */
function replace(str, i, newStr) {	
	if (i > str.length - 1) {
		return str;
	}
	return str.substr(0, i) + newStr + str.substr(i + 1);
	
}

/**
 * Get the number value at a specific index in a string (0 or 1)
 * 
 * @param {string} str The string to parse.
 * @param {number} i The index.
 * @return {number} The string number value.
 */
function stringValue(str, i) {
	return parseInt(str.charAt(i), 10);
}

/**
 * Get the Start and the End cell locations.
 * 
 * @param {Object} entry Start and end cell coordinates.
 * @param {string} type Start or end cell type.
 * @param {boolean} gate Cell is gate or not.
 */
function getEntryCells( entry, type, gate = false ) {
	if(type  === 'start') {
		return gate ? entry.start.gate : {'x': entry.start.x, 'y': entry.start.y};
	}
	if(type  === 'end') {
		return gate ? entry.end.gate : {'x': entry.end.x, 'y': entry.end.y};
	}
	return false;
}