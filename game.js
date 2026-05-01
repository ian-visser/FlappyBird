class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        this.highScoreElement = document.getElementById('highScoreValue');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverHighScoreElement = document.getElementById('gameOverHighScore');
        this.startScreenElement = document.getElementById('startScreen');
        this.startHighScoreElement = document.getElementById('startHighScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.startBtn = document.getElementById('startBtn');
        
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBirdHighScore') || 0;
        
        // Bird properties
        this.bird = {
            x: 80,
            y: 300,
            width: 34,
            height: 24,
            velocity: 0,
            gravity: 0.1,
            jumpStrength: -4,
            rotation: 0
        };
        
        // Pipes properties
        this.pipes = [];
        this.pipeWidth = 52;
        this.basePipeGap = 180; // Start with larger gap
        this.pipeGap = 180;
        this.basePipeSpeed = 1.5; // Start slower
        this.pipeSpeed = 1.5;
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 120; // Start with longer interval
        
        // Background elements
        this.clouds = [];
        this.ground = {
            x: 0,
            y: this.canvas.height - 100,
            width: this.canvas.width,
            height: 100
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateClouds();
        this.updateHighScoreDisplay();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
            }
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('click', this.handleJump.bind(this));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        // Button controls
        this.restartBtn.addEventListener('click', () => this.restart());
        this.startBtn.addEventListener('click', () => this.start());
    }
    
    handleJump() {
        if (this.gameState === 'playing') {
            this.bird.velocity = this.bird.jumpStrength;
        } else if (this.gameState === 'start') {
            this.start();
        } else if (this.gameState === 'gameOver') {
            this.restart();
        }
    }
    
    start() {
        this.gameState = 'playing';
        this.startScreenElement.style.display = 'none';
        this.gameOverElement.style.display = 'none';
        this.resetGame();
    }
    
    restart() {
        this.gameState = 'playing';
        this.gameOverElement.style.display = 'none';
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.pipeSpawnTimer = 0;
    }
    
    generateClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }
    
    updateDifficulty() {
        // Increase difficulty every 5 points
        const difficultyLevel = Math.floor(this.score / 5);
        
        // Gradually decrease pipe gap (but never below 120)
        this.pipeGap = Math.max(120, this.basePipeGap - (difficultyLevel * 10));
        
        // Gradually increase pipe speed (but never above 3)
        this.pipeSpeed = Math.min(3, this.basePipeSpeed + (difficultyLevel * 0.2));
        
        // Gradually decrease spawn interval (but never below 80)
        this.pipeSpawnInterval = Math.max(80, 120 - (difficultyLevel * 5));
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update difficulty based on score
        this.updateDifficulty();
        
        // Update bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Check boundaries
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        if (this.bird.y + this.bird.height > this.ground.y) {
            this.gameOver();
        }
        
        // Update pipes
        this.updatePipes();
        
        // Update clouds
        this.updateClouds();
        
        // Update ground
        this.ground.x -= this.pipeSpeed;
        if (this.ground.x <= -this.ground.width) {
            this.ground.x = 0;
        }
    }
    
    updatePipes() {
        // Spawn new pipes
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.spawnPipe();
            this.pipeSpawnTimer = 0;
        }
        
        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
            
            // Update score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }
        }
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 200;
            }
        });
    }
    
    spawnPipe() {
        const minHeight = 100;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 100;
        const height = minHeight + Math.random() * maxHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: height,
            bottomY: height + this.pipeGap,
            passed: false
        });
    }
    
    checkCollision(pipe) {
        const birdBox = {
            left: this.bird.x,
            right: this.bird.x + this.bird.width,
            top: this.bird.y,
            bottom: this.bird.y + this.bird.height
        };
        
        const pipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: 0,
            bottom: pipe.topHeight
        };
        
        const bottomPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: pipe.bottomY,
            bottom: this.canvas.height
        };
        
        return (this.isColliding(birdBox, pipeBox) || 
                this.isColliding(birdBox, bottomPipeBox));
    }
    
    isColliding(box1, box2) {
        return box1.left < box2.right &&
               box1.right > box2.left &&
               box1.top < box2.bottom &&
               box1.bottom > box2.top;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.finalScoreElement.textContent = this.score;
        this.gameOverHighScoreElement.textContent = this.bestScore;
        this.gameOverElement.style.display = 'block';
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBirdHighScore', this.bestScore);
            this.updateHighScoreDisplay();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8E8');
        gradient.addColorStop(1, '#B0E0E6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPipes() {
        this.pipes.forEach(pipe => {
            // Pipe gradients for 3D effect
            const pipeGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            pipeGradient.addColorStop(0, '#27ae60');
            pipeGradient.addColorStop(0.3, '#2ecc71');
            pipeGradient.addColorStop(0.7, '#27ae60');
            pipeGradient.addColorStop(1, '#229954');
            
            const lipGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            lipGradient.addColorStop(0, '#1e8449');
            lipGradient.addColorStop(0.5, '#239b56');
            lipGradient.addColorStop(1, '#1e8449');
            
            // TOP PIPE
            // Main pipe body
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x + 8, 0, this.pipeWidth - 16, pipe.topHeight);
            
            // Left lip/edge
            this.ctx.fillStyle = lipGradient;
            this.ctx.fillRect(pipe.x, 0, 8, pipe.topHeight);
            
            // Right lip/edge
            this.ctx.fillRect(pipe.x + this.pipeWidth - 8, 0, 8, pipe.topHeight);
            
            // Top cap with lips
            this.ctx.fillStyle = lipGradient;
            this.ctx.fillRect(pipe.x - 8, pipe.topHeight - 35, this.pipeWidth + 16, 35);
            
            // Top cap inner part
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, pipe.topHeight - 30, this.pipeWidth, 30);
            
            // BOTTOM PIPE
            // Main pipe body
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x + 8, pipe.bottomY, this.pipeWidth - 16, this.canvas.height - pipe.bottomY);
            
            // Left lip/edge
            this.ctx.fillStyle = lipGradient;
            this.ctx.fillRect(pipe.x, pipe.bottomY, 8, this.canvas.height - pipe.bottomY);
            
            // Right lip/edge
            this.ctx.fillRect(pipe.x + this.pipeWidth - 8, pipe.bottomY, 8, this.canvas.height - pipe.bottomY);
            
            // Bottom cap with lips
            this.ctx.fillStyle = lipGradient;
            this.ctx.fillRect(pipe.x - 8, pipe.bottomY, this.pipeWidth + 16, 35);
            
            // Bottom cap inner part
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, 30);
            
            // Add very subtle highlights for 3D effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(pipe.x + 2, 0, 2, pipe.topHeight);
            this.ctx.fillRect(pipe.x + 2, pipe.bottomY, 2, this.canvas.height - pipe.bottomY);
            
            // Add very subtle shadows for depth
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(pipe.x + this.pipeWidth - 4, 0, 4, pipe.topHeight);
            this.ctx.fillRect(pipe.x + this.pipeWidth - 4, pipe.bottomY, 4, this.canvas.height - pipe.bottomY);
        });
    }
    
    drawGround() {
        // Ground gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.ground.y, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#8B7355');
        groundGradient.addColorStop(0.5, '#6B5D4F');
        groundGradient.addColorStop(1, '#5C4E3F');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(this.ground.x, this.ground.y, this.ground.width, this.ground.height);
        this.ctx.fillRect(this.ground.x + this.ground.width, this.ground.y, this.ground.width, this.ground.height);
        
        // Ground texture lines
        this.ctx.strokeStyle = '#4A3F2F';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = this.ground.y + i * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ground.x, y);
            this.ctx.lineTo(this.ground.x + this.ground.width * 2, y);
            this.ctx.stroke();
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Move to bird position and rotate
        this.ctx.translate(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Simple bird body - classic Flappy Bird style
        this.ctx.fillStyle = '#FDB813';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple white belly
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 2, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple eye
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(8, -3, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(9, -3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple beak
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(22, 2);
        this.ctx.lineTo(15, 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Simple wing
        const wingFlap = Math.sin(Date.now() * 0.01) * 3;
        this.ctx.fillStyle = '#FDB813';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, 2 + wingFlap, 8, 10, -20 * Math.PI / 180, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple wing outline
        this.ctx.strokeStyle = '#E67E22';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(-5, 2 + wingFlap, 8, 10, -20 * Math.PI / 180, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.bestScore;
        this.startHighScoreElement.textContent = this.bestScore;
        this.gameOverHighScoreElement.textContent = this.bestScore;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new FlappyBirdGame();
});
