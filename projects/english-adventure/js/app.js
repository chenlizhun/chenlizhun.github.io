const SoundManager = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if suspended (common browser policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playTone(freq, type, duration, startTime = 0) {
        if (!this.ctx) this.init();
        // Ensure context is running
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        
        // Envelope to avoid clicking
        gain.gain.setValueAtTime(0.01, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // Cleanup to prevent memory leaks/node limits
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    },
    playCorrect() {
        this.playTone(600, 'sine', 0.1);
        this.playTone(800, 'sine', 0.1, 0.1);
        this.playTone(1000, 'sine', 0.2, 0.2);
    },
    playWrong() {
        this.playTone(300, 'sawtooth', 0.15);
        this.playTone(200, 'sawtooth', 0.3, 0.15);
    },
    playWin() {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
            this.playTone(freq, 'square', 0.3, i * 0.15);
        });
    },
    playFlip() {
        this.playTone(800, 'sine', 0.05);
    }
};

const App = {
    state: {
        view: 'home', // home, category, learn, quiz, stickers
        categoryKey: null,
        currentWordIndex: 0,
        quizScore: 0,
        quizTotal: 0,
        combo: 0,
        stickers: JSON.parse(localStorage.getItem('english_adventure_stickers') || '[]'),
        user: null
    },

    init() {
        // Global Audio Unlock
        document.body.addEventListener('click', () => {
            if (SoundManager.ctx && SoundManager.ctx.state === 'suspended') {
                SoundManager.ctx.resume();
            } else if (!SoundManager.ctx) {
                SoundManager.init();
            }
        }, { once: true });

        // Init Auth if available
        if (window.AuthSDK) {
            window.AuthSDK.init({
                onUserChanged: (user) => {
                    this.state.user = user;
                    this.render();
                }
            });
        }
        
        // Handle back button
        window.onpopstate = (event) => {
            if (event.state) {
                this.state = event.state;
                this.render();
            }
        };

        this.render();
    },

    renderStickers() {
        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        
        const uniqueStickers = [...new Set(this.state.stickers)];
        
        div.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('home')" class="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:bg-slate-50">←</button>
                <h2 class="text-2xl font-bold text-slate-800">My Stickers</h2>
            </div>
            
            <div class="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-inner min-h-[300px] border-4 border-white">
                ${uniqueStickers.length === 0 ? 
                    `<div class="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                        <div class="text-6xl mb-4 opacity-50">🕸️</div>
                        <p>No stickers yet!</p>
                        <p class="text-sm mt-2">Play Quiz to win stickers.</p>
                    </div>` 
                    : 
                    `<div class="grid grid-cols-4 gap-4">
                        ${uniqueStickers.map(emoji => `
                            <div class="aspect-square bg-white rounded-xl shadow-sm flex items-center justify-center text-4xl hover:scale-110 transition cursor-help relative group">
                                ${emoji}
                                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                    Nice!
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
        return div;
    },

    navigate(view, params = {}) {
        this.state.view = view;
        Object.assign(this.state, params);
        
        // Reset specific states
        if (view === 'learn') this.state.currentWordIndex = 0;
        if (view === 'quiz') {
            this.state.quizScore = 0;
            this.state.quizTotal = 0;
            this.state.combo = 0;
            this.nextQuizQuestion();
        }
        if (view === 'imageQuiz') {
            this.state.quizScore = 0;
            this.state.quizTotal = 0;
            this.state.combo = 0;
            this.nextImageQuizQuestion();
        }
        if (view === 'memory') {
            this.setupMemoryGame();
        }

        window.history.pushState(JSON.parse(JSON.stringify(this.state)), '', '#'+view);
        this.render();
    },

    setupMemoryGame() {
        // Gather all words
        let allWords = [];
        Object.keys(VOCABULARY).forEach(key => {
            allWords = allWords.concat(VOCABULARY[key].words);
        });

        // Pick 6 random words
        const selectedWords = [];
        const indices = new Set();
        while(selectedWords.length < 6 && indices.size < allWords.length) {
            const idx = Math.floor(Math.random() * allWords.length);
            if(!indices.has(idx)) {
                indices.add(idx);
                selectedWords.push(allWords[idx]);
            }
        }

        // Create pairs (one with word, one with emoji)
        let cards = [];
        selectedWords.forEach((word, index) => {
            cards.push({ id: index, content: word.word, type: 'text', wordObj: word, isFlipped: false, isMatched: false });
            cards.push({ id: index, content: word.emoji, type: 'emoji', wordObj: word, isFlipped: false, isMatched: false });
        });

        // Shuffle
        cards.sort(() => Math.random() - 0.5);

        this.state.memoryCards = cards;
        this.state.memoryFlipped = []; // Indices of currently flipped cards
        this.state.memoryLock = false; // To prevent clicking while animating
        this.state.memoryMoves = 0;
    },

    flipCard(index) {
        if (this.state.memoryLock) return;
        const card = this.state.memoryCards[index];
        if (card.isFlipped || card.isMatched) return;

        // Flip
        card.isFlipped = true;
        this.state.memoryFlipped.push(index);
        this.playEffect('flip');
        this.render();

        if (this.state.memoryFlipped.length === 2) {
            this.state.memoryLock = true;
            this.state.memoryMoves++;
            
            const idx1 = this.state.memoryFlipped[0];
            const idx2 = this.state.memoryFlipped[1];
            const card1 = this.state.memoryCards[idx1];
            const card2 = this.state.memoryCards[idx2];

            if (card1.id === card2.id) {
                // Match!
                setTimeout(() => {
                    card1.isMatched = true;
                    card2.isMatched = true;
                    this.state.memoryFlipped = [];
                    this.state.memoryLock = false;
                    this.playEffect('correct');
                    this.checkMemoryWin();
                    this.render();
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    card1.isFlipped = false;
                    card2.isFlipped = false;
                    this.state.memoryFlipped = [];
                    this.state.memoryLock = false;
                    this.playEffect('wrong');
                    this.render();
                }, 1000);
            }
        }
    },

    checkMemoryWin() {
        if (this.state.memoryCards.every(c => c.isMatched)) {
            this.playEffect('win');
            this.showWinScreen(); // Reuse win screen logic or create new
        }
    },

    speak(text, lang = 'en-US') {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.8; // Slower for kids
        u.pitch = 1.1; // Higher pitch is friendlier
        
        // Try to select a better voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) u.voice = preferredVoice;

        window.speechSynthesis.speak(u);
    },

    listenFor(targetWord) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Try Chrome!');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const btn = document.getElementById('mic-btn');
        if(btn) {
            btn.classList.add('animate-pulse', 'bg-red-500');
            btn.innerHTML = '🎤 Listening...';
        }

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Heard:', transcript);
            
            if (transcript.includes(targetWord.toLowerCase())) {
                this.playEffect('correct');
                if(window.Toast) window.Toast.success('Perfect pronunciation!');
            } else {
                this.playEffect('wrong');
                if(window.Toast) window.Toast.error(`I heard "${transcript}". Try again!`);
            }
        };

        recognition.onend = () => {
            if(btn) {
                btn.classList.remove('animate-pulse', 'bg-red-500');
                btn.innerHTML = '🎤 Speak';
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if(btn) {
                btn.classList.remove('animate-pulse', 'bg-red-500');
                btn.innerHTML = '🎤 Speak';
            }
        };
    },

    playEffect(type) {
        // Simple visual feedback since we don't have audio files yet
        // In a real app, we would play mp3 files here
        if (type === 'correct') {
            SoundManager.playCorrect();
            this.speak('Great!', 'en-US');
            this.showConfetti();
        } else if (type === 'wrong') {
            SoundManager.playWrong();
            this.speak('Try again', 'en-US');
        } else if (type === 'win') {
            SoundManager.playWin();
            this.speak('You Win!', 'en-US');
        } else if (type === 'flip') {
            SoundManager.playFlip();
        }
    },

    showConfetti() {
        const container = document.getElementById('app');
        for(let i=0; i<20; i++) {
            const el = document.createElement('div');
            el.innerText = ['🎉', '⭐', '✨', '🎈'][Math.floor(Math.random()*4)];
            el.style.position = 'absolute';
            el.style.left = Math.random() * 100 + '%';
            el.style.top = Math.random() * 50 + '%';
            el.style.fontSize = (Math.random() * 20 + 20) + 'px';
            el.style.pointerEvents = 'none';
            el.style.zIndex = 100;
            el.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${Math.random()*200+100}px) rotate(${Math.random()*360}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            }).onfinish = () => el.remove();
            container.appendChild(el);
        }
    },

    render() {
        const app = document.getElementById('app');
        app.innerHTML = '';

        switch(this.state.view) {
            case 'home':
                app.appendChild(this.renderHome());
                break;
            case 'category':
                app.appendChild(this.renderCategory());
                break;
            case 'learn':
                app.appendChild(this.renderLearn());
                break;
            case 'quiz':
                app.appendChild(this.renderQuiz());
                break;
            case 'imageQuiz':
                app.appendChild(this.renderImageQuiz());
                break;
            case 'stickers':
                app.appendChild(this.renderStickers());
                break;
            case 'memory':
                app.appendChild(this.renderMemory());
                break;
        }
    },

    renderMemory() {
        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        
        div.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <button onclick="App.navigate('home')" class="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:bg-slate-50">←</button>
                <h2 class="text-2xl font-bold text-slate-800">Memory Game</h2>
                <div class="ml-auto bg-white/50 px-3 py-1 rounded-full text-sm font-bold text-slate-500">Moves: ${this.state.memoryMoves}</div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 md:gap-4 flex-1 content-center max-w-md mx-auto w-full">
                ${this.state.memoryCards.map((card, index) => `
                    <div class="aspect-[3/4] relative perspective-1000 cursor-pointer" onclick="App.flipCard(${index})">
                        <div class="w-full h-full transition-all duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''} ${card.isMatched ? 'opacity-0 pointer-events-none scale-90' : ''}">
                            <!-- Back -->
                            <div class="absolute w-full h-full backface-hidden bg-sky-500 rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                                <span class="text-4xl">❓</span>
                            </div>
                            <!-- Front -->
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl shadow-md flex flex-col items-center justify-center border-4 border-sky-200 p-2">
                                <div class="${card.type === 'emoji' ? 'text-5xl' : 'text-xl font-bold text-slate-700 text-center'}">
                                    ${card.content}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        return div;
    },

    getDailyWord() {
        const today = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = today.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        let allWords = [];
        Object.keys(VOCABULARY).forEach(key => {
            allWords = allWords.concat(VOCABULARY[key].words);
        });
        
        const index = Math.abs(hash) % allWords.length;
        return allWords[index];
    },

    renderHome() {
        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 animate-pop';
        
        const dailyWord = this.getDailyWord();

        const userHtml = this.state.user 
            ? `<div class="flex items-center gap-2 mb-6 bg-white/60 p-2 rounded-full w-max mx-auto shadow-sm backdrop-blur-sm">
                <img src="${this.state.user.avatarUrl}" class="w-8 h-8 rounded-full border-2 border-white">
                <span class="font-bold text-slate-700 pr-3">Hi, ${this.state.user.nickName}</span>
               </div>`
            : `<div class="text-center mb-6"><h1 class="text-4xl font-bold text-sky-600 drop-shadow-sm tracking-tight">English<br><span class="text-yellow-500">Adventure</span></h1></div>`;

        div.innerHTML = `
            ${userHtml}
            
            <div onclick="App.speak('${dailyWord.word}')" class="bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl p-4 mb-6 text-white shadow-lg cursor-pointer active:scale-95 transition relative overflow-hidden group">
                <div class="absolute right-[-10px] top-[-10px] text-6xl opacity-20 rotate-12 group-hover:scale-110 transition">${dailyWord.emoji}</div>
                <div class="text-xs font-bold opacity-80 uppercase tracking-wide mb-1">Word of the Day</div>
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${dailyWord.emoji}</span>
                    <div>
                        <div class="text-2xl font-bold leading-none">${dailyWord.word}</div>
                        <div class="text-sm opacity-90">${dailyWord.translation}</div>
                    </div>
                    <div class="ml-auto bg-white/20 p-2 rounded-full">🔊</div>
                </div>
            </div>

            <div class="flex justify-between mb-4 px-2">
                 <button onclick="App.navigate('memory')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition active:scale-95">
                    <span>🧠</span> Memory Game
                 </button>
                 <button onclick="App.navigate('stickers')" class="bg-white/80 hover:bg-white text-slate-700 px-4 py-2 rounded-full font-bold shadow-sm backdrop-blur-sm flex items-center gap-2 transition">
                    <span>🏆</span> My Stickers
                 </button>
            </div>

            <div class="grid grid-cols-2 gap-4 flex-1 content-start pb-20">
                ${Object.keys(VOCABULARY).map(key => {
                    const cat = VOCABULARY[key];
                    return `
                    <div onclick="App.navigate('category', {categoryKey: '${key}'})" 
                         class="${cat.color} rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white">
                        <div class="text-5xl filter drop-shadow-md group-hover:animate-bounce-short">${cat.icon}</div>
                        <div class="font-bold text-slate-700 text-lg text-center leading-tight">${cat.title}</div>
                    </div>
                    `;
                }).join('')}
            </div>
            <div class="text-center text-slate-400 text-xs mt-6 font-medium">Create for Kids (6-9)</div>
        `;
        return div;
    },

    renderCategory() {
        if (!this.state.categoryKey || !VOCABULARY[this.state.categoryKey]) {
            setTimeout(() => this.navigate('home'), 0);
            return document.createElement('div');
        }
        const cat = VOCABULARY[this.state.categoryKey];
        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        div.innerHTML = `
            <button onclick="App.navigate('home')" class="absolute top-6 left-6 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:bg-slate-50">←</button>
            
            <div class="flex flex-col items-center mt-12 mb-12">
                <div class="text-6xl mb-4 animate-bounce-short">${cat.icon}</div>
                <h2 class="text-3xl font-bold text-slate-800">${cat.title}</h2>
                <p class="text-slate-500 mt-2">${cat.words.length} Words</p>
            </div>

            <div class="flex flex-col gap-4 max-w-xs w-full mx-auto">
                <button onclick="App.navigate('learn', {categoryKey: '${this.state.categoryKey}'})" 
                    class="bg-sky-500 text-white p-4 rounded-2xl font-bold text-xl shadow-lg shadow-sky-200 active:scale-95 transition flex items-center justify-center gap-3 border-b-4 border-sky-600">
                    <span>📖</span> Learn Words
                </button>
                <button onclick="App.navigate('quiz', {categoryKey: '${this.state.categoryKey}'})" 
                    class="bg-yellow-400 text-yellow-900 p-4 rounded-2xl font-bold text-xl shadow-lg shadow-yellow-200 active:scale-95 transition flex items-center justify-center gap-3 border-b-4 border-yellow-500">
                    <span>🎮</span> Play Quiz
                </button>
                <button onclick="App.navigate('imageQuiz', {categoryKey: '${this.state.categoryKey}'})" 
                    class="bg-green-500 text-white p-4 rounded-2xl font-bold text-xl shadow-lg shadow-green-200 active:scale-95 transition flex items-center justify-center gap-3 border-b-4 border-green-600">
                    <span>🖼️</span> Word Match
                </button>
            </div>
        `;
        return div;
    },

    renderLearn() {
        if (!this.state.categoryKey || !VOCABULARY[this.state.categoryKey]) {
            setTimeout(() => this.navigate('home'), 0);
            return document.createElement('div');
        }
        const cat = VOCABULARY[this.state.categoryKey];
        const word = cat.words[this.state.currentWordIndex];
        const isFirst = this.state.currentWordIndex === 0;
        const isLast = this.state.currentWordIndex === cat.words.length - 1;

        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        
        // Auto speak when entering view
        setTimeout(() => this.speak(word.word), 300);

        const progress = ((this.state.currentWordIndex + 1) / cat.words.length) * 100;

        div.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <button onclick="App.navigate('category', {categoryKey: '${this.state.categoryKey}'})" class="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:scale-110 transition">✕</button>
                <div class="flex-1 bg-white/50 h-4 rounded-full overflow-hidden border border-white/50 shadow-inner">
                    <div class="h-full bg-sky-500 transition-all duration-500 relative overflow-hidden" style="width: ${progress}%">
                        <div class="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                    </div>
                </div>
                <div class="bg-white/50 px-3 py-1 rounded-full text-sm font-bold text-slate-500 min-w-[3rem] text-center">${this.state.currentWordIndex + 1}/${cat.words.length}</div>
            </div>

            <div class="flex-1 flex flex-col items-center justify-center relative perspective-1000">
                <div onclick="App.speak('${word.word}')" class="bg-white w-full aspect-[3/4] max-h-[400px] rounded-[2rem] shadow-2xl flex flex-col items-center justify-center gap-6 p-8 cursor-pointer active:scale-[0.98] transition border-4 border-slate-100 relative overflow-hidden group">
                    <div class="absolute top-4 right-4 text-slate-300">🔊</div>
                    <div class="text-[8rem] group-hover:scale-110 transition duration-500">${word.emoji}</div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-slate-800 mb-2">${word.word}</div>
                        <div class="text-xl text-slate-400 font-medium">${word.translation}</div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center mt-8 px-4">
                <button onclick="App.prevWord()" class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl text-slate-600 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none" ${isFirst ? 'disabled' : ''}>←</button>
                
                <div class="flex gap-2">
                    <button onclick="App.speak('${word.word}')" class="bg-sky-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-sky-200 active:scale-95 transition flex items-center gap-2">
                        🔊 Listen
                    </button>
                    <button id="mic-btn" onclick="App.listenFor('${word.word}')" class="bg-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-purple-200 active:scale-95 transition flex items-center gap-2">
                        🎤 Speak
                    </button>
                </div>

                <button onclick="App.nextWord()" class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl text-slate-600 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none" ${isLast ? 'disabled' : ''}>→</button>
            </div>
        `;
        return div;
    },

    nextWord() {
        const cat = VOCABULARY[this.state.categoryKey];
        if (this.state.currentWordIndex < cat.words.length - 1) {
            this.state.currentWordIndex++;
            this.render();
        }
    },

    prevWord() {
        if (this.state.currentWordIndex > 0) {
            this.state.currentWordIndex--;
            this.render();
        }
    },

    renderImageQuiz() {
        if (!this.state.categoryKey || !VOCABULARY[this.state.categoryKey]) {
            setTimeout(() => this.navigate('home'), 0);
            return document.createElement('div');
        }

        const cat = VOCABULARY[this.state.categoryKey];
        
        if (!this.state.targetWord) {
            this.nextImageQuizQuestion();
        }

        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        
        div.innerHTML = `
            <div class="flex justify-between items-center mb-8">
                <button onclick="App.navigate('category', {categoryKey: '${this.state.categoryKey}'})" class="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:scale-110 transition">✕</button>
                <div class="flex flex-col items-end">
                    <div class="flex gap-1 text-2xl filter drop-shadow-sm">
                        ${'⭐'.repeat(this.state.quizScore)}
                        ${'⚫'.repeat(5 - this.state.quizScore)}
                    </div>
                    ${this.state.combo > 1 ? `<div class="text-orange-500 font-bold animate-bounce text-sm bg-white/80 px-2 rounded-full shadow-sm mt-1">🔥 ${this.state.combo} Combo!</div>` : ''}
                </div>
            </div>

            <div class="flex-1 flex flex-col items-center">
                <div class="bg-white p-6 rounded-3xl shadow-xl w-full text-center mb-8 border-b-8 border-slate-100 flex flex-col items-center gap-4">
                    <h3 class="text-xl text-slate-500 font-bold uppercase tracking-wider">What is this?</h3>
                    <div class="text-[8rem] animate-bounce-short">${this.state.targetWord.emoji}</div>
                </div>

                <div class="grid grid-cols-2 gap-4 w-full">
                    ${this.state.quizOptions.map(word => `
                        <button onclick="App.checkImageQuizAnswer('${word.word}')" class="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center text-xl font-bold text-slate-700 hover:bg-sky-50 active:scale-95 transition border-4 border-transparent hover:border-sky-200 min-h-[80px]">
                            ${word.word}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        return div;
    },

    nextImageQuizQuestion() {
        const cat = VOCABULARY[this.state.categoryKey];
        const target = cat.words[Math.floor(Math.random() * cat.words.length)];
        
        // Pick 3 other random words
        const others = cat.words.filter(w => w.word !== target.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [target, ...others].sort(() => 0.5 - Math.random());

        this.state.targetWord = target;
        this.state.quizOptions = options;
    },

    checkImageQuizAnswer(selectedWord) {
        const isCorrect = selectedWord === this.state.targetWord.word;
        
        if (isCorrect) {
            this.state.combo++;
            this.playEffect('correct');
            this.state.quizScore++;
            if (this.state.quizScore >= 5) {
                this.showWinScreen();
            } else {
                setTimeout(() => {
                    this.nextImageQuizQuestion();
                    this.render();
                }, 1000);
            }
        } else {
            this.state.combo = 0;
            this.playEffect('wrong');
            if (window.navigator.vibrate) window.navigator.vibrate(200);
            window.Toast ? window.Toast.error('Try Again!') : alert('Try Again!');
        }
        this.render();
    },

    renderQuiz() {
        if (!this.state.categoryKey || !VOCABULARY[this.state.categoryKey]) {
            setTimeout(() => this.navigate('home'), 0);
            return document.createElement('div');
        }

        const cat = VOCABULARY[this.state.categoryKey];
        
        // Ensure we have data
        if (!this.state.targetWord) {
            this.nextQuizQuestion();
        }

        const div = document.createElement('div');
        div.className = 'flex flex-col h-full p-6 relative animate-pop';
        
        div.innerHTML = `
            <div class="flex justify-between items-center mb-8">
                <button onclick="App.navigate('category', {categoryKey: '${this.state.categoryKey}'})" class="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:scale-110 transition">✕</button>
                <div class="flex flex-col items-end">
                    <div class="flex gap-1 text-2xl filter drop-shadow-sm">
                        ${'⭐'.repeat(this.state.quizScore)}
                        ${'⚫'.repeat(5 - this.state.quizScore)}
                    </div>
                    ${this.state.combo > 1 ? `<div class="text-orange-500 font-bold animate-bounce text-sm bg-white/80 px-2 rounded-full shadow-sm mt-1">🔥 ${this.state.combo} Combo!</div>` : ''}
                </div>
            </div>

            <div class="flex-1 flex flex-col items-center">
                <div class="bg-white p-6 rounded-3xl shadow-xl w-full text-center mb-8 border-b-8 border-slate-100">
                    <h3 class="text-xl text-slate-500 mb-4 font-bold uppercase tracking-wider">Which one is...</h3>
                    <button onclick="App.speak('${this.state.targetWord.word}')" class="text-4xl font-bold text-sky-600 flex items-center justify-center gap-3 hover:scale-105 transition">
                        <span>🔊</span> ${this.state.targetWord.word}
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4 w-full">
                    ${this.state.quizOptions.map(word => `
                        <button onclick="App.checkAnswer('${word.word}')" class="bg-white aspect-square rounded-2xl shadow-lg flex items-center justify-center text-6xl hover:bg-sky-50 active:scale-95 transition border-4 border-transparent hover:border-sky-200">
                            ${word.emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Auto speak the target word
        setTimeout(() => this.speak(this.state.targetWord.word), 500);

        return div;
    },

    nextQuizQuestion() {
        const cat = VOCABULARY[this.state.categoryKey];
        const target = cat.words[Math.floor(Math.random() * cat.words.length)];
        
        // Pick 3 other random words
        const others = cat.words.filter(w => w.word !== target.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [target, ...others].sort(() => 0.5 - Math.random());

        this.state.targetWord = target;
        this.state.quizOptions = options;
    },

    checkAnswer(selectedWord) {
        const isCorrect = selectedWord === this.state.targetWord.word;
        
        if (isCorrect) {
            this.state.combo++;
            this.playEffect('correct');
            this.state.quizScore++;
            if (this.state.quizScore >= 5) {
                // Win Level
                this.showWinScreen();
            } else {
                setTimeout(() => {
                    this.nextQuizQuestion();
                    this.render();
                }, 1000);
            }
        } else {
            this.state.combo = 0;
            this.playEffect('wrong');
            // Shake effect or similar could be added here
            if (window.navigator.vibrate) window.navigator.vibrate(200);
            window.Toast ? window.Toast.error('Try Again!') : alert('Try Again!');
        }
        this.render(); // Re-render to show combo/score update immediately
    },

    showWinScreen() {
        // Unlock a random sticker
        const stickersPool = ['🌟', '👑', '🎸', '🚀', '🦄', '🍭', '🍦', '🎮', '🎨', '🎪', '🦁', '🐼'];
        const newSticker = stickersPool[Math.floor(Math.random() * stickersPool.length)];
        
        // Save sticker
        if (!this.state.stickers.includes(newSticker)) {
            this.state.stickers.push(newSticker);
            localStorage.setItem('english_adventure_stickers', JSON.stringify(this.state.stickers));
        }

        let buttonsHtml = '';
        if (this.state.view === 'memory') {
            buttonsHtml = `
                <button onclick="App.navigate('home')" class="bg-white text-slate-700 px-8 py-4 rounded-full font-bold shadow-lg">Home</button>
                <button onclick="App.navigate('memory')" class="bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-indigo-200">Play Again</button>
            `;
        } else if (this.state.view === 'imageQuiz') {
            buttonsHtml = `
                <button onclick="App.navigate('category', {categoryKey: '${this.state.categoryKey}'})" class="bg-white text-slate-700 px-8 py-4 rounded-full font-bold shadow-lg">Back</button>
                <button onclick="App.navigate('imageQuiz', {categoryKey: '${this.state.categoryKey}'})" class="bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-200">Play Again</button>
            `;
        } else {
            buttonsHtml = `
                <button onclick="App.navigate('category', {categoryKey: '${this.state.categoryKey}'})" class="bg-white text-slate-700 px-8 py-4 rounded-full font-bold shadow-lg">Back</button>
                <button onclick="App.navigate('quiz', {categoryKey: '${this.state.categoryKey}'})" class="bg-sky-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-sky-200">Play Again</button>
            `;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="flex flex-col h-full items-center justify-center p-6 animate-pop bg-yellow-50">
                <div class="text-8xl mb-6 animate-bounce">🏆</div>
                <h1 class="text-4xl font-bold text-yellow-600 mb-2">YOU WIN!</h1>
                <p class="text-slate-500 mb-8 text-xl">Amazing Job!</p>
                
                <div class="bg-white p-6 rounded-3xl shadow-lg mb-12 flex flex-col items-center animate-pop" style="animation-delay: 0.5s">
                    <div class="text-sm text-slate-400 mb-2 font-bold uppercase tracking-wider">New Sticker!</div>
                    <div class="text-6xl animate-wiggle">${newSticker}</div>
                </div>

                <div class="flex gap-4">
                    ${buttonsHtml}
                </div>
            </div>
        `;
        this.showConfetti();
        this.playEffect('win');
    }
};

// Expose App globally
window.App = App;

// Initialize App
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
