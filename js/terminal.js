$(document).ready(function() {
    // Add typing sound effect
    const typingSound = new Audio();
    typingSound.src = 'sounds/typing.mp3';
    typingSound.volume = 0.2;
    
    // Add command execution sound
    const commandSound = new Audio();
    commandSound.src = 'sounds/command.mp3';
    commandSound.volume = 0.3;
    
    // Easter egg: Konami code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    // Game variables - defined globally for the module
    window.gameScore = 0;
    window.gameActive = false;
    
    // Safari compatibility check
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log("Browser detected as Safari:", isSafari);
    
    // Terminal command input simulation with improved typing effect
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // Find the active cursor
            const activeCursor = document.querySelector('.terminal-cursor.blink');
            if (!activeCursor) return;
            
            const lastPrompt = activeCursor.parentElement;
            const command = lastPrompt.querySelector('.terminal-text') ? 
                            lastPrompt.querySelector('.terminal-text').textContent : '';
            
            // Play command sound
            try {
                commandSound.currentTime = 0;
                commandSound.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio error:', e);
            }
            
            // Remove the cursor class from the current cursor element
            if (activeCursor) {
                activeCursor.classList.remove('blink');
                activeCursor.style.display = 'none';
            }
            
            // Process command
            processCommand(command);
        } else {
            // Play typing sound
            try {
                typingSound.currentTime = 0;
                typingSound.play().catch(e => {});
            } catch (e) {}
        }
    });
    
    // Simulate typing when user types with improved visual feedback
    document.addEventListener('keydown', function(e) {
        if (e.key.length === 1 || e.key === 'Backspace') {
            // Make sure we're only working with the active cursor
            const cursorElement = document.querySelector('.terminal-cursor.blink');
            if (!cursorElement) return;
            
            let textElement = cursorElement.parentElement.querySelector('.terminal-text');
            
            if (!textElement) {
                textElement = document.createElement('span');
                textElement.className = 'terminal-text';
                textElement.textContent = '';
                cursorElement.parentElement.insertBefore(textElement, cursorElement);
            }
            
            if (e.key === 'Backspace') {
                textElement.textContent = textElement.textContent.slice(0, -1);
            } else {
                // Add glowing effect to cursor when typing
                cursorElement.style.boxShadow = 'var(--neon-glow)';
                setTimeout(() => {
                    cursorElement.style.boxShadow = 'none';
                }, 100);
                
                textElement.textContent += e.key;
            }
            
            e.preventDefault();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (window.gameActive) {
            // Handle game controls
            handleGameControls(e);
            return;
        }
        
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    // Add auto-complete functionality with Tab key
    document.addEventListener('keydown', function(e) {
        if (window.gameActive) return; // Don't process tab when game is active
        
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Make sure we're only working with the active cursor
            const cursorElement = document.querySelector('.terminal-cursor.blink');
            if (!cursorElement) return;
            
            let textElement = cursorElement.parentElement.querySelector('.terminal-text');
            
            if (textElement) {
                const currentText = textElement.textContent;
                const commands = ['help', 'ls', 'about', 'skills', 'contact', 'clear', 'projects', 'experience', 'education', 'theme'];
                
                // Find matching commands
                const matchingCommands = commands.filter(cmd => cmd.startsWith(currentText));
                
                if (matchingCommands.length === 1) {
                    // Complete the command if there's only one match
                    textElement.textContent = matchingCommands[0];
                } else if (matchingCommands.length > 1) {
                    // Show available options
                    const outputElement = document.createElement('div');
                    outputElement.className = 'terminal-output';
                    
                    let outputHTML = '<div class="terminal-line">Available completions:</div>';
                    matchingCommands.forEach(cmd => {
                        outputHTML += `<div class="terminal-line">- ${cmd}</div>`;
                    });
                    
                    outputElement.innerHTML = outputHTML;
                    cursorElement.parentElement.parentNode.insertBefore(outputElement, cursorElement.parentElement.nextSibling);
                    
                    // Remove the cursor class from the current cursor element
                    if (cursorElement) {
                        cursorElement.classList.remove('blink');
                        cursorElement.style.display = 'none';
                    }
                    
                    // Add new prompt line
                    addNewPromptLine();
                    
                    // Scroll to bottom
                    const terminalBody = document.querySelector('.terminal-body');
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                }
            }
        }
    });
    
    function handleGameControls(e) {
        if (e.key === 'Escape') {
            endGame();
            return;
        }
        
        if (e.key === ' ' || e.key === 'ArrowUp') {
            // Jump or shoot action
            shootLaser();
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            moveCharacter('left');
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            moveCharacter('right');
            e.preventDefault();
        }
    }
    
    function moveCharacter(direction) {
        if (!window.gameActive) return;
        
        const character = document.querySelector('.game-character');
        if (!character) return;
        
        // Get current position
        let currentLeft = 50; // Default to center
        
        // Check if character has a left position set
        if (character.style.left) {
            // Remove the % sign and parse as float
            currentLeft = parseFloat(character.style.left);
        } else if (character.style.transform && character.style.transform.includes('translateX')) {
            // If using transform, extract the value
            currentLeft = 50; // Default if transform is used
        }
        
        // Calculate new position
        let newLeft = currentLeft;
        if (direction === 'left') {
            newLeft = Math.max(5, currentLeft - 5);
        } else if (direction === 'right') {
            newLeft = Math.min(95, currentLeft + 5);
        }
        
        // Update character position
        character.style.transform = ''; // Remove transform if it exists
        character.style.left = `${newLeft}%`;
    }
    
    function shootLaser() {
        if (!window.gameActive) return;
        
        const gameArea = document.querySelector('.game-area');
        const character = document.querySelector('.game-character');
        
        if (!gameArea || !character) return;
        
        // Get character position
        const characterRect = character.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // Calculate relative position in percentage
        const characterLeft = ((characterRect.left + characterRect.width / 2) - gameAreaRect.left) / gameAreaRect.width * 100;
        
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
                if (!hitDetected && checkCollision(laser, target)) {
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
    }
    
    function checkCollision(laser, target) {
        // Get positions directly from style properties
        const laserTop = parseFloat(laser.style.top || '0');
        const laserLeft = parseFloat(laser.style.left || '0');
        const targetTop = parseFloat(target.style.top || '0');
        const targetLeft = parseFloat(target.style.left || '0');
        
        // Simple collision detection based on positions
        const laserRight = laserLeft + 2; // Laser width is small
        const laserBottom = laserTop + 15; // Laser height
        const targetRight = targetLeft + 5; // Target width
        const targetBottom = targetTop + 5; // Target height
        
        // Check if laser hit target using percentage-based positions
        if (!(laserRight < targetLeft - 5 || 
              laserLeft > targetRight + 5 || 
              laserBottom < targetTop - 5 || 
              laserTop > targetBottom + 5)) {
            
            // Hit! Increment score directly
            console.log("Hit! Adding 10 points to score:", window.gameScore);
            window.gameScore += 10;
            
            // Update score display
            document.querySelector('.game-score').textContent = `Score: ${window.gameScore}`;
            
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
                        scorePopup.remove();
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
    }
    
    function incrementScore(points = 10) {
        window.gameScore += points;
        console.log(`Score increased by ${points}. New score: ${window.gameScore}`);
        updateGameScore();
        
        // Show score popup
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            const scorePopup = document.createElement('div');
            scorePopup.className = 'score-popup';
            scorePopup.textContent = `+${points}`;
            
            // Set color based on points
            if (points === 5) {
                scorePopup.style.color = '#00ff00'; // Green for dodge
            } else {
                scorePopup.style.color = 'var(--accent-color)'; // Red for hits
            }
            
            // Random position near the top
            const randomLeft = Math.floor(Math.random() * 70) + 15;
            scorePopup.style.left = `${randomLeft}%`;
            scorePopup.style.top = '30%';
            
            gameArea.appendChild(scorePopup);
            
            // Animate and remove
            setTimeout(() => {
                scorePopup.style.opacity = '0';
                scorePopup.style.top = '10%';
                
                setTimeout(() => {
                    scorePopup.remove();
                }, 500);
            }, 10);
        }
    }
    
    function updateGameScore() {
        const scoreElement = document.querySelector('.game-score');
        if (scoreElement) {
            console.log(`Updating score display to: ${window.gameScore}`);
            scoreElement.textContent = `Score: ${window.gameScore}`;
        } else {
            console.error("Score element not found!");
        }
    }
    
    function startGame() {
        window.gameActive = true;
        window.gameScore = 0;
        console.log("Game started. Score reset to 0");
        
        // Create game container
        const terminalBody = document.querySelector('.terminal-body');
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container';
        gameContainer.innerHTML = `
            <div class="game-header">
                <div class="game-score">Score: 0</div>
                <div class="game-timer">Time: 30s</div>
            </div>
            <div class="game-area">
                <div class="game-character">🚀</div>
            </div>
            <div class="game-instructions">
                Use LEFT/RIGHT arrows to move. SPACE or UP to shoot. ESC to exit.
            </div>
        `;
        
        terminalBody.appendChild(gameContainer);
        
        // Add multiple enemies
        const gameArea = document.querySelector('.game-area');
        for (let i = 0; i < 3; i++) {
            const enemy = document.createElement('div');
            enemy.className = 'game-target';
            enemy.textContent = '👾';
            enemy.style.left = `${Math.random() * 80}%`;
            enemy.style.top = `${10 + (i * 15)}%`;
            enemy.dataset.speed = Math.random() * 2 + 1; // Random speed for each enemy
            gameArea.appendChild(enemy);
        }
        
        // Add CSS for game elements
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .game-area {
                position: relative;
                height: 300px;
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                overflow: hidden;
                margin-top: 10px;
            }
            .game-character {
                position: absolute;
                bottom: 10%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 24px;
                transition: left 0.1s ease;
            }
            .game-target {
                position: absolute;
                font-size: 20px;
                transition: top 0.2s linear;
            }
            .game-target.hit {
                color: red;
                transform: scale(1.5);
            }
            .game-laser {
                position: absolute;
                width: 2px;
                height: 15px;
                background-color: #ff0066;
                box-shadow: 0 0 5px #ff0066, 0 0 10px #ff0066;
            }
            .score-popup {
                position: absolute;
                font-size: 16px;
                font-weight: bold;
                pointer-events: none;
                transition: all 0.5s ease;
            }
            .game-header {
                display: flex;
                justify-content: space-between;
                padding: 10px;
            }
            .game-score, .game-timer {
                font-size: 18px;
                color: var(--primary-color);
            }
            .game-instructions {
                text-align: center;
                margin-top: 10px;
                font-size: 14px;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(styleElement);
        
        // Start game timer and enemy movement
        let timeLeft = 30;
        const gameTimer = setInterval(() => {
            timeLeft--;
            const timerElement = document.querySelector('.game-timer');
            if (timerElement) {
                timerElement.textContent = `Time: ${timeLeft}s`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                endGame();
            }
        }, 1000);
        
        // More frequent enemy movement for smoother gameplay
        const enemyMoveTimer = setInterval(() => {
            if (window.gameActive) {
                moveAllEnemies();
            } else {
                clearInterval(enemyMoveTimer);
            }
        }, 200);
        
        // Store timer references
        gameContainer.dataset.timerId = gameTimer;
        gameContainer.dataset.enemyTimerId = enemyMoveTimer;
        
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    
    function moveAllEnemies() {
        const targets = document.querySelectorAll('.game-target');
        targets.forEach(target => {
            const speed = parseFloat(target.dataset.speed) || 1;
            const currentY = parseFloat(target.style.top || '10');
            
            // Move target down based on its speed
            const newY = currentY + speed;
            target.style.top = `${newY}%`;
            
            // If target would go off screen, reset to top and check for score
            if (newY > 85) {
                // Award points for successfully avoiding the enemy
                console.log("Enemy passed! Adding 5 points to score:", window.gameScore);
                
                // Update score directly in DOM
                window.gameScore += 5;
                document.querySelector('.game-score').textContent = `Score: ${window.gameScore}`;
                
                // Show visual feedback
                showDodgeMessage(target);
                
                // Reset enemy to top at random position
                target.style.top = '5%';
                target.style.left = `${Math.random() * 80}%`;
            }
        });
    }
    
    function showDodgeMessage(target) {
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
    }
    
    function endGame() {
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
        addNewPromptLine();
        
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    
    function activateEasterEgg() {
        // Add a new terminal line with a special message
        const terminalBody = document.querySelector('.terminal-body');
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line';
        newLine.innerHTML = `
            <span class="terminal-prompt">visitor@portfolio:~$</span>
            <span class="terminal-text">sudo access-secret-project</span>
        `;
        
        const outputLine = document.createElement('div');
        outputLine.className = 'terminal-output easter-egg';
        outputLine.innerHTML = `
            <div class="terminal-line">
                <span class="success">Access granted! You found the secret mini-game!</span>
            </div>
            <div class="terminal-line">
                <span class="comment">Starting space shooter mini-game...</span>
            </div>
        `;
        
        // Remove the cursor class from the current cursor element
        const currentCursor = document.querySelector('.terminal-cursor.blink');
        if (currentCursor) {
            currentCursor.classList.remove('blink');
            currentCursor.style.display = 'none';
        }
        
        terminalBody.appendChild(newLine);
        
        // Add typing effect to the output
        setTimeout(() => {
            terminalBody.appendChild(outputLine);
            
            // Add matrix-like effect to the terminal background temporarily
            const terminalContainer = document.querySelector('.terminal-container');
            terminalContainer.classList.add('matrix-effect');
            
            setTimeout(() => {
                terminalContainer.classList.remove('matrix-effect');
                
                // Start the mini-game
                console.log("Konami code activated! Starting game...");
                startGame();
            }, 1500);
        }, 500);
    }
    
    function processCommand(command) {
        const terminalBody = document.querySelector('.terminal-body');
        let outputHTML = '';
        
        // Simple command processing with enhanced responses
        if (command.includes('help')) {
            outputHTML = `
                <div class="terminal-line"><span class="keyword">Available commands:</span></div>
                <div class="terminal-line">- <span class="command">help</span>: Show this help message</div>
                <div class="terminal-line">- <span class="command">ls</span>: List portfolio sections</div>
                <div class="terminal-line">- <span class="command">about</span>: Show information about me</div>
                <div class="terminal-line">- <span class="command">skills</span>: List my technical skills</div>
                <div class="terminal-line">- <span class="command">projects</span>: View my projects</div>
                <div class="terminal-line">- <span class="command">contact</span>: How to reach me</div>
                <div class="terminal-line">- <span class="command">theme</span>: Toggle dark/light theme</div>
                <div class="terminal-line">- <span class="command">clear</span>: Clear the terminal</div>
                <div class="terminal-line">- <span class="command">konami</span>: ???</div>
            `;
        } else if (command.includes('ls')) {
            outputHTML = `
                <div class="terminal-line">
                    <a href="pages/Portfolio.html" class="terminal-link">portfolio.html</a> - My developer showcase
                </div>
                <div class="terminal-line">
                    <a href="pages/HTML Reference Page.html" class="terminal-link">reference.html</a> - HTML reference guide
                </div>
                <div class="terminal-line">
                    <a href="pages/contact.html" class="terminal-link">contact.html</a> - Get in touch
                </div>
            `;
        } else if (command.includes('about')) {
            outputHTML = `
                <div class="terminal-line"><span class="keyword">Hi, I'm Irie Coffelt!</span></div>
                <div class="terminal-line">I'm a passionate developer with a focus on web technologies.</div>
                <div class="terminal-line">My mission is to create beautiful, functional, and user-friendly digital experiences.</div>
                <div class="terminal-line">Check out my <a href="pages/Portfolio.html" class="terminal-link">portfolio</a> to see my work!</div>
            `;
        } else if (command.includes('skills')) {
            outputHTML = `
                <div class="terminal-line"><span class="keyword">Technical Skills:</span></div>
                <div class="terminal-line">- <span class="variable">Frontend</span>: HTML5, CSS3, JavaScript, Bootstrap</div>
                <div class="terminal-line">- <span class="variable">Design</span>: UI/UX, Responsive Design, Animation</div>
                <div class="terminal-line">- <span class="variable">Tools</span>: Git, VS Code, Responsive Testing</div>
                <div class="terminal-line">For more details, visit my <a href="pages/Portfolio.html#skills" class="terminal-link">skills section</a>.</div>
            `;
        } else if (command.includes('projects')) {
            outputHTML = `
                <div class="terminal-line"><span class="keyword">Featured Projects:</span></div>
                <div class="terminal-line">- <span class="variable">Project Alpha</span>: A responsive web application</div>
                <div class="terminal-line">- <span class="variable">Project Beta</span>: An interactive dashboard</div>
                <div class="terminal-line">- <span class="variable">Project Gamma</span>: Creative animations</div>
                <div class="terminal-line">View all projects in my <a href="pages/Portfolio.html#projects" class="terminal-link">portfolio</a>.</div>
            `;
        } else if (command.includes('contact')) {
            outputHTML = `
                <div class="terminal-line"><span class="keyword">Contact Information:</span></div>
                <div class="terminal-line">- <span class="variable">Email</span>: iriecoffelt@gmail.com</div>
                <div class="terminal-line">- <span class="variable">LinkedIn</span>: linkedin.com/in/irie-coffelt-2a92a8b0</div>
                <div class="terminal-line">- <span class="variable">GitHub</span>: github.com/iriecoffelt</div>
                <div class="terminal-line">- <a href="pages/contact.html" class="terminal-link">Contact Page</a></div>
            `;
        } else if (command.includes('theme')) {
            // Toggle between light and dark theme
            document.body.classList.toggle('light-theme');
            
            if (document.body.classList.contains('light-theme')) {
                outputHTML = `<div class="terminal-line"><span class="success">Theme switched to light mode.</span></div>`;
            } else {
                outputHTML = `<div class="terminal-line"><span class="success">Theme switched to dark mode.</span></div>`;
            }
        } else if (command.includes('clear')) {
            // Clear all but keep the first line
            const firstLine = terminalBody.querySelector('.terminal-line');
            terminalBody.innerHTML = '';
            terminalBody.appendChild(firstLine);
            
            // Add new prompt line
            addNewPromptLine();
            return;
        } else if (command.includes('konami')) {
            outputHTML = `
                <div class="terminal-line">Hint: Try the Konami code...</div>
                <div class="terminal-line">↑ ↑ ↓ ↓ ← → ← → B A</div>
            `;
        } else if (command.includes('access-secret-project') || command.includes('secret')) {
            outputHTML = `
                <div class="terminal-line">
                    <span class="error">Access denied. Proper authentication required.</span>
                </div>
                <div class="terminal-line">
                    <span class="comment">Hint: Try the Konami code...</span>
                </div>
            `;
        } else if (command.trim() !== '') {
            outputHTML = `<div class="terminal-line"><span class="error">Command not found: ${command}</span></div>
                          <div class="terminal-line">Type <span class="command">help</span> for available commands.</div>`;
        }
        
        if (outputHTML) {
            const outputElement = document.createElement('div');
            outputElement.className = 'terminal-output';
            
            // Add typing effect to the output
            const terminalContainer = document.querySelector('.terminal-container');
            terminalContainer.classList.add('processing');
            
            setTimeout(() => {
                outputElement.innerHTML = outputHTML;
                terminalBody.appendChild(outputElement);
                
                // Add new prompt line
                addNewPromptLine();
                
                // Scroll to bottom
                terminalBody.scrollTop = terminalBody.scrollHeight;
                
                terminalContainer.classList.remove('processing');
            }, 300);
        } else {
            // Add new prompt line
            addNewPromptLine();
            
            // Scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }
    
    function addNewPromptLine() {
        const terminalBody = document.querySelector('.terminal-body');
        
        // Remove the blink class from all existing cursors
        const existingCursors = document.querySelectorAll('.terminal-cursor.blink');
        existingCursors.forEach(cursor => {
            cursor.classList.remove('blink');
            cursor.style.display = 'none';
        });
        
        const newPromptLine = document.createElement('div');
        newPromptLine.className = 'terminal-line';
        newPromptLine.innerHTML = `
            <span class="terminal-prompt">visitor@portfolio:~$</span>
            <span class="terminal-cursor blink"></span>
        `;
        terminalBody.appendChild(newPromptLine);
    }
    
    // Initialize - ensure only one active cursor when the page loads
    function initializeTerminal() {
        // Wait a short moment to ensure DOM is fully loaded
        setTimeout(() => {
            const existingCursors = document.querySelectorAll('.terminal-cursor');
            if (existingCursors.length > 0) {
                // Remove blink from all cursors except the last one
                for (let i = 0; i < existingCursors.length - 1; i++) {
                    existingCursors[i].classList.remove('blink');
                    existingCursors[i].style.display = 'none';
                }
                // Make sure the last cursor has the blink class
                existingCursors[existingCursors.length - 1].classList.add('blink');
            }
        }, 200);
    }
    
    // Call initialization
    initializeTerminal();
    
    // Add CSS for new effects
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .terminal-container.processing:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            animation: gradientBG 1s linear infinite;
            background-size: 200% 200%;
            z-index: 10;
        }
        
        .terminal-container.matrix-effect {
            animation: matrixEffect 3s forwards;
        }
        
        @keyframes matrixEffect {
            0% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3); }
            50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.7), 0 0 50px rgba(0, 255, 0, 0.5); }
            100% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3); }
        }
        
        .command {
            color: var(--primary-color);
            font-weight: bold;
        }
        
        /* Game styles */
        .game-container {
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid var(--primary-color);
            box-shadow: var(--neon-glow);
        }
        
        .game-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px;
            border-bottom: 1px solid var(--primary-color);
        }
        
        .game-score, .game-timer {
            color: var(--primary-color);
            font-weight: bold;
        }
        
        .game-area {
            height: 200px;
            position: relative;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
            background-image: 
                radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
        }
        
        .game-character {
            position: absolute;
            bottom: 10px;
            left: 10px;
            font-size: 24px;
            transition: left 0.2s ease;
        }
        
        .game-target {
            position: absolute;
            top: 20%;
            right: 20%;
            font-size: 24px;
            transition: all 0.5s ease;
        }
        
        .game-target.hit {
            transform: scale(1.5);
            opacity: 0.7;
            color: var(--accent-color);
        }
        
        .game-laser {
            position: absolute;
            width: 2px;
            height: 10px;
            background-color: var(--primary-color);
            box-shadow: 0 0 5px var(--primary-color), 0 0 10px var(--primary-color);
            transition: bottom 0.3s linear;
        }
        
        .score-popup {
            position: absolute;
            color: var(--accent-color);
            font-weight: bold;
            font-size: 16px;
            transition: all 0.5s ease;
            opacity: 1;
            text-shadow: 0 0 5px var(--accent-color);
        }
        
        .dodge-message {
            position: absolute;
            color: #00ff00;
            font-weight: bold;
            font-size: 14px;
            transition: all 0.5s ease;
            opacity: 1;
            text-shadow: 0 0 5px #00ff00;
        }
        
        .game-instructions {
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
            padding: 5px;
        }
        
        .light-theme {
            --primary-color: #0066ff;
            --secondary-color: #6600cc;
            --accent-color: #ff0066;
            --background-dark: #f0f5ff;
            --background-darker: #e0e8ff;
            --text-primary: #333344;
            --text-secondary: #555566;
            --terminal-bg: rgba(240, 245, 255, 0.9);
            --terminal-border: rgba(0, 102, 255, 0.3);
            --terminal-header: rgba(224, 232, 255, 0.9);
            --card-bg: rgba(240, 245, 255, 0.7);
            --card-border: rgba(0, 102, 255, 0.2);
            --neon-glow: 0 0 5px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3);
            --accent-glow: 0 0 5px rgba(255, 0, 102, 0.5), 0 0 20px rgba(255, 0, 102, 0.3);
        }
    `;
    document.head.appendChild(styleElement);
}); 