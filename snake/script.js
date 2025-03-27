//get the canvas element
const canvas = document.getElementById('gameCanvas');
//get the context of the canvas
const ctx = canvas.getContext('2d');

//set the width and height of the canvas
const gridSize = 20;
const tileCount = canvas.width / gridSize;

//initialize the snake, direction, food, score and gameOver
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let gameOver = false;

//add event listeners
document.addEventListener('keydown', changeDirection);
document.getElementById('restart').addEventListener('click', restartGame);

//function to restart the game (initialize the snake, direction, food, score and gameOver)
function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = { x: 5, y: 5 };
    score = 0;
    gameOver = false;
    //update the score and start the game loop again 
    updateScore();
    gameLoop();
}

//function to change the direction of the snake based on the key pressed
function changeDirection(event) {
    const key = event.key;
    if (key === 'ArrowUp' && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
}

//function to update the score on the screen 
function updateScore() {
    document.getElementById('score').textContent = score;
}

//game loop function to keep the game running 
function gameLoop() {
    if (gameOver) {
        return;
    }

    // Call the game loop recursively after a delay of 100ms to keep the game running 
    setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        checkCollision();
        gameLoop();
    }, 100);
}

//function to clear the canvas 
function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//function to draw the food on the canvas 
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

//function to draw the snake on the canvas
function drawSnake() {
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

//function to move the snake
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    // Add the new head to the snake
    snake.unshift(head);

    // Check if the snake has eaten the food
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        placeFood();
    } else { // If the snake has not eaten the food, remove the tail
        snake.pop();
    }
}

//function to place the food on the canvas 
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Ensure food is not placed on the snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            // Recursively call the function to place the food again if it is placed on the snake 
            placeFood();
        }
    });
}

//function to check collision with walls and itself 
function checkCollision() {
    const head = snake[0];

    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        showGameOverModal();
    }

    // Check collision with itself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            showGameOverModal();
        }
    }
}

//function to show the game over modal
function showGameOverModal() {
    document.getElementById('finalScore').textContent = score;
    $('#gameOverModal').modal('show');

    // Hide the modal after 1.5 seconds
    setTimeout(() => {
        $('#gameOverModal').modal('hide');
    }, 1500);
}

// Start the game
restartGame();