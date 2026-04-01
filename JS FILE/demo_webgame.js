
// ==========================================
// GAME STATE
// ==========================================
const gameState = {
    playerScore: 0,
    computerScore: 0,
    draws: 0,
    round: 0,
    history: [],
    streak: 0,        // positive = player streak, negative = computer streak
    isPlaying: false   // prevents spam clicking during animation
};

// ==========================================
// CONSTANTS
// ==========================================
const CHOICES = ['rock', 'paper', 'scissors'];

const EMOJIS = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
};

// Win conditions: key beats value
const WIN_MAP = {
    rock: 'scissors',      // Rock crushes Scissors
    paper: 'rock',         // Paper covers Rock
    scissors: 'paper'      // Scissors cuts Paper
};

const WIN_MESSAGES = {
    rock: 'Rock crushes Scissors!',
    paper: 'Paper covers Rock!',
    scissors: 'Scissors cuts Paper!'
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
    playerScore: document.getElementById('playerScore'),
    computerScore: document.getElementById('computerScore'),
    drawScore: document.getElementById('drawScore'),
    roundNumber: document.getElementById('roundNumber'),
    playerBattle: document.getElementById('playerBattle'),
    computerBattle: document.getElementById('computerBattle'),
    resultArea: document.getElementById('resultArea'),
    historySection: document.getElementById('historySection'),
    historyList: document.getElementById('historyList'),
    streakBadge: document.getElementById('streakBadge'),
    streakText: document.getElementById('streakText'),
    buttons: {
        rock: document.getElementById('rockBtn'),
        paper: document.getElementById('paperBtn'),
        scissors: document.getElementById('scissorsBtn')
    }
};

// ==========================================
// CORE GAME LOGIC
// ==========================================

/**
 * Generate computer's random choice
 * Uses Math.random() to pick from available choices
 */
function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex];
}

/**
 * Determine the winner of a round
 * @param {string} player - Player's choice
 * @param {string} computer - Computer's choice
 * @returns {string} - 'win', 'lose', or 'draw'
 */
function determineWinner(player, computer) {
    // If both choose the same, it's a draw
    if (player === computer) {
        return 'draw';
    }

    // Check if the player's choice beats the computer's choice
    // Using the WIN_MAP: if the value that player's choice beats
    // matches the computer's choice, the player wins
    if (WIN_MAP[player] === computer) {
        return 'win';
    }

    // Otherwise, the computer wins
    return 'lose';
}

/**
 * Get a descriptive message for the round result
 */
function getResultDescription(playerChoice, computerChoice, result) {
    if (result === 'draw') {
        return `Both chose ${EMOJIS[playerChoice]} — Great minds think alike!`;
    }
    if (result === 'win') {
        return WIN_MESSAGES[playerChoice];
    }
    return WIN_MESSAGES[computerChoice];
}

// ==========================================
// GAME FLOW
// ==========================================

/**
 * Main game function - called when player makes a choice
 */
function playGame(playerChoice) {
    // Prevent rapid clicking during animation
    if (gameState.isPlaying) return;
    gameState.isPlaying = true;

    // Disable buttons during animation
    toggleButtons(false);

    // Increment round
    gameState.round++;

    // Get computer's choice
    const computerChoice = getComputerChoice();

    // Start the battle animation
    animateBattle(playerChoice, computerChoice);
}

/**
 * Process the round result and update state
 */
function processResult(playerChoice, computerChoice) {
    const result = determineWinner(playerChoice, computerChoice);

    // Update scores based on result
    switch (result) {
        case 'win':
            gameState.playerScore++;
            // Update streak
            gameState.streak = gameState.streak > 0 ? gameState.streak + 1 : 1;
            break;
        case 'lose':
            gameState.computerScore++;
            // Update streak
            gameState.streak = gameState.streak < 0 ? gameState.streak - 1 : -1;
            break;
        case 'draw':
            gameState.draws++;
            // Streak resets on draw
            gameState.streak = 0;
            break;
    }

    // Add to history
    gameState.history.unshift({
        round: gameState.round,
        playerChoice,
        computerChoice,
        result
    });

    // Update the UI
    updateScoreboard();
    showResult(playerChoice, computerChoice, result);
    updateHistory();
    updateStreak();

    // Re-enable buttons
    toggleButtons(true);
    gameState.isPlaying = false;
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

/**
 * Update scoreboard display
 */
function updateScoreboard() {
    animateNumber(elements.playerScore, gameState.playerScore);
    animateNumber(elements.computerScore, gameState.computerScore);
    animateNumber(elements.drawScore, gameState.draws);
    elements.roundNumber.textContent = gameState.round;
}

/**
 * Animate number change with a pop effect
 */
function animateNumber(element, value) {
    element.textContent = value;
    element.style.transform = 'scale(1.3)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.transition = 'transform 0.3s ease';
    }, 150);
}

/**
 * Show the battle animation
 */
function animateBattle(playerChoice, computerChoice) {
    const playerEl = elements.playerBattle;
    const computerEl = elements.computerBattle;

    // Remove previous winner glow
    playerEl.classList.remove('winner-glow');
    computerEl.classList.remove('winner-glow');

    // Show thinking animation for computer
    const thinkingEmojis = ['🪨', '📄', '✂️'];
    let thinkingIndex = 0;

    // Show player's choice immediately
    playerEl.querySelector('span:first-child').textContent = EMOJIS[playerChoice];

    // Animate computer thinking
    const thinkingInterval = setInterval(() => {
        computerEl.querySelector('span:first-child').textContent = thinkingEmojis[thinkingIndex];
        computerEl.querySelector('span:first-child').classList.add('thinking-emoji');
        thinkingIndex = (thinkingIndex + 1) % thinkingEmojis.length;
    }, 150);

    // Update result area during animation
    elements.resultArea.innerHTML = `
                <div class="result-text" style="color: rgba(255,255,255,0.5); font-size: 1.2rem;">
                    <span class="thinking-emoji">🤔</span> Computer is choosing...
                </div>
            `;

    // Reveal after delay
    setTimeout(() => {
        clearInterval(thinkingInterval);
        computerEl.querySelector('span:first-child').classList.remove('thinking-emoji');
        computerEl.querySelector('span:first-child').textContent = EMOJIS[computerChoice];

        // Process the result
        processResult(playerChoice, computerChoice);
    }, 1000);
}

/**
 * Show the round result
 */
function showResult(playerChoice, computerChoice, result) {
    const playerEl = elements.playerBattle;
    const computerEl = elements.computerBattle;

    let resultClass, resultText, resultIcon;

    switch (result) {
        case 'win':
            resultClass = 'result-win';
            resultText = 'You Win!';
            resultIcon = '🎉';
            playerEl.classList.add('winner-glow');
            break;
        case 'lose':
            resultClass = 'result-lose';
            resultText = 'You Lose!';
            resultIcon = '😢';
            computerEl.classList.add('winner-glow');
            break;
        case 'draw':
            resultClass = 'result-draw';
            resultText = "It's a Draw!";
            resultIcon = '🤝';
            break;
    }

    const description = getResultDescription(playerChoice, computerChoice, result);

    elements.resultArea.innerHTML = `
                <div class="result-text ${resultClass}">${resultIcon} ${resultText}</div>
                <div class="result-detail">${description}</div>
            `;
}

/**
 * Update the game history list
 */
function updateHistory() {
    if (gameState.history.length === 0) {
        elements.historySection.style.display = 'none';
        return;
    }

    elements.historySection.style.display = 'block';

    elements.historyList.innerHTML = gameState.history.map(item => {
        const resultClass = item.result;
        const badgeClass = `badge-${item.result}`;
        const resultLabel = item.result === 'win' ? 'Won' : item.result === 'lose' ? 'Lost' : 'Draw';

        return `
                    <div class="history-item ${resultClass}">
                        <span class="history-round">#${item.round}</span>
                        <span class="history-choices">
                            ${EMOJIS[item.playerChoice]} vs ${EMOJIS[item.computerChoice]}
                        </span>
                        <span class="history-result-badge ${badgeClass}">${resultLabel}</span>
                    </div>
                `;
    }).join('');
}

/**
 * Update streak display
 */
function updateStreak() {
    const streak = gameState.streak;
    const badge = elements.streakBadge;
    const text = elements.streakText;

    if (Math.abs(streak) >= 2) {
        badge.style.display = 'inline-flex';
        if (streak > 0) {
            badge.classList.add('hot');
            text.textContent = `${streak} Win Streak! 🔥`;
        } else {
            badge.classList.remove('hot');
            text.textContent = `${Math.abs(streak)} Loss Streak 💀`;
        }
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Enable/disable choice buttons
 */
function toggleButtons(enabled) {
    Object.values(elements.buttons).forEach(btn => {
        btn.disabled = !enabled;
    });
}

// ==========================================
// RESET GAME
// ==========================================

function resetGame() {
    // Reset state
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.draws = 0;
    gameState.round = 0;
    gameState.history = [];
    gameState.streak = 0;
    gameState.isPlaying = false;

    // Reset UI
    elements.playerScore.textContent = '0';
    elements.computerScore.textContent = '0';
    elements.drawScore.textContent = '0';
    elements.roundNumber.textContent = '0';

    elements.playerBattle.querySelector('span:first-child').textContent = '❓';
    elements.computerBattle.querySelector('span:first-child').textContent = '❓';
    elements.playerBattle.classList.remove('winner-glow');
    elements.computerBattle.classList.remove('winner-glow');

    elements.resultArea.innerHTML = `
                <div class="result-text" style="color: rgba(255,255,255,0.3);">Make Your Move!</div>
                <div class="result-detail">Choose rock, paper, or scissors below</div>
            `;

    elements.historySection.style.display = 'none';
    elements.historyList.innerHTML = '';
    elements.streakBadge.style.display = 'none';

    toggleButtons(true);
}

// ==========================================
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener('keydown', (e) => {
    if (gameState.isPlaying) return;

    switch (e.key.toLowerCase()) {
        case 'r':
        case '1':
            playGame('rock');
            break;
        case 'p':
        case '2':
            playGame('paper');
            break;
        case 's':
        case '3':
            playGame('scissors');
            break;
    }
});

// ==========================================
// BACKGROUND PARTICLES
// ==========================================

function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 6 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// Initialize particles
createParticles();
