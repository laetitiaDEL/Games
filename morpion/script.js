//get board
const board = document.getElementById('board');
//get all cells
const cells = document.querySelectorAll('.cell');
//get status text (who's turn or who wins)
const statusText = document.getElementById('status');
//get restart button
const restartButton = document.getElementById('restart');
//get body
const body = document.querySelector('body');

//initialize game
let currentPlayer = 'X'; // User is 'X', AI is 'O'
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// Winning conditions array
const winningConditions = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diagonals
    [2, 4, 6]
];

// Event handlers
function handleCellClick(event) {
    // Get the clicked cell
    const clickedCell = event.target;
    // get the index of the clicked cell ('data-index' HTML attribute)
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if the cell is already occupied or the game is over
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // User's move
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    // Add the class to style the cell
    clickedCell.classList.add(currentPlayer);

    // Check if the user wins
    checkForWinner();

    // If the game is still active, switch to AI's turn
    if (gameActive) {
        // Switch to AI's turn
        currentPlayer = 'O';
        statusText.textContent = `AI is thinking...`;
        setTimeout(makeAIMove, 500); // Add a delay to simulate AI thinking
    }
}

// AI's move
function makeAIMove() {
    // Check if the game is still active
    if (!gameActive) return;

    // Check if any player is about to win
    const userAboutToWin = isPlayerAboutToWin('X');
    const aiAboutToWin = isPlayerAboutToWin('O');
    let move;

    // If the AI is about to win, make the winning move
    if (aiAboutToWin !== null) {
        move = aiAboutToWin;
    } else {
        if (userAboutToWin !== null) {
            // If the user is about to win, block the user
            move = userAboutToWin;
        } else {
            // Otherwise, make a move with some randomness
            const bestMove = getBestMove();
            if (Math.random() < 0.3) {
                // 30% chance to make a random move
                const availableMoves = gameState
                    .map((val, index) => (val === '' ? index : null)) // Get empty cells
                    .filter(val => val !== null); // Remove null values
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random move
            } else {
                // Make the best move
                move = bestMove;
            }
        }
    }

    // AI's move
    gameState[move] = 'O';
    cells[move].textContent = 'O';
    cells[move].classList.add('O');

    // Check if the AI wins
    checkForWinner();

    // If the game is still active, switch back to the user's turn
    if (gameActive) {
        // Switch back to the user's turn
        currentPlayer = 'X';
        statusText.textContent = `It's your turn (X)`;
    }
}

// Check if the player is about to win
//param : player 'O' or 'X'
//returns the move to block/win if player is about to win, null otherwise
function isPlayerAboutToWin(player) {
    // Check if the player is about to win on their next move
    for (let i = 0; i < 9; i++) {
        // Check each empty cell
        if (gameState[i] === '') {
            gameState[i] = player;
            const result = checkGameResult(gameState);
            gameState[i] = ''; // Undo the move

            // If the player wins on the next move, return the move
            if (result === (player === 'X' ? -1 : 1)) {
                return i; // Return the move to block or win
            }
        }
    }
    return null; // No immediate win or block
}

// Returns the best move for the AI
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    // Check each empty cell
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O'; // AI makes a move
            let score = minimax(gameState, 0, false);
            gameState[i] = ''; // Undo the move

            // Update the best move
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

//get best move for AI, simulating all possible moves
//using minimax recursive algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkGameResult(board);

    // Return the score if the game is over
    if (result !== null) {
        return result;
    }

    // Recursive minimax algorithm
    // AI is maximizing, User is minimizing
    if (isMaximizing) {
        // AI's turn
        let bestScore = -Infinity;
        // Check each empty cell
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O'; // AI's move
                let score = minimax(board, depth + 1, false);
                board[i] = ''; // Undo the move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        // User's turn
        let bestScore = Infinity;
        // Check each empty cell
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X'; // User's move
                let score = minimax(board, depth + 1, true);
                board[i] = ''; // Undo the move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check the game result
// 1: AI wins, -1: User wins, 0: Draw, null: Game is still ongoing
function checkGameResult(board) {
    // Check the winning conditions
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        // Check if the game is won
        if (board[a] !== '' && board[a] === board[b] && board[b] === board[c]) {
            return board[a] === 'O' ? 1 : -1; // AI wins (1) or User wins (-1)
        }
    }

    // Check if the game is a draw
    if (!board.includes('')) {
        return 0; // Draw
    }

    return null; // Game is still ongoing
}

// Check if the game is over
//if there is a winner or draw
function checkForWinner() {
    const result = checkGameResult(gameState);

    // Display the result
    if (result !== null) { // Game is over
        gameActive = false;
        if (result === 1) { // AI wins
            statusText.textContent = 'AI wins !';
            body.classList.add('bg-danger-subtle');
        } else if (result === -1) { // User wins
            statusText.textContent = 'You win !';
            body.classList.add('bg-success-subtle');
        } else { // Draw
            statusText.textContent = 'Draw !';
            body.classList.add('bg-warning-subtle');
        }
    }
}

// Restart the game
//clear board and game state
function restartGame() {
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    body.classList.remove('bg-danger-subtle', 'bg-success-subtle', 'bg-warning-subtle');
    statusText.textContent = `It's your turn (X)`;
    cells.forEach(cell => { 
        cell.textContent = '';
        cell.classList.remove('X', 'O');
    });
}

// Event listeners
//add event listener to each cell
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

//add event listener to restart button
restartButton.addEventListener('click', restartGame);

// Initialize game
statusText.textContent = `It's your turn (X)`;