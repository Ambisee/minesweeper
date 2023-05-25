// Retrieving HTML
const flagCount = document.querySelector('#flag-count');
const difficultyLevel = document.querySelector('#difficulty-level');
const mineCount = document.querySelector('#mine-count');
const canvas = document.querySelector('#game-board');
const resetButton = document.querySelector("#restart");

// -- Game board and settings -- //
const ctx = canvas.getContext('2d');
const COVERED_COLOR = 'rgba(80, 80, 80, 1)';
const UNCOVERED_COLOR = 'rgba(115, 115, 115, 1)';
const COLORS = ['red', 'blue', '#008211', '#472900', 'purple', 'cyan', 'yellow', 'magenta'];
var numberOfTiles = 25;
var numberOfMines = 70;
const GAP = 1;
let edge = (canvas.width - GAP * numberOfTiles) / numberOfTiles;

let gameTracker = {
    tiles: [], // 2D Array to store tiles with indices as rows and columns
    openedTiles: 0, // Store the bomb tiles
    flagCounterElement: flagCount, // DOM Element that displays the number of flags visible
}

// Initial drawing settings
ctx.font = 'bold 20px monospace';
ctx.textAlign = 'center';
ctx.textBaseLine = 'middle';
ctx.save();

// -- Classes -- //
// Tile Object
class Tile {
    // -- Constructor -- //
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.value = 0;
        this.opened = false;
        this.bomb = false;
        this.flagged = false;
    }
    // -- Methods -- //
    
    // Setter
    incrementValue() {
        this.value += 1
    }

    setBomb() {
        this.bomb = true;
    }

    // Draws intialized tile
    drawInit(context, edge, gap) {
        context.fillStyle = COVERED_COLOR;
        context.fillRect(this.col * (edge + gap) + (gap / 2), this.row * (edge + gap), edge, edge);
    }

    // Draws the opened tile
    drawOpen(context, edge, gap) {
        // Draws the opened square
        context.fillStyle = UNCOVERED_COLOR;
        context.fillRect(this.col * (edge + gap) + (gap / 2), this.row * (edge + gap), edge, edge);

        // Draws text for the bomb
        if (this.bomb) {
            context.fillStyle = COLORS[0];
            context.fillText('X', this.col * (gap + edge) + (edge / 2), this.row * (gap + edge) + (18 * edge / 20), edge)
            return;
        }
        
        // Draws text for values more than 0
        if (this.value > 0) {
            context.fillStyle = COLORS[this.value];
            context.fillText(this.value, this.col * (gap + edge) + (edge / 2), this.row * (gap + edge) + (18 * edge / 20), edge);
            return;
        }
    }

    // Sets the tile as flagged
    setFlag(context, gameTracker, edge, gap) {
        if (this.opened) {return;}
        if (!(this.flagged)) {
            context.fillStyle = '#19ff05';
            context.fillText('?', this.col * (gap + edge) + (edge / 2), this.row * (gap + edge) + (18 * edge / 20), edge);
            gameTracker.flagCounterElement.innerText = Number.parseInt(gameTracker.flagCounterElement.innerText) + 1;
        } else {
            context.clearRect(this.col * (edge + gap) + (gap / 2), this.row * (edge + gap), edge, edge);
            this.drawInit(context, edge, gap);
            gameTracker.flagCounterElement.innerText = Number.parseInt(gameTracker.flagCounterElement.innerText) - 1;
        }
        this.flagged = !this.flagged;
    }

    // Reveals the tile
    reveal(context, gameTracker, edge, gap, sqrNum) {
        // Checks if the tile to be revealed is opened or flag
        if (this.opened || this.flagged) {return;}

        // Reveals the clicked tile
        this.opened = true;
        this.drawOpen(context, edge, gap);
        gameTracker.openedTiles += 1;

        // Checks to see if player has opened all non-bomb tiles
        if (gameTracker.openedTiles == numberOfTiles**2 - numberOfMines) {
            alert("You have won.");
            return;
        }

        // Checks to see if a bomb tile has been pressed
        if (this.bomb) {
            for (let q = 0; q < sqrNum; q++) {
                for (let r = 0; r < sqrNum; r++) {
                    // If bomb is pressed, reveal all tiles
                    if (!(gameTracker.tiles[q][r].opened)) {gameTracker.tiles[q][r].opened = true; gameTracker.tiles[q][r].drawOpen(context, edge, gap);}
                }
            }
            return;
        }

        // Checks to see if an empty tile has been pressed
        if (this.value == 0) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    // If out of range, continue the loop
                    if ((this.row + i >= sqrNum) || (this.row + i < 0) || (this.col + j >= sqrNum) || (this.col + j < 0)) {continue;}
                    // If adjacent tiles exist and is not a mine, reveal it
                    if (!(gameTracker.tiles[this.row + i][this.col + j].bomb)) {      
                        gameTracker.tiles[this.row + i][this.col + j].reveal(context, gameTracker, edge, gap, sqrNum); 
                    }
                }
            }
        }
    }  
};

// -- Initialization functions -- //

// Initializes gameboard
function initGB(gameTracker) {
    for (let i = 0; i < numberOfTiles; i++) {
        gameTracker.tiles.push([]);
        for (let j = 0; j < numberOfTiles; j++) {
            gameTracker.tiles[i][j] = new Tile(i, j);
            gameTracker.tiles[i][j].drawInit(ctx, edge, GAP);
        }
    }
}

// Initializes mines
function initMines(gameTracker) {
    let i = 0
    while (i < numberOfMines) {
        let randR = Math.floor(Math.random() * numberOfTiles);
        let randC = Math.floor(Math.random() * numberOfTiles);

        if (!(gameTracker.tiles[randR][randC].bomb)) {
            i++;
            gameTracker.tiles[randR][randC].bomb = true;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (gameTracker.tiles?.[randR + i]?.[randC + j] !== undefined) {
                        gameTracker.tiles[randR + i][randC + j].incrementValue();
                    }
                }
            }
        }
    mineCount.innerText = numberOfMines;
    }
}

initGB(gameTracker);
initMines(gameTracker);

// -- Event Listeners -- //

// Opens a tile
canvas.addEventListener('click', (e) => {
    let cRow = Math.floor((e.clientY - canvas.offsetTop + window.scrollY) / (edge + GAP));
    let cCol = Math.floor((e.clientX - canvas.offsetLeft) / (edge + GAP));

    if (e.altKey) {
        gameTracker.tiles[cRow][cCol].setFlag(ctx, gameTracker, edge, GAP);
        return;
    }

    gameTracker.tiles[cRow][cCol].reveal(ctx, gameTracker, edge, GAP, numberOfTiles);
    return;
});

// Prevents context menu when right-clicking
canvas.addEventListener('contextmenu', (e) => {e.preventDefault(); return;});

// Flags a tile
canvas.addEventListener('mousedown', (e) => {
    let cRow = Math.floor((e.clientY - canvas.offsetTop  + window.scrollY) / (edge + GAP)); 
    let cCol = Math.floor((e.clientX - canvas.offsetLeft) / (edge + GAP));
    if (e.button == 2) {
        gameTracker.tiles[cRow][cCol].setFlag(ctx, gameTracker, edge, GAP);
        return;
    }
    return;
});

// Restarts the game
window.onkeydown = (e) => {
    if (e.key == 'R' || e.key == 'r') {
        resetBoard(gameTracker);
    }
};

resetButton.addEventListener("click", (e) => {
	resetBoard(gameTracker);
})
