function setVars(gameTracker) {
    let difSelector = document.getElementById('difficulties');
    let difLevel = '';

    switch (difSelector.value) {
        case '0':
            numberOfMines = 50;
            difLevel = 'Easy';
            break;
        case '1':
            numberOfMines = 70;
            difLevel = 'Medium';
            break;
        case '2':
            numberOfMines = 90;
            difLevel = 'Hard';
            break;
        case '3':
            numberOfMines = 120;
            difLevel = 'Very Hard';
            break;
        case '4':
            numberOfMines = Math.floor(0.5 * (numberOfTiles ** 2));
            difLevel = '50% Mines';
            break;
        case '5':
            numberOfMines = Math.floor(0.75 * (numberOfTiles ** 2));
            difLevel = '75% Mines';
            break;
        default:
            numberOfMines = 30;
            difLevel = 'Easy';
            break;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    difficultyLevel.innerText = difLevel;
    mineCount.innerText = numberOfMines;
    initGB(gameTracker);
    initMines(gameTracker);

    return;
}

function resetBoard(gameTracker) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameTracker.tiles = [];
    gameTracker.openedTiles = 0;
    gameTracker.flagCounterElement.innerText = 0;
    initGB(gameTracker);
    initMines(gameTracker);    
    return;
}