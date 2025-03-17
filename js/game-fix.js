// Safari Game Fix
$(document).ready(function() {
    console.log("Game fix loaded for Safari");
    
    // Create a global score variable that's directly accessible
    window.gameScore = 0;
    
    // Add CSS to make game elements more precise
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .game-area {
            position: relative;
            height: 300px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .game-target {
            position: absolute;
            font-size: 20px;
            transition: top 0.2s linear;
        }
        
        .game-laser {
            position: absolute;
            width: 1px;
            height: 10px;
            background-color: #ff0066;
            box-shadow: 0 0 5px #ff0066, 0 0 10px #ff0066;
        }
        
        .game-character {
            position: absolute;
            bottom: 15%;
            left: 50%;
            transform: translateX(-50%) rotate(-90deg) !important;
            font-size: 24px;
        }
        
        /* Explosion animation for collisions */
        @keyframes explode {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }
    `;
    document.head.appendChild(styleElement);
    
    // Override the startGame function to ensure score is reset and rocket faces upward
    const originalStartGame = window.startGame;
    window.startGame = function() {
        // Reset score
        window.gameScore = 0;
        console.log("Game started with score reset to 0");
        
        // Call original function
        if (typeof originalStartGame === 'function') {
            originalStartGame();
        } else {
            console.error("Original startGame function not found");
        }
        
        // Ensure score display is updated
        const scoreElement = document.querySelector('.game-score');
        if (scoreElement) {
            scoreElement.textContent = `Score: 0`;
        }
        
        // Change rocket emoji to face upward
        const character = document.querySelector('.game-character');
        if (character) {
            character.textContent = '🚀';
            character.style.transform = 'translateX(-50%) rotate(-90deg)';
        }
        
        // Add a direct collision check to the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            // Store original positions for enemies
            window.enemyPositions = [];
            
            // Add a click handler to end the game (for testing)
            gameArea.addEventListener('click', function() {
                console.log("Game area clicked - ending game for testing");
                window.endGame();
            });
            
            // Set up a separate collision detection timer
            const collisionTimer = setInterval(() => {
                if (!window.gameActive) {
                    clearInterval(collisionTimer);
                    return;
                }
                
                // Check for collisions directly
                const targets = document.querySelectorAll('.game-target');
                const character = document.querySelector('.game-character');
                
                if (!character) return;
                
                // Character is at bottom 15%
                targets.forEach(target => {
                    const targetY = parseFloat(target.style.top || '0');
                    const targetX = parseFloat(target.style.left || '0');
                    
                    // If enemy is in the danger zone (75-95% down, 30-70% across)
                    if (targetY >= 75 && targetY <= 95 && 
                        targetX >= 30 && targetX <= 70) {
                        
                        console.log("COLLISION DETECTED in timer! Game over.");
                        
                        // Visual feedback
                        target.style.color = 'red';
                        target.style.fontSize = '30px';
                        
                        // End the game after a short delay
                        setTimeout(() => {
                            window.endGame();
                        }, 500);
                        
                        clearInterval(collisionTimer);
                    }
                });
            }, 100); // Check every 100ms
            
            // Store the timer ID
            gameArea.dataset.collisionTimerId = collisionTimer;
        }
    };
    
    // Override the moveAllEnemies function with a much simpler approach
    window.moveAllEnemies = function() {
        const targets = document.querySelectorAll('.game-target');
        const character = document.querySelector('.game-character');
        const gameArea = document.querySelector('.game-area');
        
        if (!character || !gameArea) return;
        
        // Get character position in percentage
        const characterBottom = 10; // Bottom 10%
        const characterLeft = 50;   // Center
        
        targets.forEach((target, index) => {
            const speed = parseFloat(target.dataset.speed) || 1;
            const currentY = parseFloat(target.style.top || '10');
            const currentX = parseFloat(target.style.left || '50');
            
            // Move target down based on its speed
            const newY = currentY + speed;
            target.style.top = `${newY}%`;
            
            // Check for collision with player - using percentage-based positions
            // Character is at bottom 10%, enemies hit when they reach 80-90%
            if (newY >= 80 && newY <= 95 && 
                currentX >= 30 && currentX <= 70) {
                
                console.log("DIRECT HIT DETECTED! Game over.");
                
                // Visual feedback
                target.style.color = 'red';
                target.style.fontSize = '30px';
                
                // End the game after a short delay
                setTimeout(() => {
                    window.endGame();
                }, 500);
                
                return; // Stop processing this enemy
            }
            
            // If target would go off screen, reset to top and check for score
            // IMPORTANT: Only count as dodged if it's completely off screen (>100%)
            if (newY > 100) {
                // Award points for successfully avoiding the enemy
                console.log("Enemy passed! Adding 5 points");
                
                // Direct score update
                window.gameScore += 5;
                
                // Update score display directly
                const scoreElement = document.querySelector('.game-score');
                if (scoreElement) {
                    scoreElement.textContent = `Score: ${window.gameScore}`;
                    
                    // Add a flash effect
                    scoreElement.style.color = '#00ff00';
                    setTimeout(() => {
                        scoreElement.style.color = '';
                    }, 300);
                }
                
                // Show visual feedback
                showDodgeMessage(target);
                
                // Reset enemy to top at random position
                target.style.top = '5%';
                target.style.left = `${Math.random() * 80}%`;
            }
        });
    };
    
    // Override the checkCollision function to fix scoring with very precise hit boxes
    window.checkCollision = function(laser, target) {
        // Get positions as percentages
        const laserTop = parseFloat(laser.style.top || '0');
        const laserLeft = parseFloat(laser.style.left || '0');
        const targetTop = parseFloat(target.style.top || '0');
        const targetLeft = parseFloat(target.style.left || '0');
        
        // Simple collision detection based on percentage positions
        const hitDistance = 5; // percentage units
        
        // Check if laser is close to target
        if (Math.abs(laserLeft - targetLeft) < hitDistance && 
            Math.abs(laserTop - targetTop) < hitDistance) {
            
            // Hit! Increment score directly
            console.log("Hit! Adding 10 points");
            window.gameScore += 10;
            
            // Update score display directly
            const scoreElement = document.querySelector('.game-score');
            if (scoreElement) {
                scoreElement.textContent = `Score: ${window.gameScore}`;
                
                // Add a flash effect
                scoreElement.style.color = '#ff0066';
                setTimeout(() => {
                    scoreElement.style.color = '';
                }, 300);
            }
            
            // Show hit effect
            target.classList.add('hit');
            
            // Show score popup
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                const scorePopup = document.createElement('div');
                scorePopup.className = 'score-popup';
                scorePopup.textContent = '+10';
                scorePopup.style.color = 'var(--accent-color)'; // Red for hits
                
                // Position near the hit
                scorePopup.style.left = `${targetLeft}%`;
                scorePopup.style.top = `${targetTop}%`;
                
                gameArea.appendChild(scorePopup);
                
                // Animate and remove
                setTimeout(() => {
                    scorePopup.style.opacity = '0';
                    scorePopup.style.top = `${targetTop - 10}%`;
                    
                    setTimeout(() => {
                        if (scorePopup.parentNode) {
                            scorePopup.remove();
                        }
                    }, 500);
                }, 10);
            }
            
            setTimeout(() => {
                target.classList.remove('hit');
                // Move target to new position
                target.style.top = '5%';
                target.style.left = `${Math.random() * 80}%`;
            }, 200);
            
            return true; // Collision detected
        }
        
        return false; // No collision
    };
    
    // Override the showDodgeMessage function to fix visual feedback
    window.showDodgeMessage = function(target) {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        // Get target position
        const targetLeft = parseFloat(target.style.left || '20');
        
        const dodgeMsg = document.createElement('div');
        dodgeMsg.className = 'score-popup';
        dodgeMsg.textContent = 'DODGED +5';
        dodgeMsg.style.color = '#00ff00'; // Green for dodge
        
        // Position near the bottom where the enemy passed
        dodgeMsg.style.left = `${targetLeft}%`;
        dodgeMsg.style.top = '80%'; // Position at bottom of game area
        
        gameArea.appendChild(dodgeMsg);
        
        // Animate and remove
        setTimeout(() => {
            dodgeMsg.style.opacity = '0';
            dodgeMsg.style.top = '70%';
            
            setTimeout(() => {
                if (dodgeMsg.parentNode) {
                    dodgeMsg.remove();
                }
            }, 500);
        }, 10);
    };
    
    // Override the shootLaser function to make it more precise
    window.shootLaser = function() {
        if (!window.gameActive) return;
        
        const gameArea = document.querySelector('.game-area');
        const character = document.querySelector('.game-character');
        
        if (!gameArea || !character) return;
        
        // Use percentage-based positioning
        const characterLeft = 50; // Center
        
        // Create laser
        const laser = document.createElement('div');
        laser.className = 'game-laser';
        laser.style.left = `${characterLeft}%`;
        laser.style.top = '70%'; // Start from character position
        gameArea.appendChild(laser);
        
        // Animate laser movement
        let laserTop = 70;
        const laserInterval = setInterval(() => {
            if (!window.gameActive) {
                clearInterval(laserInterval);
                laser.remove();
                return;
            }
            
            laserTop -= 5;
            laser.style.top = `${laserTop}%`;
            
            // Check for collisions with all targets
            const targets = document.querySelectorAll('.game-target');
            let hitDetected = false;
            
            targets.forEach(target => {
                if (!hitDetected && window.checkCollision(laser, target)) {
                    hitDetected = true;
                    clearInterval(laserInterval);
                    laser.remove();
                }
            });
            
            // Remove laser when it goes off screen
            if (laserTop < 0 || hitDetected) {
                clearInterval(laserInterval);
                laser.remove();
            }
        }, 50);
    };
    
    // Override the endGame function to ensure it properly ends the game
    window.endGame = function() {
        console.log("Game ending with score:", window.gameScore);
        window.gameActive = false;
        
        // Clear game timers
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            if (gameContainer.dataset.timerId) {
                clearInterval(parseInt(gameContainer.dataset.timerId));
            }
            if (gameContainer.dataset.enemyTimerId) {
                clearInterval(parseInt(gameContainer.dataset.enemyTimerId));
            }
        }
        
        // Clear collision timer
        const gameArea = document.querySelector('.game-area');
        if (gameArea && gameArea.dataset.collisionTimerId) {
            clearInterval(parseInt(gameArea.dataset.collisionTimerId));
        }
        
        // Show game results
        const terminalBody = document.querySelector('.terminal-body');
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-output';
        resultElement.innerHTML = `
            <div class="terminal-line">
                <span class="success">Game Over! Final Score: ${window.gameScore}</span>
            </div>
            <div class="terminal-line">
                Thanks for playing the secret mini-game!
            </div>
        `;
        
        // Remove game container
        if (gameContainer) {
            gameContainer.remove();
        }
        
        terminalBody.appendChild(resultElement);
        
        // Add new prompt line
        const newPromptLine = document.createElement('div');
        newPromptLine.className = 'terminal-line';
        newPromptLine.innerHTML = `
            <span class="terminal-prompt">visitor@portfolio:~$</span>
            <span class="terminal-cursor blink">█</span>
        `;
        terminalBody.appendChild(newPromptLine);
        
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    };
}); 