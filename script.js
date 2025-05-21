document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const playerGuessInput = document.getElementById('playerGuessInput');
    const submitPlayerGuess = document.getElementById('submitPlayerGuess');
    const playerGuessesContainer = document.getElementById('playerGuessesContainer');
    const playerMessage = document.getElementById('playerMessage');
    
    const computerGuessSection = document.getElementById('computerGuessSection');
    const computerGuessDisplay = document.getElementById('computerGuessDisplay');
    const computerDeadCount = document.getElementById('computerDeadCount');
    const computerInjuredCount = document.getElementById('computerInjuredCount');
    const submitFeedback = document.getElementById('submitFeedback');
    const computerGuessesContainer = document.getElementById('computerGuessesContainer');
    const computerMessage = document.getElementById('computerMessage');
    
    const turnIndicator = document.getElementById('turnIndicator');
    const newGameBtn = document.getElementById('newGameBtn');
    const scoreTableBody = document.getElementById('scoreTableBody');
    
    // Game state
    let gameState = {
        round: 1,
        playerSecret: [],
        computerSecret: [],
        playerAttempts: 0,
        computerAttempts: 0,
        playerScore: 0,
        computerScore: 0,
        isPlayerTurn: true,
        possibleNumbers: [],
        currentComputerGuess: null
    };
    
    const NUMBER_LENGTH = 4;
    const MAX_ATTEMPTS = 10;
    
    // Initialize the game
    initGame();
    
    // Event listeners
    submitPlayerGuess.addEventListener('click', handlePlayerGuess);
    submitFeedback.addEventListener('click', handleComputerFeedback);
    newGameBtn.addEventListener('click', initGame);
    playerGuessInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handlePlayerGuess();
        }
    });
    
    function initGame() {
        // Reset game state
        gameState = {
            round: 1,
            playerSecret: [],
            computerSecret: generateSecretNumber(),
            playerAttempts: 0,
            computerAttempts: 0,
            playerScore: 0,
            computerScore: 0,
            isPlayerTurn: true,
            possibleNumbers: generateAllPossibleNumbers(),
            currentComputerGuess: null
        };
        
        // Reset UI
        playerGuessesContainer.innerHTML = '';
        computerGuessesContainer.innerHTML = '';
        playerGuessInput.value = '';
        playerGuessInput.disabled = false;
        submitPlayerGuess.disabled = false;
        playerMessage.style.display = 'none';
        computerMessage.style.display = 'none';
        computerGuessSection.style.display = 'none';
        
        // Update turn indicator
        updateTurnIndicator();
        
        // Clear scoreboard
        scoreTableBody.innerHTML = '';
        addScoreRow();
        
        console.log('Computer secret:', gameState.computerSecret.join('')); // For debugging
    }
    
    function generateSecretNumber() {
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const secret = [];
        
        for (let i = 0; i < NUMBER_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            secret.push(digits[randomIndex]);
            digits.splice(randomIndex, 1);
        }
        
        return secret;
    }
    
    function generateAllPossibleNumbers() {
        const numbers = [];
        for (let i = 0; i < 10000; i++) {
            const numStr = i.toString().padStart(NUMBER_LENGTH, '0');
            const digits = numStr.split('').map(Number);
            const uniqueDigits = new Set(digits);
            if (uniqueDigits.size === NUMBER_LENGTH) {
                numbers.push(digits);
            }
        }
        return numbers;
    }
    
    function updateTurnIndicator() {
        if (gameState.isPlayerTurn) {
            turnIndicator.textContent = "Your turn to guess";
            turnIndicator.className = "turn-indicator player-turn";
        } else {
            turnIndicator.textContent = "Computer's turn to guess";
            turnIndicator.className = "turn-indicator computer-turn";
        }
    }
    
    function handlePlayerGuess() {
        const guessStr = playerGuessInput.value.trim();
        
        // Validate input
        if (guessStr.length !== NUMBER_LENGTH) {
            showMessage(playerMessage, 'Please enter exactly 4 digits', 'error');
            return;
        }
        
        if (!/^\d+$/.test(guessStr)) {
            showMessage(playerMessage, 'Please enter digits only (0-9)', 'error');
            return;
        }
        
        const guessDigits = guessStr.split('').map(Number);
        
        // Check for duplicate digits
        const uniqueDigits = new Set(guessDigits);
        if (uniqueDigits.size !== NUMBER_LENGTH) {
            showMessage(playerMessage, 'All digits must be unique', 'error');
            return;
        }
        
        gameState.playerAttempts++;
        
        // Evaluate the guess
        const result = evaluateGuess(guessDigits, gameState.computerSecret);
        
        // Display the guess and result
        displayGuess(playerGuessesContainer, gameState.playerAttempts, guessDigits, result.dead, result.injured);
        
        // Check for win
        if (result.dead === NUMBER_LENGTH) {
            showMessage(playerMessage, `You found the number in ${gameState.playerAttempts} attempts!`, 'success');
            gameState.playerScore = gameState.playerAttempts;
            updateScoreboard();
            switchTurns();
            return;
        }
        
        // Check for game over
        if (gameState.playerAttempts >= MAX_ATTEMPTS) {
            showMessage(playerMessage, `You didn't find the number! It was ${gameState.computerSecret.join('')}`, 'error');
            gameState.playerScore = MAX_ATTEMPTS + 1; // Penalty for not guessing
            updateScoreboard();
            switchTurns();
            return;
        }
        
        // Clear input for next guess
        playerGuessInput.value = '';
        hideMessage(playerMessage);
    }
    
    function switchTurns() {
        gameState.isPlayerTurn = !gameState.isPlayerTurn;
        updateTurnIndicator();
        
        if (!gameState.isPlayerTurn) {
            // Computer's turn
            playerGuessInput.disabled = true;
            submitPlayerGuess.disabled = true;
            computerGuessSection.style.display = 'block';
            
            // Get player's secret number
            let playerSecretStr;
            do {
                playerSecretStr = prompt("Please enter your 4-digit secret number for the computer to guess (all digits must be unique):");
                if (playerSecretStr === null) {
                    // User canceled, restart game
                    initGame();
                    return;
                }
            } while (!isValidSecret(playerSecretStr));
            
            gameState.playerSecret = playerSecretStr.split('').map(Number);
            makeComputerGuess();
        } else {
            // Player's turn (new round)
            computerGuessSection.style.display = 'none';
            playerGuessInput.disabled = false;
            submitPlayerGuess.disabled = false;
            
            // Reset for new round
            gameState.round++;
            gameState.playerAttempts = 0;
            gameState.computerAttempts = 0;
            gameState.computerSecret = generateSecretNumber();
            gameState.possibleNumbers = generateAllPossibleNumbers();
            gameState.currentComputerGuess = null;
            
            playerGuessesContainer.innerHTML = '';
            computerGuessesContainer.innerHTML = '';
            playerGuessInput.value = '';
            
            console.log('Computer secret:', gameState.computerSecret.join('')); // For debugging
        }
    }
    
    function isValidSecret(secretStr) {
        if (secretStr.length !== NUMBER_LENGTH) return false;
        if (!/^\d+$/.test(secretStr)) return false;
        const digits = secretStr.split('').map(Number);
        const uniqueDigits = new Set(digits);
        return uniqueDigits.size === NUMBER_LENGTH;
    }
    
    function makeComputerGuess() {
        gameState.computerAttempts++;
        
        // Make a guess (first try random, then use possible numbers)
        let guess;
        if (gameState.possibleNumbers.length > 0) {
            // For variety, sometimes pick randomly from possible numbers
            const guessIndex = gameState.computerAttempts <= 2 ? 
                Math.floor(Math.random() * gameState.possibleNumbers.length) : 0;
            guess = gameState.possibleNumbers[guessIndex];
        } else {
            // Fallback (shouldn't happen with perfect feedback)
            guess = generateSecretNumber();
        }
        
        gameState.currentComputerGuess = guess;
        computerGuessDisplay.textContent = guess.join('');
        computerDeadCount.textContent = '0';
        computerInjuredCount.textContent = '0';
    }
    
    function handleComputerFeedback() {
        const dead = parseInt(computerDeadCount.textContent);
        const injured = parseInt(computerInjuredCount.textContent);
        
        // Validate feedback
        if (isNaN(dead) || isNaN(injured) || dead < 0 || injured < 0 || dead + injured > NUMBER_LENGTH) {
            showMessage(computerMessage, 'Please enter valid feedback values', 'error');
            return;
        }
        
        // Display the computer's guess and feedback
        displayGuess(computerGuessesContainer, gameState.computerAttempts, 
                     gameState.currentComputerGuess, dead, injured);
        
        // Check for win
        if (dead === NUMBER_LENGTH) {
            showMessage(computerMessage, `Computer found your number in ${gameState.computerAttempts} attempts!`, 'success');
            gameState.computerScore = gameState.computerAttempts;
            updateScoreboard();
            switchTurns();
            return;
        }
        
        // Check for game over
        if (gameState.computerAttempts >= MAX_ATTEMPTS) {
            showMessage(computerMessage, `Computer didn't find your number!`, 'error');
            gameState.computerScore = MAX_ATTEMPTS + 1; // Penalty for not guessing
            updateScoreboard();
            switchTurns();
            return;
        }
        
        // Filter possible numbers based on feedback
        if (gameState.possibleNumbers.length > 0) {
            gameState.possibleNumbers = gameState.possibleNumbers.filter(num => {
                const result = evaluateGuess(gameState.currentComputerGuess, num);
                return result.dead === dead && result.injured === injured;
            });
        }
        
        hideMessage(computerMessage);
        makeComputerGuess();
    }
    
    function evaluateGuess(guess, secret) {
        let dead = 0;
        let injured = 0;
        
        // Check for dead (correct digit in correct position)
        for (let i = 0; i < NUMBER_LENGTH; i++) {
            if (guess[i] === secret[i]) {
                dead++;
            }
        }
        
        // Check for injured (correct digit but wrong position)
        for (let i = 0; i < NUMBER_LENGTH; i++) {
            if (guess[i] !== secret[i] && secret.includes(guess[i])) {
                injured++;
            }
        }
        
        return { dead, injured };
    }
    
    function displayGuess(container, attemptNumber, guessDigits, dead, injured) {
        const guessDiv = document.createElement('div');
        guessDiv.className = 'guess';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'guess-number';
        numberSpan.textContent = `#${attemptNumber}`;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'guess-value';
        valueSpan.textContent = guessDigits.join('');
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback';
        
        const deadSpan = document.createElement('span');
        deadSpan.className = 'dead';
        deadSpan.textContent = `Dead: ${dead}`;
        
        const injuredSpan = document.createElement('span');
        injuredSpan.className = 'injured';
        injuredSpan.textContent = `Injured: ${injured}`;
        
        feedbackDiv.appendChild(deadSpan);
        feedbackDiv.appendChild(injuredSpan);
        
        guessDiv.appendChild(numberSpan);
        guessDiv.appendChild(valueSpan);
        guessDiv.appendChild(feedbackDiv);
        
        container.prepend(guessDiv);
    }
    
    function addScoreRow() {
        const row = document.createElement('tr');
        
        const roundCell = document.createElement('td');
        roundCell.textContent = gameState.round;
        
        const playerCell = document.createElement('td');
        playerCell.textContent = gameState.playerScore || '-';
        
        const computerCell = document.createElement('td');
        computerCell.textContent = gameState.computerScore || '-';
        
        row.appendChild(roundCell);
        row.appendChild(playerCell);
        row.appendChild(computerCell);
        
        scoreTableBody.appendChild(row);
    }
    
    function updateScoreboard() {
        // Update the last row if it exists
        const rows = scoreTableBody.querySelectorAll('tr');
        if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            lastRow.cells[1].textContent = gameState.playerScore || '-';
            lastRow.cells[2].textContent = gameState.computerScore || '-';
        }
        
        // Add a new row if we're starting a new round
        if (gameState.isPlayerTurn && gameState.round > 1) {
            addScoreRow();
        }
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
    
    function hideMessage(element) {
        element.style.display = 'none';
    }
});
