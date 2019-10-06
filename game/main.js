function buildGrid(nbCols, nbRows, fctFill) {
    let grid = new Array(nbCols);
    for (let c = 0; c < grid.length; c++) {
        grid[c] = new Array(nbRows);
        for (let r = 0; r < grid[c].length; r++) {
            grid[c][r] = fctFill(c, r);
        }
    }
    return grid;
}

function forEachInGrid(grid, fctItem) {
    for (let c = 0; c < grid.length; c++) {
        let row = grid[c];
        for (let r = 0; r < grid[c].length; r++) {
            let cell = row[r];
            fctItem(cell, c, r);
        }
    }
}

let gridSize = [160, 80];
let grid = buildGrid(gridSize[0], gridSize[1], (c, r) => {
    return Math.round(4 * Math.random()) >= 4 ? 1 : 0;
});

function getSurroundingScore(c, r) {
    let score = 0;
    for (let i = -1; i <= 1; i++) {
        let colIndex = c + i;
        if (colIndex >= 0 && colIndex < gridSize[0]) {
            for (let j = -1; j <= 1; j++) {
                let rowIndex = r + j;
                if (rowIndex >= 0 && rowIndex < gridSize[1] && !(i === 0 && j === 0)) {
                    //Valid cell
                    score += grid[colIndex][rowIndex];
                }
            }
        }
    }
    return score;
}

function gameTick() {
    //Build new grid from old grid state
    let getNewStateAt = (c, r) => {
        //Get 8 Surroundings cells
        let currentCellState = grid[c][r];
        let score = getSurroundingScore(c, r);
        if (currentCellState === 1) {
            //Rule to die
            if (score >= 2 && score <= 3) {
                return 1; //Stay alive
            } else {
                return 0; //Die
            }
        } else {
            //Rule to born
            if (score === 3) {
                return 1; //Born
            }
        }
        return 0;
    };

    let newGrid = buildGrid(gridSize[0], gridSize[1], (c, r) => {
        return getNewStateAt(c, r);
    });
    grid = newGrid;
}

function draw(ctx2d, grid) {
    ctx2d.clearRect(0, 0, 800, 600);
    ctx2d.strokeStyle = "black";
    ctx2d.lineWidth = 1.0;

    let squareSize = 10,
        squareSpacing = 0,
        squarePadding = 1;

    forEachInGrid(grid, (cell, columnIndex, rowIndex) => {
        ctx2d.fillStyle = cell ? "black" : "white";
        let xPos = columnIndex * squareSize + (columnIndex + 1) * squareSpacing;
        let yPos = rowIndex * squareSize + (rowIndex + 1) * squareSpacing;
        ctx2d.fillRect(xPos, yPos, squareSize, squareSize);
        ctx2d.strokeStyle = "darkgrey";
        ctx2d.strokeRect(xPos + squarePadding, yPos + squarePadding, squareSize - 2 * squarePadding, squareSize - 2 * squarePadding);
    });
}

let lastGameTickMs = 0,
    gameTickPeriod = 250,
    gameRunning = true;

let ctx2d = null;

function run() {
    let canvas = document.getElementById("canvas");
    ctx2d = canvas.getContext("2d");

    lastGameTickMs = Date.now();
    draw(ctx2d, grid);
    animateLoop();
}

function animateLoop() {
    let currentMs = Date.now();
    let deltaLastTick = currentMs - lastGameTickMs;
    if (deltaLastTick > gameTickPeriod) {
        lastGameTickMs += gameTickPeriod;
        gameTick();
    }

    draw(ctx2d, grid);

    //Request for next Frame
    if (gameRunning) {
        requestAnimationFrame(animateLoop);
    }
};

window.addEventListener("load", run);