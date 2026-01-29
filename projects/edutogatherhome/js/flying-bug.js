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
        this.state = 'WANDERING'; // WANDERING, DOCKING, DOCKED, FLEEING
        this.lastStateChange = Date.now();
        this.targetElement = null;
        this.targetX = 0;
        this.targetY = 0;
        
        // Config
        this.speed = 2;
        this.fleeSpeed = 8;
        this.fleeDistance = 150;
        
        // Dynamic Timers
        this.wanderDuration = 0; // Will be set randomly
        this.dockDuration = 0;   // Will be set randomly
        
        document.body.appendChild(this.element);
        
        // Mouse tracking
        this.mouseX = -1000;
        this.mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Start Wandering
        this.startWandering();
        this.start();
    }
    
    start() {
        this.loop = this.update.bind(this);
        requestAnimationFrame(this.loop);
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
        } else if (this.state === 'FLEEING' && distMouse > this.fleeDistance + 50) {
            // After fleeing, go back to wandering
            this.startWandering();
        }
        
        // 2. State Machine
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
             // Keep last rotation or reset? Let's keep last rotation but maybe "breathe"
             // Use current transform but without changing coords
             this.element.style.transform = this.element.style.transform;
        }
        
        requestAnimationFrame(this.loop);
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
