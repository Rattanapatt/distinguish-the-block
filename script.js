const blockCount = 25;
let similarColour = "";
let timer;
let timeLeft = 10;
let score = 0;
let gameStarted = false;
let isMuted = false;

function generateBlocks() {
    /*
    1. Generate random similar colours
    2. Generate diff-colour
        2.1 Set difficulty
        2.2 Identigy difficulty
        2.3 Generate diff-colour until diff
    3. Generate the grid
    */

    // ----------------------------------------------------------------------------------
    // 1. Generate random similar colors
    const gameContainer = $("#gameContainer");
    gameContainer.empty();

    // Generate random colors
    function generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // generate similar color
    similarColour = generateRandomColor();
    
    // 2. Generate diff-colour
    function generateDiffColor(similarColour, difficulty) {
        const [targetR, targetG, targetB] = similarColour
            .replace("rgb(", "")
            .replace(")", "")
            .split(", ")
            .map(Number);
        
        // 2.1 Set difficulty
        let range;
        if (difficulty === "start") {
            range = 140; 
        } else if (difficulty === "easy") {
            range = 100; 
        } else if (difficulty === "medium") {
            range = 80; 
        } else if (difficulty === "hard") {
            range = 40; 
        }
    
        const r = Math.min(255, Math.max(0, targetR + Math.floor(Math.random() * range * 2 - range)));
        const g = Math.min(255, Math.max(0, targetG + Math.floor(Math.random() * range * 2 - range)));
        const b = Math.min(255, Math.max(0, targetB + Math.floor(Math.random() * range * 2 - range)));
    
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 2.2 Identify difficulty
    let difficulty;
    if (score > 30) {
        difficulty = "hard";
    } else if (score > 20) {
        difficulty = "medium"; 
    } else if (score > 10) {
        difficulty = "easy";
    } else {
        difficulty = "start";
    }
    
    // 2.3 Generate diff-colour until diff
    let differentColor;
    do {
        differentColor = generateDiffColor(similarColour, difficulty);
    } while (differentColor === similarColour);

    // Generate grid
    // Fill all blocks with the similar color
    for (let i = 0; i < blockCount; i++) {
        const block = $("<div class='block'></div>");
        block.css("background-color", similarColour);
        block.data("color", similarColour);
        gameContainer.append(block);
    }

    // Replace a block with diff-colour
    const randomIndex = Math.floor(Math.random() * blockCount);
    const targetBlock = $(".block").eq(randomIndex);
    targetBlock.css("background-color", differentColor);
    targetBlock.data("color", differentColor);

    $(".block").click(handleBlockClick); // user interaction
    console.log(`Answer target: ${randomIndex + 1}`)
    console.log(`similarColour = ${similarColour} : dofferentColor = ${differentColor}`);
}

// ----------------------------------------------------------------------
// User interaction
function handleBlockClick() {

    if (!gameStarted) {
        $("#startButton").click();
        playSound(1, 100, type="triangle", time=0.1);
        return;
    }
    
    const clickedColor = $(this).data("color");
    if (clickedColor !== similarColour) {
        if (score > 30) {
            timeLeft = 3;
        } else if (score > 20) {
            timeLeft = 5;
        } else if (score > 10) {
            timeLeft = 8;
        } else {
            timeLeft = 10;
        }
        score++;
        playSound(1, 100, type="triangle");
        updateScore();
        updateTimer();
        generateBlocks();
    } else {
        gameOver();
    }
}

function startTimer() {
    timer = setInterval(() => {
        if (timeLeft === 0) {
            gameOver();
            return
        }
        timeLeft--;
        updateTimer();
    }, 1000);
}

function updateTimer() {
    $("#time").text(timeLeft);
}

// Generate sound
function playSound(times, delay, type="sine", time=0.2) {
    if (isMuted) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + time);
        }, i * delay);
    }
}

function gameOver() {
    clearInterval(timer);

    playSound(3, 500);

    // Show the overlay
    $("#gameOverMessage").text(`Game Over! Your Score: ${score}`);
    $("#gameOverModal").fadeIn();

    $("#startButton").text("Start");
    gameStarted = false;
}

// Close the overlay
$("#closeModal").click(() => {
    $("#gameOverModal").fadeOut();
});

function resetGame() {
    timeLeft = 10;
    score = 0;
    updateScore();
    updateTimer();
    generateBlocks();
    startTimer();
}

function updateScore() {
    $("#currentScore").text(score);
}

// Start 
$("#startButton").click(() => {
    if (!gameStarted) {
        gameStarted = true;
        $("#startButton").text("Restart");
        resetGame();
    } else {
        clearInterval(timer);
        resetGame();
    }
});

// Reset button
$(document).ready(() => {
    $("#startButton").text("Start"); 
});

// Gameover Overlay
$("#closeModal").click(() => {
    $("#gameOverModal").fadeOut();
});

// Mute button
$("#muteButton").click(() => {
    isMuted = !isMuted;
    $("#muteButton").text(isMuted ? "🔇" : "🔊"); // Update button text
});
