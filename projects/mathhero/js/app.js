const MathHeroApp = {
    config: {
        modes: {
            '10': { max: 10, carry: false },
            '20': { max: 20, carry: false }, // No carry/borrow (e.g. 12+5, 18-3)
            '20_carry': { max: 20, carry: true } // Carry/borrow (e.g. 8+5, 13-7)
        }
    },
    state: {
        currentMode: '10',
        score: 0,
        combo: 0,
        currentQuestion: null, // { num1, num2, op, answer }
        inputBuffer: '',
        isPlaying: false,
        isProcessing: false, // Prevent multiple submissions
        soundEnabled: true,
        history: [] // Last 3 questions
    },
    
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initAuth();
        this.toggleSound(true); // Default on
        console.log("MathHero Initialized");
    },

    cacheDOM() {
        this.dom = {
            num1: document.getElementById('num1'),
            num2: document.getElementById('num2'),
            op: document.getElementById('operator'),
            ans: document.getElementById('answer-placeholder'),
            score: document.getElementById('score-display'),
            combo: document.getElementById('combo-display'),
            feedback: document.getElementById('feedback-msg'),
            questionBox: document.getElementById('question-box'),
            startOverlay: document.getElementById('start-overlay'),
            modeSelector: document.getElementById('mode-selector'),
            soundBtn: document.getElementById('sound-toggle'),
            iconSoundOn: document.getElementById('icon-sound-on'),
            iconSoundOff: document.getElementById('icon-sound-off'),
            historyLog: document.getElementById('history-log')
        };
    },

    initAuth() {
        if (window.EduAuth) {
            EduAuth.init().then(() => {
                const session = EduAuth.getSession();
                const userEl = document.getElementById('user-display');
                if (session.isAuthenticated) {
                    let name = session.user.nickname;
                    if (session.kidId && session.kids) {
                        const kid = session.kids.find(k => k._id === session.kidId);
                        if (kid) name = kid.name;
                    }
                    userEl.textContent = `🧮 ${name}`;
                    userEl.classList.replace('bg-gray-100', 'bg-yellow-100');
                    userEl.classList.replace('text-gray-400', 'text-yellow-600');
                }
            });
        }
    },

    bindEvents() {
        // Mode Selector
        this.dom.modeSelector.addEventListener('change', (e) => {
            this.state.currentMode = e.target.value;
            this.resetGame();
        });

        // Start Button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Sound Toggle
        this.dom.soundBtn.addEventListener('click', () => {
            this.toggleSound(!this.state.soundEnabled);
            this.dom.soundBtn.blur();
        });

        // Keypad (Virtual)
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                const action = btn.dataset.action;
                if (val !== undefined) this.handleInput(val);
                if (action === 'clear') this.clearInput();
                if (action === 'submit') this.submitAnswer();
            });
        });

        // Keyboard (Physical)
        document.addEventListener('keydown', (e) => {
            if (!this.state.isPlaying) return;
            
            if (e.key >= '0' && e.key <= '9') {
                this.handleInput(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearInput();
            } else if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
    },

    toggleSound(enabled) {
        this.state.soundEnabled = enabled;
        if (enabled) {
            this.dom.iconSoundOn.classList.remove('hidden');
            this.dom.iconSoundOff.classList.add('hidden');
        } else {
            this.dom.iconSoundOn.classList.add('hidden');
            this.dom.iconSoundOff.classList.remove('hidden');
        }
    },

    startGame() {
        this.state.isPlaying = true;
        this.state.score = 0;
        this.state.combo = 0;
        this.state.history = [];
        this.updateHistoryUI();
        this.updateScore();
        this.dom.startOverlay.classList.add('hidden');
        this.nextQuestion();
    },

    resetGame() {
        this.state.isPlaying = false;
        this.dom.startOverlay.classList.remove('hidden');
        this.clearInput();
    },

    generateQuestion() {
        const mode = this.config.modes[this.state.currentMode];
        const isAddition = Math.random() > 0.5;
        let num1, num2, answer;

        // Logic for different difficulties
        if (mode.max === 10) {
            // Level 1: Sum <= 10
            if (isAddition) {
                num1 = Math.floor(Math.random() * 11); // 0-10
                num2 = Math.floor(Math.random() * (11 - num1)); // Ensure sum <= 10
                answer = num1 + num2;
            } else {
                num1 = Math.floor(Math.random() * 11); // 0-10
                num2 = Math.floor(Math.random() * (num1 + 1)); // Ensure result >= 0
                answer = num1 - num2;
            }
        } else if (mode.max === 20 && !mode.carry) {
            // Level 2: Sum <= 20, No Carry (e.g. 12+5, not 8+5)
            // For addition: ones digit sum < 10
            if (isAddition) {
                num1 = Math.floor(Math.random() * 21);
                // Ensure num2 ones digit + num1 ones digit < 10 AND sum <= 20
                // Simplified approach:
                // Generate num1 (0-20)
                // Generate num2 such that no carry logic applies? 
                // Actually, "no carry" usually means simple mental math.
                // Let's implement simpler: One number is > 10, other is single digit.
                // Or both single digits but sum > 10 (Wait, that IS carry).
                // "No carry" usually means like 12+3=15.
                
                // Let's simplify: 
                // Case A: 10-19 + 0-9 (result <= 20)
                // Case B: 0-9 + 0-9 (sum > 10 is carry, sum <= 10 is level 1)
                
                // Let's just generate standard math first.
                // Actually, strict "No Carry" is complex to gen randomly. 
                // Let's treat '20' as General 20.
                // Wait, user specifically asked for "20 within no carry" usually in China grade 1.
                // e.g. 13+2=15. 
                
                // Algorithm for "No Carry" Addition within 20:
                // A = 10 + x (x: 0-9)
                // B = y (y: 0-9)
                // x + y < 10
                
                if (Math.random() > 0.5) {
                    // Type 1: 10+x + y
                    let x = Math.floor(Math.random() * 10);
                    let y = Math.floor(Math.random() * (10 - x));
                    num1 = 10 + x;
                    num2 = y;
                } else {
                    // Type 2: Simple small numbers
                    num1 = Math.floor(Math.random() * 10);
                    num2 = Math.floor(Math.random() * (10 - num1));
                }
                answer = num1 + num2;
            } else {
                // No Borrow Subtraction within 20
                // 15 - 3 (5>=3)
                num1 = 10 + Math.floor(Math.random() * 10); // 10-19
                let ones = num1 % 10;
                num2 = Math.floor(Math.random() * (ones + 1)); // Ensure no borrow
                answer = num1 - num2;
            }
        } else {
            // Level 3: 20 Carry/Borrow (Strictly generate carry/borrow questions for practice)
            // e.g. 8+5=13, 13-5=8
            if (isAddition) {
                // num1 (2-9), num2 (2-9), sum > 10
                num1 = 2 + Math.floor(Math.random() * 8); // 2-9
                let minNum2 = 11 - num1;
                let maxNum2 = 9;
                if (minNum2 > maxNum2) minNum2 = maxNum2; // Fallback
                num2 = minNum2 + Math.floor(Math.random() * (maxNum2 - minNum2 + 1));
                answer = num1 + num2;
            } else {
                // Borrow Subtraction: 11-18 minus 2-9
                // e.g. 13 - 5 (3 < 5)
                answer = 2 + Math.floor(Math.random() * 8); // Result is single digit
                num2 = Math.floor(Math.random() * 8) + 2; // Subtracting number
                // Ensure num1 = answer + num2 has borrow logic?
                // Actually easier: 11-18 minus something that requires borrow.
                num1 = 11 + Math.floor(Math.random() * 8); // 11-18
                let ones = num1 % 10;
                // To require borrow, num2 must be > ones
                let minNum2 = ones + 1;
                let maxNum2 = 9; 
                // Ensure num1 - num2 > 0
                if (minNum2 > maxNum2) {
                     // Fallback to random
                     num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                } else {
                    num2 = minNum2 + Math.floor(Math.random() * (maxNum2 - minNum2 + 1));
                }
                
                // Double check validity
                if (num2 >= num1) num2 = num1 - 1;
                answer = num1 - num2;
            }
        }

        return { num1, num2, op: isAddition ? '+' : '-', answer };
    },

    nextQuestion() {
        this.state.isProcessing = false;
        
        // Re-enable submit button
        const btn = document.querySelector('button[data-action="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        this.clearInput();
        const q = this.generateQuestion();
        this.state.currentQuestion = q;
        
        // Render
        this.dom.num1.textContent = q.num1;
        this.dom.num2.textContent = q.num2;
        this.dom.op.textContent = q.op;
        this.dom.ans.textContent = '?';
        this.dom.ans.classList.remove('text-green-500', 'text-red-500');
        this.dom.ans.classList.add('text-blue-500');
        this.dom.feedback.textContent = '加油！';
        
        // Animation
        this.dom.questionBox.classList.remove('animate-pop');
        void this.dom.questionBox.offsetWidth; // trigger reflow
        this.dom.questionBox.classList.add('animate-pop');
    },

    handleInput(val) {
        if (this.state.inputBuffer.length >= 2) return; // Max 2 digits
        this.state.inputBuffer += val;
        this.dom.ans.textContent = this.state.inputBuffer;
        this.dom.ans.classList.remove('text-blue-500');
        this.dom.ans.classList.add('text-gray-800');
    },

    clearInput() {
        this.state.inputBuffer = '';
        this.dom.ans.textContent = '?';
        this.dom.ans.classList.add('text-blue-500');
        this.dom.ans.classList.remove('text-gray-800');
    },

    submitAnswer() {
        if (!this.state.inputBuffer || this.state.isProcessing) return;
        
        this.state.isProcessing = true;
        
        // Visually disable submit button
        const btn = document.querySelector('button[data-action="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        const userAns = parseInt(this.state.inputBuffer);
        const correctAns = this.state.currentQuestion.answer;
        
        if (userAns === correctAns) {
            this.handleCorrect();
        } else {
            this.handleWrong();
        }
    },

    handleCorrect() {
        // Update History
        const q = this.state.currentQuestion;
        this.addToHistory(`${q.num1}${q.op}${q.num2}=${q.answer}`);

        // Visuals
        this.dom.ans.classList.add('text-green-500');
        this.dom.feedback.textContent = '太棒了！🎉';
        this.playSound('correct');
        this.spawnConfetti();
        
        // Score
        this.state.score += 10 + (this.state.combo * 2);
        this.state.combo++;
        this.updateScore();
        this.showCombo();
        
        // Floating Text
        this.showFloatingText('+10');

        // Next
        setTimeout(() => {
            this.nextQuestion();
        }, 800);
    },

    addToHistory(text) {
        this.state.history.push(text);
        if (this.state.history.length > 3) this.state.history.shift();
        this.updateHistoryUI();
    },

    updateHistoryUI() {
        this.dom.historyLog.innerHTML = this.state.history
            .map(item => `<span class="bg-gray-100 px-2 py-1 rounded-md">${item}</span>`)
            .join('');
    },

    handleWrong() {
        this.dom.ans.classList.add('text-red-500');
        this.dom.questionBox.classList.add('animate-shake');
        setTimeout(() => this.dom.questionBox.classList.remove('animate-shake'), 500);
        
        this.dom.feedback.textContent = '再试一次哦 💪';
        this.state.combo = 0;
        this.updateScore();
        this.playSound('wrong');
        
        // Clear input after delay
        setTimeout(() => {
            this.clearInput();
            this.state.isProcessing = false;
            
            // Re-enable submit button
            const btn = document.querySelector('button[data-action="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }, 800);
    },

    updateScore() {
        this.dom.score.textContent = this.state.score;
        if (this.state.combo > 1) {
            this.dom.combo.textContent = `Combo x${this.state.combo}!`;
            this.dom.combo.style.opacity = '1';
            this.dom.combo.style.transform = 'scale(1.2) rotate(-5deg)';
        } else {
            this.dom.combo.style.opacity = '0';
        }
    },

    showCombo() {
        // Pulse combo
        this.dom.combo.style.transform = 'scale(1.5) rotate(-10deg)';
        setTimeout(() => {
            this.dom.combo.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    },

    showFloatingText(text) {
        const el = document.createElement('div');
        el.className = 'float-score';
        el.textContent = text;
        el.style.left = '50%';
        el.style.top = '40%';
        el.style.transform = 'translate(-50%, -50%)';
        this.dom.questionBox.appendChild(el);
        setTimeout(() => el.remove(), 800);
    },

    playSound(type) {
        if (!this.state.soundEnabled) return;

        // Simple Web Audio beep for now, can be enhanced
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'correct') {
            // Happy Major Chord (C5, E5, G5)
            const notes = [523.25, 659.25, 783.99]; 
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05 + (i * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + (i * 0.05));
                
                osc.start(ctx.currentTime + (i * 0.05));
                osc.stop(ctx.currentTime + 0.6);
            });
        } else {
            // Sad Thud (Low dissonant)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    },

    spawnConfetti() {
        // Simple DOM Confetti
        const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
        const container = document.body;
        
        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.className = 'confetti';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.left = '50%';
            el.style.top = '50%';
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const tx = Math.cos(angle) * velocity * 20;
            const ty = Math.sin(angle) * velocity * 20;
            
            el.style.setProperty('--tx', `${tx}px`);
            el.style.setProperty('--ty', `${ty}px`);
            
            container.appendChild(el);
            
            // Cleanup
            setTimeout(() => el.remove(), 1000);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MathHeroApp.init();
});
