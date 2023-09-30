document.addEventListener("DOMContentLoaded", function () {
    const diceContainer = document.querySelector(".dice-container");
    const rollDice = document.querySelector(".roll-dice");
    const playerNumber = document.getElementById("players");
    const diceNumberOne = document.getElementById("one-die");
    const diceNumberTwo = document.getElementById("two-dice");
    const startButton = document.getElementById("start-button");
    const playerScoreLabels = document.querySelectorAll(".player-score");
    const playerNameLabels = document.querySelectorAll(".player-name-label");
    const nameInput = document.querySelectorAll(".name-input");
    const startScreen = document.querySelector(".startscreen");
    const hiddenGame = document.querySelector(".hidden-game");
    const nameSubmitButtons = document.querySelectorAll(".name-submit");
    const stay = document.querySelector(".stay");
    const roundScoreElement = document.getElementById("round-score");

    let currentDiceValue1 = 1;
    let currentDiceValue2 = 1;

    function createDice(number) {
        const dotPositionMatrix = {
            1: [
                [50, 50]
            ],
            2: [
                [20, 20],
                [80, 80]
            ],
            3: [
                [20, 20],
                [50, 50],
                [80, 80]
            ],
            4: [
                [20, 20],
                [20, 80],
                [80, 20],
                [80, 80]
            ],
            5: [
                [20, 20],
                [20, 80],
                [50, 50],
                [80, 20],
                [80, 80]
            ],
            6: [
                [20, 20],
                [20, 80],
                [50, 20],
                [50, 80],
                [80, 20],
                [80, 80]
            ]
        };

        const dice = document.createElement("div");
        dice.classList.add("dice");
        for (const dotPosition of dotPositionMatrix[number]) {
            const dot = document.createElement("div");
            dot.classList.add("dice-dot");
            dot.style.setProperty("--top", dotPosition[0] + "%");
            dot.style.setProperty("--left", dotPosition[1] + "%");
            dice.appendChild(dot);
        }
        return dice;
    }

    const playerNames = ["", "", "", "", "", ""];
    nameSubmitButtons.forEach(button => {
        button.addEventListener("click", () => {
            const playerId = button.getAttribute("data-player");
            const playerNameInput = document.getElementById(`player-${playerId}-name`);
            const playerName = playerNameInput.value;
            const playerNameLabel = document.querySelector(`label[for='player-${playerId}-name']`);
            const playerNamesLabel = document.querySelector(`label[for='player-${playerId}-names']`);
            const errorMessage = document.getElementById(`player-${playerId}-error`);

            if (playerName.trim() === "") {
                errorMessage.textContent = "Name cannot be blank";
                return;
            } else {
                errorMessage.textContent = "";
            }
    
            playerNameLabel.textContent = `Player ${playerId}: ${playerName}`;
            playerNamesLabel.textContent = `${playerName}:`;
            playerNames[playerId - 1] = playerName;
        });
    });
    
    function showPlayerInputs(numPlayers) {
        hidePlayerInputs();   
        for (let i = 0; i < numPlayers; i++) {
            playerScoreLabels[i].style.display = "block";
            playerNameLabels[i].style.display = "block";
            nameInput[i].style.display = "block";
            nameSubmitButtons[i].style.display = "block";
        }
    }

    function hidePlayerInputs() {   
        playerScoreLabels.forEach(label => {
            label.style.display = "none";
        });

        playerNameLabels.forEach(label => {
            label.style.display = "none";
        });

        nameInput.forEach(label => {
            label.style.display = "none";
        });

        nameSubmitButtons.forEach(label => {
            label.style.display = "none";
        });
    }

    let numPlayers = 2;
    playerNumber.addEventListener("change", function () {
        numPlayers = parseInt(playerNumber.value);
        showPlayerInputs(numPlayers);
    });

    startButton.addEventListener("click", () => {
        const diceNumberOneChecked = diceNumberOne.checked;
        const diceNumberTwoChecked = diceNumberTwo.checked;
        const errorDice = document.getElementById("error-dice");

        if (!diceNumberOneChecked && !diceNumberTwoChecked) {
            errorDice.textContent = "Select number of dice"
            return;
        } else {
            errorDice.textContent = "";
        }

        if (diceNumberOneChecked) {
            number_of_dice = 1;
        } else if (diceNumberTwoChecked) {
            number_of_dice = 2;
        }
        const numPlayers = parseInt(playerNumber.value);

        if (!validatePlayerNames(numPlayers)) {
            return;
        }
    
        showPlayerInputs(numPlayers);
        randomizeDice(diceContainer, number_of_dice);
    
        currentPlayer = 1;
        playerNameLabels[currentPlayer - 1].classList.add("active-player");
        playerScoreLabels[currentPlayer - 1].classList.add("active-player");
    
        startScreen.classList.add("hidden");
        hiddenGame.classList.remove("hidden");
    });
    
    function validatePlayerNames(numPlayers) {
        for (let i = 1; i <= numPlayers; i++) {
            const playerNameInput = document.getElementById(`player-${i}-name`);
            const playerName = playerNameInput.value.trim();
            const errorMessage = document.getElementById(`player-${i}-error`);
    
            if (playerName === "") {
                errorMessage.textContent = "Name cannot be blank";
                errorMessage.classList.add("error-message");
                return false;
            } else {
                errorMessage.classList.remove("error-message");
            }
        }
        return true;
    }

    playerNumber.value = "2";
    playerNumber.dispatchEvent(new Event("change"));

    let currentPlayer = 1;
    let roundScore = 0;
    let consecutiveDoubles = 0;
    
    rollDice.addEventListener("click", () => {
        randomizeDice(diceContainer, number_of_dice);
    
        if (number_of_dice === 1) {
            if (currentDiceValue1 === 1) {
                roundScore = 0;
                hasRolledOne = true;
                nextPlayer();
            } else {
                roundScore += currentDiceValue1;
            }
        } else {
            if (currentDiceValue1 === 1 && currentDiceValue2 === 1) {
                roundScore += 25;
            } else if (currentDiceValue1 === 1 || currentDiceValue2 === 1) {
                roundScore = 0;
                hasRolledOne = true;
                nextPlayer();
            } else if (currentDiceValue1 === currentDiceValue2) {
                roundScore += (currentDiceValue1 + currentDiceValue2) * 2;
                consecutiveDoubles++;
                if (consecutiveDoubles === 3) {                   
                    roundScore = 0;
                    consecutiveDoubles = 0;
                    nextPlayer();
                }
            } else {
                consecutiveDoubles = 0;
                roundScore += currentDiceValue1 + currentDiceValue2;
            }
        }

        roundScoreElement.textContent = `Current Round Score: ${roundScore}`;
    });

    function randomizeDice(diceContainer, numberOfDice) {
        diceContainer.innerHTML = "";
        
        if (numberOfDice === 1) {
            currentDiceValue1 = Math.floor((Math.random() * 6) + 1);
            const dice = createDice(currentDiceValue1);
            diceContainer.appendChild(dice);
        } else {
            currentDiceValue1 = Math.floor((Math.random() * 6) + 1);
            currentDiceValue2 = Math.floor((Math.random() * 6) + 1);
            
            const dice1 = createDice(currentDiceValue1);
            const dice2 = createDice(currentDiceValue2);
    
            diceContainer.appendChild(dice1);
            diceContainer.appendChild(dice2);
        }
    }

    const playerScores = [0, 0, 0, 0, 0, 0];
    let winningPlayerIndex = -1;
    stay.addEventListener("click", () => {
        const roundScoreElement = document.getElementById("round-score");
        roundScoreElement.textContent = "Current Round Score: 0";
        playerScores[currentPlayer - 1] += roundScore;
        const playerScoreElement = document.getElementById(`player-${currentPlayer}-score`);
        playerScoreElement.textContent = playerScores[currentPlayer - 1];
    
        if (playerScores[currentPlayer - 1] >= 100) {
            hiddenGame.classList.add("hidden");
            winningPlayerIndex = currentPlayer - 1;
            const endGameScreen = document.getElementById("end-game-screen");
            endGameScreen.classList.remove("hidden");
    
            let maxScore = -1;
            let winner = "";
            const numPlayers = parseInt(playerNumber.value);
            const displayedPlayerNames = playerNames.slice(0, numPlayers);
            const displayedPlayerScores = playerScores.slice(0, numPlayers);
    
            for (let i = 0; i < numPlayers; i++) {
                if (displayedPlayerScores[i] > maxScore) {
                    maxScore = displayedPlayerScores[i];
                    winner = `Player ${i + 1}`;
                }
            }
    
            const endGameContent = `
                <h2>Game Over</h2>
                <p>Total Scores:</p>
                ${displayedPlayerNames.map((name, index) => `<p>${name}: ${displayedPlayerScores[index]}</p>`).join("")}
                <p>Winner: ${winner}</p>
                <a href="index.html">Restart</a>
            `;
    
            endGameScreen.innerHTML = endGameContent;
        } else {
            roundScore = 0;
            hasRolledOne = false;
            nextPlayer();
        }
    });

    function nextPlayer() {

        playerNameLabels[currentPlayer - 1].classList.remove("active-player");
        playerScoreLabels[currentPlayer - 1].classList.remove("active-player");
    
        roundScore = 0;
        hasRolledOne = false;
    
        currentPlayer++;
        if (currentPlayer > numPlayers) {
            currentPlayer = 1;
        }
    
        playerNameLabels[currentPlayer - 1].classList.add("active-player");
        playerScoreLabels[currentPlayer - 1].classList.add("active-player");
    }
});