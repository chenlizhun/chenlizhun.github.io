// Core Game Logic
const App = {
    state: {
        isPlaying: false,
        currentLessonIndex: 0,
        currentIndex: 0,
        text: "",
        mistakes: 0,
        startTime: null,
        combo: 0,
        maxCombo: 0,
        maxUnlockedLevel: parseInt(localStorage.getItem('typeasy_maxUnlockedLevel') || '0'),
    },

    async init() {
        this.cacheDOM();
        
        // Init Auth
        if (window.EduAuth) {
            await EduAuth.init();
            this.checkUser();
        }

        this.bindEvents();
        this.renderKeyboard();
        SoundManager.init(); // Init audio context
        this.loadLesson(this.state.currentLessonIndex); // Use current index
        console.log("Typeasy initialized!");
    },

    checkUser() {
        const session = EduAuth.getSession();
        const userEl = document.getElementById('user-display');
        const familyEl = document.getElementById('family-display');
        
        if (session.isAuthenticated) {
            let name = session.user.nickname;
            // Try to find kid name
            if (session.kidId && session.kids) {
                const kid = session.kids.find(k => k._id === session.kidId);
                if (kid) name = kid.name;
            }
            userEl.innerText = `👤 ${name}`;
            
            // Show Family Name
            if (session.family) {
                familyEl.innerText = `🏠 ${session.family.name}`;
                familyEl.style.display = 'block';
            }
        } else {
            userEl.innerText = `👤 访客`;
            familyEl.style.display = 'none';
        }
    },

    cacheDOM() {
        this.dom = {
            display: document.querySelector('.display-area'),
            startBtn: document.querySelector('.btn-start'),
            overlay: document.querySelector('.overlay'),
            keys: document.querySelectorAll('.key'),
            wpm: document.getElementById('wpm-value'),
            accuracy: document.getElementById('accuracy-value'),
            levelTitle: document.querySelector('.stat-item'), // First stat item
            overlayTitle: document.querySelector('.overlay h1'),
            overlayDesc: document.querySelector('.overlay p'),
            combo: document.getElementById('combo-display'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            btnSound: document.getElementById('btn-sound'),
            // Level Menu Elements
            btnLevelMenu: document.getElementById('btn-level-menu'),
            levelMenu: document.getElementById('level-menu'),
            btnCloseMenu: document.getElementById('btn-close-menu'),
            levelGrid: document.getElementById('level-grid'),
        };
    },
    
    renderLevelMenu() {
        if (!this.dom.levelGrid) return;
        
        const html = LESSONS.map((lesson, index) => {
            const isLocked = index > this.state.maxUnlockedLevel;
            const isCompleted = index < this.state.maxUnlockedLevel;
            const isCurrent = index === this.state.currentLessonIndex;
            
            let statusIcon = '';
            if (isLocked) statusIcon = '🔒';
            else if (isCompleted) statusIcon = '✅';
            else statusIcon = '⭐️';

            let classes = 'level-card';
            if (isLocked) classes += ' locked';
            if (isCurrent) classes += ' active';
            
            // Using global App.selectLevel reference for simplicity in innerHTML
            return `
                <div class="${classes}" onclick="App.selectLevel(${index})" ${isLocked ? 'style="pointer-events:none"' : ''}>
                    <div class="level-status">${statusIcon}</div>
                    <div class="level-icon">⌨️</div>
                    <div class="level-title">${lesson.title}</div>
                    <div class="level-desc">${lesson.description}</div>
                </div>
            `;
        }).join('');
        
        this.dom.levelGrid.innerHTML = html;
        
        // Update button text
        const currentLesson = LESSONS[this.state.currentLessonIndex];
        if (this.dom.btnLevelMenu && currentLesson) {
             this.dom.btnLevelMenu.querySelector('.text').innerText = currentLesson.title.split('：')[0];
        }
    },

    toggleLevelMenu(show) {
        if (!this.dom.levelMenu) return;
        this.dom.levelMenu.style.display = show ? 'flex' : 'none';
        if (show) {
            this.renderLevelMenu();
        }
    },
    
    selectLevel(index) {
        if (index > this.state.maxUnlockedLevel) return;
        this.loadLesson(index);
        this.toggleLevelMenu(false);
    },

    loadLesson(index) {
        if (index >= LESSONS.length) {
            index = 0; // Loop back or finish
        }
        
        // Validation: Prevent loading locked levels manually
        if (index > this.state.maxUnlockedLevel) {
            console.warn("Attempted to load locked level");
            return;
        }

        this.state.currentLessonIndex = index;
        const lesson = LESSONS[index];
        this.state.text = lesson.text.toLowerCase(); // Ensure lowercase
        
        // Update Selector
        this.renderLevelMenu();
        
        // Reset Overlay Structure if needed (since we overwrite it in levelComplete)
        this.dom.overlay.innerHTML = `
            <h1 style="color:var(--text-primary); margin-bottom: 10px;">${lesson.title}</h1>
            <p style="color:#718096; margin-bottom: 30px;">${lesson.description}</p>
            <button class="btn-start">开始练习</button>
        `;
        // Re-cache and bind start button since we replaced HTML
        this.dom.startBtn = document.querySelector('.btn-start');
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.overlayTitle = document.querySelector('.overlay h1');
        this.dom.overlayDesc = document.querySelector('.overlay p');
        
        // Reset Game State
        this.state.isPlaying = false;
        this.dom.overlay.style.display = 'flex';
        this.state.currentIndex = 0;
        this.state.mistakes = 0;
        this.state.combo = 0;
        this.state.maxCombo = 0;
        this.updateComboUI();
        
        // Reset Display Preview
        this.dom.display.innerHTML = `<span style="color:#ccc; font-size: 24px;">点击开始练习...</span>`;
    },

    bindEvents() {
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Resize event for caret
        window.addEventListener('resize', () => {
            if (this.state.isPlaying) {
                this.updateCaret();
            }
        });
        
        // Level Menu Events
        if (this.dom.btnLevelMenu) {
            this.dom.btnLevelMenu.addEventListener('click', () => {
                this.toggleLevelMenu(true);
            });
        }
        
        if (this.dom.btnCloseMenu) {
            this.dom.btnCloseMenu.addEventListener('click', () => {
                this.toggleLevelMenu(false);
            });
        }
        
        if (this.dom.levelMenu) {
            this.dom.levelMenu.addEventListener('click', (e) => {
                if (e.target === this.dom.levelMenu) {
                    this.toggleLevelMenu(false);
                }
            });
        }

        if (this.dom.btnSound) {
            this.dom.btnSound.addEventListener('click', () => {
                const isMuted = SoundManager.toggleMute();
                this.dom.btnSound.textContent = isMuted ? '🔇' : '🔊';
                this.dom.btnSound.style.opacity = isMuted ? '0.5' : '1';
            });
        }
    },

    startGame() {
        this.state.isPlaying = true;
        this.state.currentIndex = 0;
        this.state.mistakes = 0;
        this.state.startTime = new Date();
        this.dom.overlay.style.display = 'none';
        this.dom.display.innerHTML = '';
        this.renderText();
        this.highlightNextKey();
        this.dom.wpm.innerText = '0';
        this.dom.accuracy.innerText = '100';
        if (this.dom.progressBar) this.dom.progressBar.style.width = '0%';
        if (this.dom.progressText) this.dom.progressText.innerText = '0%';
    },

    renderText() {
        const chars = this.state.text.split('').map((char, index) => {
            let className = 'char';
            if (index === this.state.currentIndex) className += ' current';
            if (char === ' ') className += ' space';
            return `<span class="${className}">${char === ' ' ? ' ' : char}</span>`;
        }).join('');
        
        this.dom.display.innerHTML = chars + '<div id="caret"></div><div class="error-overlay"></div>';
        setTimeout(() => this.updateCaret(), 0);
    },

    updateCaret() {
        const caret = document.getElementById('caret');
        if (!caret) return;
        
        // Handle end of text
        let targetEl = this.dom.display.children[this.state.currentIndex];
        let isEnd = false;

        if (!targetEl || !targetEl.classList.contains('char')) {
             // Try getting the last char if we are at the end
             if (this.state.currentIndex >= this.state.text.length) {
                 targetEl = this.dom.display.children[this.state.text.length - 1];
                 isEnd = true;
             }
        }
        
        if (targetEl && targetEl.classList.contains('char')) {
            const x = targetEl.offsetLeft + (isEnd ? targetEl.offsetWidth : 0);
            const y = targetEl.offsetTop;
            const h = targetEl.offsetHeight;
            
            // Adjust caret height and position
            caret.style.height = `${h * 0.6}px`;
            // Add slight offset for visual centering
            caret.style.transform = `translate(${x}px, ${y + h * 0.2}px)`;
            caret.style.opacity = '1';
        }
    },

    spawnParticles(x, y) {
        const colors = ['#667eea', '#764ba2', '#4fd1c5', '#f6ad55', '#f687b3'];
        const count = 8;
        
        // Adjust for scroll
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const finalX = x + scrollX;
        const finalY = y + scrollY;
        
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            
            const size = Math.random() * 6 + 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            p.style.left = `${finalX}px`;
            p.style.top = `${finalY}px`;
            
            document.body.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 20;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            const animation = p.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 400 + Math.random() * 200,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });
            
            animation.onfinish = () => p.remove();
        }
    },

    renderKeyboard() {
        // Keyboard is static in HTML for now, but logical mapping is here
        // We will add dynamic generation in Phase 2
    },

    handleInput(e) {
        if (!this.state.isPlaying) return;
        
        // Prevent input if level menu is open
        if (this.dom.levelMenu && this.dom.levelMenu.style.display !== 'none') return;

        // Prevent default for some keys to avoid browser scrolling etc.
        if(e.code === 'Space') e.preventDefault();

        const keyEl = document.querySelector(`.key[data-key="${e.code}"]`);
        if (keyEl) keyEl.classList.add('active');

        const targetChar = this.state.text[this.state.currentIndex];
        
        // Simple mapping for demo. Real app needs better key mapping.
        // e.key is the printed character.
        if (e.key === targetChar) {
            this.correctInput(targetChar);
        } else if (e.key.length === 1) { // Ignore modifier keys like Shift alone
            this.wrongInput();
        }
    },

    handleKeyUp(e) {
        const keyEl = document.querySelector(`.key[data-key="${e.code}"]`);
        if (keyEl) keyEl.classList.remove('active');
    },

    correctInput(key) {
        SoundManager.playClick(key === ' ');
        
        // Combo Logic
        this.state.combo++;
        if (this.state.combo > this.state.maxCombo) {
            this.state.maxCombo = this.state.combo;
        }
        this.updateComboUI();

        const prevIndex = this.state.currentIndex;
        const prevEl = this.dom.display.children[prevIndex];
        if (prevEl) {
            prevEl.classList.remove('current');
            prevEl.classList.add('correct');

            // Spawn particles at the typed char position
            const rect = prevEl.getBoundingClientRect();
            this.spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        this.state.currentIndex++;
        
        // Update Progress Bar
        if (this.dom.progressBar) {
            const progress = (this.state.currentIndex / this.state.text.length) * 100;
            this.dom.progressBar.style.width = `${progress}%`;
            if (this.dom.progressText) this.dom.progressText.innerText = `${Math.round(progress)}%`;
        }

        this.updateStats();
        
        // Check win
        if (this.state.currentIndex >= this.state.text.length) {
            this.updateCaret();
            this.levelComplete();
        } else {
            const currentEl = this.dom.display.children[this.state.currentIndex];
            if (currentEl) currentEl.classList.add('current');
            
            this.updateCaret();

            // Scroll if needed (simple implementation)
            if (currentEl && currentEl.offsetTop > this.dom.display.scrollTop + 100) {
                 this.dom.display.scrollTop = currentEl.offsetTop - 50;
            }

            this.highlightNextKey();
        }
    },

    wrongInput() {
        SoundManager.playBonk();
        
        // Reset Combo
        this.state.combo = 0;
        this.updateComboUI();

        this.state.mistakes++;
        
        // Visual Feedback for Text
        const currentEl = this.dom.display.children[this.state.currentIndex];
        if (currentEl) {
            currentEl.classList.add('wrong');
            setTimeout(() => currentEl.classList.remove('wrong'), 300);
        }
        
        // Shake Caret
        const caret = document.getElementById('caret');
        if (caret) {
             caret.style.animation = 'none';
             void caret.offsetWidth; // force reflow
             caret.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
             setTimeout(() => {
                 caret.style.animation = 'blink-caret 1s infinite';
             }, 400);
        }
        
        // Error Flash Overlay
        const errorOverlay = this.dom.display.querySelector('.error-overlay');
        if (errorOverlay) {
            errorOverlay.classList.remove('active');
            void errorOverlay.offsetWidth; // Force reflow
            errorOverlay.classList.add('active');
            setTimeout(() => errorOverlay.classList.remove('active'), 100);
        }

        // Dynamic Keyboard Guidance: Flash the CORRECT key
        const targetChar = this.state.text[this.state.currentIndex];
        const targetCode = this.getKeyCode(targetChar);
        const correctKeyEl = document.querySelector(`.key[data-key="${targetCode}"]`);
        
        if (correctKeyEl) {
            // Reset animation to allow re-triggering
            correctKeyEl.classList.remove('flash-guide');
            void correctKeyEl.offsetWidth; // Force reflow
            correctKeyEl.classList.add('flash-guide');
            
            // Remove class after animation
            setTimeout(() => {
                correctKeyEl.classList.remove('flash-guide');
            }, 400);
        }

        this.updateStats();
    },

    updateComboUI() {
        if (this.state.combo > 1) {
            this.dom.combo.innerText = `${this.state.combo} 连击!`;
            this.dom.combo.classList.add('show');
            this.dom.combo.classList.remove('pulse');
            void this.dom.combo.offsetWidth; // trigger reflow
            this.dom.combo.classList.add('pulse');
        } else {
            this.dom.combo.classList.remove('show');
        }
    },

    highlightNextKey() {
        // Remove old hint
        document.querySelectorAll('.key.hint').forEach(k => k.classList.remove('hint'));
        document.querySelectorAll('.finger.active').forEach(f => f.classList.remove('active'));

        if (this.state.currentIndex >= this.state.text.length) return;

        const nextChar = this.state.text[this.state.currentIndex];
        let code = this.getKeyCode(nextChar);
        
        const keyEl = document.querySelector(`.key[data-key="${code}"]`);
        if (keyEl) {
            keyEl.classList.add('hint');
            
            // Highlight Finger
            const fingerName = keyEl.dataset.finger;
            if (fingerName) {
                // Handle thumb specially (both thumbs can hit space, but usually right thumb)
                // Here we just highlight both thumbs for space or specific based on logic if needed
                if (fingerName === 'thumb') {
                    // Highlight right thumb for now as default
                    document.querySelectorAll('.finger.thumb').forEach(t => t.classList.add('active'));
                } else {
                    const fingerEl = document.querySelector(`.finger.${fingerName}`);
                    if (fingerEl) fingerEl.classList.add('active');
                }
            }
        }
    },

    getKeyCode(char) {
        if (char === ' ') return 'Space';
        if (char === ';') return 'Semicolon';
        if (char === ',') return 'Comma';
        if (char === '.') return 'Period';
        if (char === '/') return 'Slash';
        // Simple alpha mapping
        return 'Key' + char.toUpperCase();
    },

    updateStats() {
        if (!this.state.startTime) return;
        
        const now = new Date();
        const timeDiff = (now - this.state.startTime) / 1000 / 60; // in minutes
        
        if (timeDiff > 0) {
            const words = this.state.currentIndex / 5; // Standard: 5 chars = 1 word
            const wpm = Math.round(words / timeDiff);
            this.dom.wpm.innerText = wpm;
        }
        const correct = this.state.currentIndex;
        const total = this.state.currentIndex + this.state.mistakes;
        if (total > 0) {
            const accuracy = Math.round((correct / total) * 100);
            this.dom.accuracy.innerText = accuracy;
        } else {
            this.dom.accuracy.innerText = '100';
        }
    },

    levelComplete() {
        SoundManager.playWin();
        this.state.isPlaying = false;
        
        // Calculate Stats
        const now = new Date();
        const timeDiff = (now - this.state.startTime) / 1000 / 60;
        const wpm = timeDiff > 0 ? Math.round((this.state.currentIndex / 5) / timeDiff) : 0;
        
        const total = this.state.currentIndex + this.state.mistakes;
        const accuracy = total > 0 ? Math.round((this.state.currentIndex / total) * 100) : 100;

        // Calculate Stars
        let stars = 1;
        if (accuracy >= 95 && wpm > 10) stars = 3;
        else if (accuracy >= 90) stars = 2;
        
        const starStr = '⭐'.repeat(stars);

        // Next Level Logic
        const nextIndex = this.state.currentLessonIndex + 1;
        const hasNext = nextIndex < LESSONS.length;
        
        // Unlock Logic
        if (stars > 0 && hasNext) { // Assuming getting stars means passed
            if (nextIndex > this.state.maxUnlockedLevel) {
                this.state.maxUnlockedLevel = nextIndex;
                localStorage.setItem('typeasy_maxUnlockedLevel', this.state.maxUnlockedLevel);
                this.renderLevelMenu();
            }
        }
        
        // Render Result Card
        const resultHTML = `
            <div class="result-card">
                <div class="stars">${starStr}</div>
                <h1 style="color:var(--text-primary); margin-bottom: 10px;">${hasNext ? '🎉 关卡完成！' : '🏆 全通关！'}</h1>
                <div class="result-message">${this.getEncouragement(stars)}</div>
                
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="stat-value">${wpm}</span>
                        <span class="stat-label">WPM</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">${accuracy}%</span>
                        <span class="stat-label">准确率</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">${this.state.maxCombo}</span>
                        <span class="stat-label">最大连击</span>
                    </div>
                </div>

                <button class="btn-start" onclick="App.nextAction(${hasNext})">${hasNext ? '下一关' : '重头再来'}</button>
            </div>
        `;

        this.dom.overlay.innerHTML = resultHTML;
        this.dom.overlay.style.display = 'flex';
    },

    getEncouragement(stars) {
        if (stars === 3) return "太棒了！你的手指在跳舞！";
        if (stars === 2) return "做得很好！再稳一点就完美了！";
        return "继续加油！熟能生巧！";
    },

    nextAction(hasNext) {
        // Reset Overlay Content structure for start screen (simplified for now, or just reload lesson)
        if (hasNext) {
            this.loadLesson(this.state.currentLessonIndex + 1);
        } else {
            this.loadLesson(0);
        }
        // Re-bind button since we replaced HTML
        this.dom.startBtn = document.querySelector('.btn-start');
        this.dom.startBtn.addEventListener('click', () => this.startGame());
    },
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
