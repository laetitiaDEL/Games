const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const paddleSpeed = 8;
const initialBallSpeed = 6;
const speedIncrease = 0.2; // Speed increase per touch

let playerTouches = 0;
let isPaused = false;
let isGameOver = false;
let records = JSON.parse(localStorage.getItem('pongRecords')) || [];

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: initialBallSpeed,
    dy: initialBallSpeed
};

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color, fontSize = '24px') {
    ctx.fillStyle = color;
    ctx.font = `${fontSize} Arial`;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1); // Randomize direction
    ball.dy = (Math.random() * 4 - 2); // Randomize vertical direction
}

function update() {
    if (isPaused || isGameOver) return;

    // Move player paddle
    player.y += player.dy;

    // Prevent player paddle from going out of bounds
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Move AI paddle to perfectly track the ball
    if (ball.dx > 0) { // Only move AI paddle when the ball is moving towards it
        ai.y = ball.y - ai.height / 2; // Center the paddle on the ball
    }

    // Prevent AI paddle from going out of bounds
    if (ai.y < 0) {
        ai.y = 0;
    } else if (ai.y + ai.height > canvas.height) {
        ai.y = canvas.height - ai.height;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius; // Prevent sticking
        playerTouches++;
        document.getElementById('touches').textContent = playerTouches;

        // Increase ball speed
        ball.dx *= 1 + speedIncrease;
        ball.dy *= 1 + speedIncrease;
    }

    // Ball collision with AI paddle
    if (
        ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        ball.dx = -ball.dx;
        ball.x = ai.x - ball.radius; // Prevent sticking
    }

    // Ball out of bounds (left or right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        endGame();
    }
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#fff');
    drawRect(ai.x, ai.y, ai.width, ai.height, '#fff');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#fff');

    // Draw pause message
    if (isPaused) {
        drawText('PAUSED', canvas.width / 2 - 50, canvas.height / 2, '#fff', '48px');
    }

    // Draw game over message
    if (isGameOver) {
        drawText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2 - 50, '#fff', '48px');
        drawText(`Your Touches: ${playerTouches}`, canvas.width / 2 - 100, canvas.height / 2, '#fff', '24px');
    }
}

let lastRecordIndex = -1; // Track the index of the user's last record

function updateRecords() {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = ''; // Clear the list
    records.slice(0, 10).forEach((record, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${record}`;
        if (index === 0) {
            li.textContent += ' 👑'; // Add crown emoji for the first record
        }
        if (index === lastRecordIndex) {
            li.classList.add('user-last-record'); // Highlight the user's last record
        }
        recordsList.appendChild(li);
    });
}

function showCelebration() {
    const celebration = document.createElement('div');
    celebration.classList.add('celebration');
    celebration.textContent = 'New Record! 🎉';
    document.body.appendChild(celebration);

    // Remove the celebration element after the animation ends
    setTimeout(() => {
        celebration.remove();
    }, 2000);
}

function endGame() {
    isGameOver = true;
    records.push(playerTouches);
    records.sort((a, b) => b - a); // Sort records in descending order

    // Check if the user achieved a new best record
    if (records[0] === playerTouches) {
        showCelebration(); // Show celebration effect
    }

    // Find the index of the user's last record
    lastRecordIndex = records.indexOf(playerTouches);

    records = records.slice(0, 10); // Keep only the top 10 records
    localStorage.setItem('pongRecords', JSON.stringify(records)); // Save records to localStorage
    updateRecords(); // Update the records list
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
    if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent window scrolling
        player.dy = -paddleSpeed;
    } else if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent window scrolling
        player.dy = paddleSpeed;
    } else if (event.key === ' ') { // Space key to pause/resume
        if (!isGameOver) {
            isPaused = !isPaused;
        }
    }
}

function handleKeyUp(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        player.dy = 0;
    }
}

function endGame() {
    isGameOver = true;
    records.push(playerTouches);
    records.sort((a, b) => b - a); // Sort records in descending order
    records = records.slice(0, 10); // Keep only the top 10 records
    localStorage.setItem('pongRecords', JSON.stringify(records)); // Save records to localStorage
    updateRecords(); // Update the records list
}

function restartGame() {
    playerTouches = 0;
    document.getElementById('touches').textContent = playerTouches;
    resetBall();
    player.y = canvas.height / 2 - paddleHeight / 2;
    ai.y = canvas.height / 2 - paddleHeight / 2;
    isPaused = false;
    isGameOver = false;
    ball.dx = initialBallSpeed;
    ball.dy = initialBallSpeed;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.getElementById('restart').addEventListener('click', restartGame);

// Initialize records display
updateRecords();

// Start the game
gameLoop();