class FlyingBug {
    constructor() {
        this.element = document.createElement('div');
        this.element.textContent = '🐞';
        this.element.style.position = 'fixed';
        this.element.style.fontSize = '24px';
        this.element.style.zIndex = '9999';
        this.element.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.element.style.transition = 'transform 0.1s linear';
        this.element.style.userSelect = 'none';
        
        // Initial position
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        
        // Velocity
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        
        // State
        this.state = 'WANDERING'; // WANDERING, DOCKING, DOCKED, FLEEING, CHASING
        this.lastStateChange = Date.now();
        this.targetElement = null;
        this.targetX = 0;
        this.targetY = 0;
        
        // Config
        this.speed = 2;
        this.chaseSpeed = 4; // Faster when chasing food
        this.fleeSpeed = 8;
        this.fleeDistance = 150;
        
        // Dynamic Timers
        this.wanderDuration = 0; // Will be set randomly
        this.dockDuration = 0;   // Will be set randomly
        
        // Balls (Food) Management
        this.balls = [];
        
        document.body.appendChild(this.element);
        
        // Mouse tracking
        this.mouseX = -1000;
        this.mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Ball Spawning (Click to feed)
        // Use a wrapper function to ensure 'this' is correct
        this.clickHandler = (e) => this.handleSpawnBall(e);
        document.addEventListener('click', this.clickHandler);
        
        // Music System
        this.audioCtx = null;
        this.songs = [
            // Twinkle Twinkle Little Star
            [1,1,5,5,6,6,5, 4,4,3,3,2,2,1, 5,5,4,4,3,3,2, 5,5,4,4,3,3,2, 1,1,5,5,6,6,5, 4,4,3,3,2,2,1],
            // Little Bee
            [5,3,3, 4,2,2, 1,2,3,4,5,5,5, 5,3,3, 4,2,2, 1,3,5,5,3, 2,2,2,2,2,3,4, 3,3,3,3,3,4,5, 5,3,3, 4,2,2, 1,3,5,5,1],
            // Two Tigers
            [1,2,3,1, 1,2,3,1, 3,4,5, 3,4,5, 5,6,5,4,3,1, 5,6,5,4,3,1, 2,5,1, 2,5,1]
        ];
        this.currentSong = this.songs[Math.floor(Math.random() * this.songs.length)];
        this.currentNoteIndex = 0;

        console.log('FlyingBug: Initialized!');
        
        // Start Wandering
        this.startWandering();
        this.start();
    }
    
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playNote(note) {
        if (!this.audioCtx) this.initAudio();
        
        const frequencies = {
            1: 261.63, // C4
            2: 293.66, // D4
            3: 329.63, // E4
            4: 349.23, // F4
            5: 392.00, // G4
            6: 440.00, // A4
            7: 493.88, // B4
            8: 523.25  // C5
        };
        
        const freq = frequencies[note] || 440;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine'; // Smooth sound
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    }
    
    start() {
        this.loop = this.update.bind(this);
        requestAnimationFrame(this.loop);
    }
    
    handleSpawnBall(e) {
        console.log('FlyingBug: Click detected at', e.clientX, e.clientY);
        
        // Init audio on first click
        this.initAudio();

        // Ignore clicks on interactive elements
        // Removed [onclick] to be safer, added label
        if (e.target.closest('button, a, input, select, textarea, label')) {
            console.log('FlyingBug: Click ignored (interactive element)');
            return;
        }

        console.log('FlyingBug: Spawning note!');
        
        // Get next note
        const note = this.currentSong[this.currentNoteIndex];
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.currentSong.length; // Loop song

        const ball = {
            id: Date.now() + Math.random(),
            x: e.clientX,
            y: e.clientY,
            vy: 2, // Falling speed
            element: document.createElement('div'),
            note: note,
            color: '#4299e1' // Fixed color (Blue)
        };

        // Create inner span for text to counter-rotate
        const textSpan = document.createElement('span');
        textSpan.textContent = note;
        textSpan.style.display = 'block';
        textSpan.style.transform = 'rotate(-45deg)'; 

        // Style the ball (Note)
        ball.element.style.display = 'flex';
        ball.element.style.justifyContent = 'center';
        ball.element.style.alignItems = 'center';
        ball.element.style.position = 'fixed';
        ball.element.style.width = '24px';
        ball.element.style.height = '24px';
        ball.element.style.color = 'white';
        ball.element.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'; // Stroke effect for visibility
        ball.element.style.fontWeight = 'bold';
        ball.element.style.fontSize = '16px'; // Slightly larger
        ball.element.style.backgroundColor = ball.color;
        ball.element.style.borderRadius = '0 50% 50% 50%'; // Water drop shape
        ball.element.style.transform = 'rotate(45deg)';
        ball.element.style.zIndex = '9998';
        ball.element.style.pointerEvents = 'none';
        ball.element.style.left = (ball.x - 12) + 'px'; // Center it (24/2)
        ball.element.style.top = (ball.y - 12) + 'px';
        ball.element.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.3)';
        
        document.body.appendChild(ball.element);
        this.balls.push(ball);
    }

    getRandomColor() {
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFFF33', '#FF33A8', '#33FFF5'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Helper: Random Range
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    startWandering() {
        this.state = 'WANDERING';
        this.lastStateChange = Date.now();
        // Fly for 5-10 seconds
        this.wanderDuration = this.randomRange(5000, 10000);
        
        // Set random velocity if stopped
        if (this.vx === 0 && this.vy === 0) {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
        }
    }

    startDocking() {
        // User requested: "Just stop where it is"
        this.state = 'RESTING';
        this.lastStateChange = Date.now();
        this.vx = 0;
        this.vy = 0;
        // Rest for 30-120 seconds
        this.dockDuration = this.randomRange(30000, 120000);
    }

    update() {
        const now = Date.now();
        
        // Update Balls first
        this.updateBalls();

        // 1. Check Mouse Distance (Highest Priority - Flee)
        const dxMouse = this.x - this.mouseX;
        const dyMouse = this.y - this.mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < this.fleeDistance) {
            this.state = 'FLEEING';
            // Vector away from mouse
            const angle = Math.atan2(dyMouse, dxMouse);
            this.vx = Math.cos(angle) * this.fleeSpeed;
            this.vy = Math.sin(angle) * this.fleeSpeed;
        } else {
            // If not fleeing, check for food (balls)
            const targetBall = this.findClosestBall();
            
            if (this.state === 'FLEEING' && distMouse > this.fleeDistance + 50) {
                // Safe distance reached, return to normal
                this.startWandering();
            } else if (targetBall) {
                // Found food! Chase it!
                this.state = 'CHASING';
                const dx = targetBall.x - this.x;
                const dy = targetBall.y - this.y;
                const angle = Math.atan2(dy, dx);
                
                // Move towards ball
                this.vx = Math.cos(angle) * this.chaseSpeed;
                this.vy = Math.sin(angle) * this.chaseSpeed;

                // Check collision (Eat)
                const distBall = Math.sqrt(dx*dx + dy*dy);
                if (distBall < 20) {
                    this.eatBall(targetBall);
                }
            } else if (this.state === 'CHASING' && !targetBall) {
                // Food gone, wander
                this.startWandering();
            }
        }
        
        // 2. State Machine (Lower priority behaviors)
        switch (this.state) {
            case 'WANDERING':
                // Randomly change direction slightly
                if (Math.random() < 0.05) {
                    this.vx += (Math.random() - 0.5);
                    this.vy += (Math.random() - 0.5);
                    // Cap speed
                    const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                    if (speed > this.speed) {
                        this.vx = (this.vx / speed) * this.speed;
                        this.vy = (this.vy / speed) * this.speed;
                    }
                }
                
                // Check if wander time is over
                if (now - this.lastStateChange > this.wanderDuration) {
                    this.startDocking();
                }
                break;
                
            case 'RESTING':
                // Just sit there.
                // Check if rest time is over
                if (now - this.lastStateChange > this.dockDuration) {
                    this.startWandering();
                }
                break;
        }
        
        // 3. Move
        this.x += this.vx;
        this.y += this.vy;
        
        // 4. Boundary Check (Bounce)
        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > window.innerWidth - 30) { this.x = window.innerWidth - 30; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > window.innerHeight - 30) { this.y = window.innerHeight - 30; this.vy *= -1; }
        
        // 5. Render
        // Only rotate if moving
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
             const rotation = Math.atan2(this.vy, this.vx) * 180 / Math.PI + 90;
             this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${rotation}deg)`;
        } else {
             // Keep last rotation
             this.element.style.transform = this.element.style.transform;
        }
        
        requestAnimationFrame(this.loop);
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.y += ball.vy;
            ball.element.style.top = ball.y + 'px';

            // Remove if off screen
            if (ball.y > window.innerHeight) {
                ball.element.remove();
                this.balls.splice(i, 1);
            }
        }
    }

    findClosestBall() {
        let closest = null;
        let minDist = Infinity;
        for (const ball of this.balls) {
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const dist = dx*dx + dy*dy;
            if (dist < minDist) {
                minDist = dist;
                closest = ball;
            }
        }
        return closest;
    }

    eatBall(ball) {
        // Play Sound!
        this.playNote(ball.note);

        // Remove ball
        ball.element.remove();
        this.balls = this.balls.filter(b => b.id !== ball.id);
        
        // Visual feedback
        const originalSize = this.element.style.fontSize;
        this.element.style.fontSize = '32px'; // Grow!
        this.element.textContent = '😋'; // Yummy face
        
        setTimeout(() => {
            this.element.style.fontSize = '24px';
            this.element.textContent = '🐞';
        }, 500);
        
        // Return to wandering briefly
        this.startWandering();
    }
    
    findDockTarget() {
        // Find all tool cards (anchor tags inside the grid)
        const targets = document.querySelectorAll('a.block'); // Assuming tool cards are <a> tags with class 'block'
        if (targets.length > 0) {
            this.targetElement = targets[Math.floor(Math.random() * targets.length)];
            this.state = 'DOCKING';
        }
    }
}

// Expose globally
window.FlyingBug = FlyingBug;