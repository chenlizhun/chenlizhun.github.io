const TinyPianoApp = {
    audioCtx: null,
    masterGain: null,
    reverbNode: null,
    
    config: {
        notes: {
            'a': { note: 'C4', solfege: 'Do', type: 'white', freq: 261.63 },
            'w': { note: 'C#4', solfege: 'Di', type: 'black', freq: 277.18 },
            's': { note: 'D4', solfege: 'Re', type: 'white', freq: 293.66 },
            'e': { note: 'D#4', solfege: 'Ri', type: 'black', freq: 311.13 },
            'd': { note: 'E4', solfege: 'Mi', type: 'white', freq: 329.63 },
            'f': { note: 'F4', solfege: 'Fa', type: 'white', freq: 349.23 },
            't': { note: 'F#4', solfege: 'Fi', type: 'black', freq: 369.99 },
            'g': { note: 'G4', solfege: 'Sol', type: 'white', freq: 392.00 },
            'y': { note: 'G#4', solfege: 'Si', type: 'black', freq: 415.30 },
            'h': { note: 'A4', solfege: 'La', type: 'white', freq: 440.00 },
            'u': { note: 'A#4', solfege: 'Li', type: 'black', freq: 466.16 },
            'j': { note: 'B4', solfege: 'Ti', type: 'white', freq: 493.88 },
            'k': { note: 'C5', solfege: 'Do', type: 'white', freq: 523.25 },
            'o': { note: 'C#5', solfege: 'Di', type: 'black', freq: 554.37 },
            'l': { note: 'D5', solfege: 'Re', type: 'white', freq: 587.33 },
            'p': { note: 'D#5', solfege: 'Ri', type: 'black', freq: 622.25 },
            ';': { note: 'E5', solfege: 'Mi', type: 'white', freq: 659.25 }
        },
        songs: {
            'ode_to_joy': {
                title: '欢乐颂 (Ode to Joy)',
                // E E F G | G F E D | C C D E | E . D . D
                notes: ['d', 'd', 'f', 'g', 'g', 'f', 'd', 's', 'a', 'a', 's', 'd', 'd', 's', 's']
            },
            'twinkle_star': {
                title: '小星星 (Twinkle Star)',
                // C C G G | A A G | F F E E | D D C
                notes: ['a', 'a', 'g', 'g', 'h', 'h', 'g', 'f', 'f', 'd', 'd', 's', 's', 'a']
            },
            'jingle_bells': {
                title: '铃儿响叮当 (Jingle Bells)',
                // E E E | E E E | E G C D | E
                notes: ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'g', 'a', 's', 'd']
            },
            'mary_had_a_little_lamb': {
                title: '玛丽有只小羊羔 (Mary Had a Little Lamb)',
                // Mi Re Do Re | Mi Mi Mi | Re Re Re | Mi Sol Sol
                notes: ['d', 's', 'a', 's', 'd', 'd', 'd', 's', 's', 's', 'd', 'g', 'g']
            },
            'london_bridge': {
                title: '伦敦桥 (London Bridge)',
                // Sol La Sol Fa | Mi Fa Sol | Re E F | Mi F G
                notes: ['g', 'h', 'g', 'f', 'd', 'f', 'g', 's', 'd', 'f', 'd', 'f', 'g']
            },
            'happy_birthday': {
                title: '生日快乐 (Happy Birthday)',
                // Sol Sol La Sol Do Ti | Sol Sol La Sol Re Do
                notes: ['a', 'a', 's', 'a', 'f', 'd', 'a', 'a', 's', 'a', 'g', 'f']
            }
        }
    },
    state: {
        currentSongId: 'ode_to_joy',
        currentNoteIndex: 0,
        isPlaying: false,
        isPlayingDemo: false
    },
    
    init() {
        this.renderKeys();
        this.loadSong('ode_to_joy');
        this.bindEvents();
        this.initAuth();
        // Pre-init audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioCtx) this.initAudio();
        }, { once: true });
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
                    userEl.textContent = `🎹 ${name}`;
                    userEl.classList.replace('bg-gray-100', 'bg-blue-100');
                    userEl.classList.replace('text-gray-400', 'text-blue-500');
                }
            });
        }
    },

    initAudio() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        
        // Master Volume
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.audioCtx.destination);

        // Reverb Effect (Convolver)
        this.reverbNode = this.audioCtx.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(2, 2.0); // 2s duration, decay
        
        // Wet/Dry Mix for Reverb (Simple implementation: just connect reverb to master)
        // A better way is Dry -> Master, Wet -> Reverb -> Master
        // We'll do simple: Sound -> Reverb -> Master (Full Wet? No, too washy)
        // Let's do: Sound -> Master AND Sound -> ReverbGain -> Reverb -> Master
        
        this.reverbGain = this.audioCtx.createGain();
        this.reverbGain.gain.value = 0.3; // 30% Reverb
        this.reverbGain.connect(this.reverbNode);
        this.reverbNode.connect(this.masterGain);
    },

    createReverbImpulse(duration, decay) {
        const rate = this.audioCtx.sampleRate;
        const length = rate * duration;
        const impulse = this.audioCtx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            // Exponential decay noise
            const n = i / length;
            const vol = Math.pow(1 - n, decay);
            left[i] = (Math.random() * 2 - 1) * vol;
            right[i] = (Math.random() * 2 - 1) * vol;
        }
        return impulse;
    },

    playNote(key, isAuto = false) {
        if (!this.audioCtx) this.initAudio();
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const noteData = this.config.notes[key];
        if (!noteData) return;

        // --- Sound Synthesis ---
        const t = this.audioCtx.currentTime;
        
        // Oscillator 1: Triangle (Body)
        const osc1 = this.audioCtx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(noteData.freq, t);

        // Oscillator 2: Sine (Fundamental)
        const osc2 = this.audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(noteData.freq, t);

        // Envelope
        const env = this.audioCtx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.6, t + 0.02); // Attack
        env.gain.exponentialRampToValueAtTime(0.01, t + 1.5); // Decay/Release

        // Connect graph
        osc1.connect(env);
        osc2.connect(env);
        
        env.connect(this.masterGain); // Dry signal
        env.connect(this.reverbGain); // Wet signal input

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 1.5);
        osc2.stop(t + 1.5);

        // --- Visuals ---
        this.highlightKey(key);
        this.spawnParticles(key); // New!
        
        if (!isAuto) {
            this.checkSongProgress(key);
            
            // If user plays, stop demo if running
            if (this.state.isPlayingDemo) {
                this.state.isPlayingDemo = false;
                const btn = document.getElementById('btn-demo');
                if(btn) btn.innerHTML = '<span>▶</span> 示范';
            }
        }
    },

    async playDemo() {
        if (this.state.isPlayingDemo) {
            // Stop if already playing
            this.state.isPlayingDemo = false;
            document.getElementById('btn-demo').innerHTML = '<span>▶</span> 示范';
            return;
        }

        this.state.isPlayingDemo = true;
        document.getElementById('btn-demo').innerHTML = '<span>⏹</span> 停止';
        
        const song = this.config.songs[this.state.currentSongId];
        
        // Reset progress for visual clarity? No, keep it separate or reset it?
        // Let's reset visual progress so demo looks clean
        this.state.currentNoteIndex = 0;
        document.querySelectorAll('.sheet-note').forEach(el => {
            el.classList.remove('current', 'matched');
        });
        const first = document.querySelector('.sheet-note[data-index="0"]');
        if(first) first.classList.add('current');

        for (let i = 0; i < song.notes.length; i++) {
            if (!this.state.isPlayingDemo) break;
            
            const noteKey = song.notes[i];
            
            // Highlight sheet note
            const currentEl = document.querySelector(`.sheet-note[data-index="${i}"]`);
            if (currentEl) {
                document.querySelectorAll('.sheet-note').forEach(el => el.classList.remove('current'));
                currentEl.classList.add('current');
            }

            this.playNote(noteKey, true); // Play sound & key visual
            
            // Wait
            await new Promise(r => setTimeout(r, 600));
        }

        this.state.isPlayingDemo = false;
        document.getElementById('btn-demo').innerHTML = '<span>▶</span> 示范';
        
        // Reset sheet for user to play
        this.state.currentNoteIndex = 0;
        document.querySelectorAll('.sheet-note').forEach(el => {
            el.classList.remove('current', 'matched');
        });
        const resetFirst = document.querySelector('.sheet-note[data-index="0"]');
        if(resetFirst) resetFirst.classList.add('current');
    },

    highlightKey(key) {
        const keyEl = document.querySelector(`.key[data-key="${key}"]`);
        if (keyEl) {
            keyEl.classList.add('active');
            setTimeout(() => keyEl.classList.remove('active'), 200);
        }
    },

    spawnParticles(key) {
        const keyEl = document.querySelector(`.key[data-key="${key}"]`);
        if (!keyEl) return;
        
        const rect = keyEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const bottomY = rect.bottom - 20;

        // Brand colors: Pink, Purple, Yellow, Green
        const colors = ['#D53F8C', '#667eea', '#FBBF24', '#34D399'];
        
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = centerX + 'px';
            p.style.top = bottomY + 'px';
            p.style.width = '8px';
            p.style.height = '8px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.borderRadius = '50%';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '9999';
            
            document.body.appendChild(p);

            const angle = Math.random() * Math.PI; // Upwards semi-circle
            const velocity = 2 + Math.random() * 4;
            let vx = Math.cos(angle) * velocity;
            let vy = -Math.sin(angle) * velocity; // Negative is up
            let opacity = 1;

            const animate = () => {
                vx *= 0.95; // Drag
                vy += 0.2;  // Gravity
                
                const left = parseFloat(p.style.left) + vx;
                const top = parseFloat(p.style.top) + vy;
                
                opacity -= 0.03;
                p.style.opacity = opacity;
                p.style.left = left + 'px';
                p.style.top = top + 'px';
                p.style.transform = `scale(${opacity})`;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    },

    renderKeys() {
        const container = document.getElementById('piano-keys');
        container.innerHTML = '';
        const visualOrder = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];
        
        visualOrder.forEach(key => {
            if (!this.config.notes[key]) return;
            const noteData = this.config.notes[key];
            const el = document.createElement('div');
            el.className = `key key-${noteData.type}`;
            el.dataset.key = key;
            el.innerHTML = `
                <span class="note-char">${key.toUpperCase()}</span>
                ${noteData.type === 'white' ? `<span class="note-name">${noteData.note}</span>` : ''}
            `;
            el.addEventListener('mousedown', () => this.playNote(key));
            container.appendChild(el);
        });
    },

    loadSong(songId) {
        this.state.currentSongId = songId;
        this.state.currentNoteIndex = 0;
        this.state.isPlayingDemo = false; // Stop demo if switching
        document.getElementById('btn-demo').innerHTML = '<span>▶</span> 示范';
        
        const song = this.config.songs[songId];
        document.getElementById('song-title').textContent = `${song.title}`;
        
        const sheetContainer = document.getElementById('sheet-music');
        sheetContainer.innerHTML = '';
        
        song.notes.forEach((key, index) => {
            const noteData = this.config.notes[key];
            const noteEl = document.createElement('div');
            noteEl.className = 'sheet-note';
            noteEl.innerHTML = `
                <span class="note-main">${noteData ? noteData.solfege : key}</span>
                <span class="note-sub">${key.toUpperCase()}</span>
            `;
            noteEl.dataset.index = index;
            if (index === 0) noteEl.classList.add('current');
            sheetContainer.appendChild(noteEl);
            
            if ((index + 1) % 4 === 0 && index < song.notes.length - 1) {
                const spacer = document.createElement('div');
                spacer.className = 'sheet-spacer';
                spacer.textContent = '|';
                sheetContainer.appendChild(spacer);
            }
        });
    },

    checkSongProgress(key) {
        const song = this.config.songs[this.state.currentSongId];
        const expectedKey = song.notes[this.state.currentNoteIndex];
        
        if (key === expectedKey) {
            const currentEl = document.querySelector(`.sheet-note[data-index="${this.state.currentNoteIndex}"]`);
            if (currentEl) {
                currentEl.classList.remove('current');
                currentEl.classList.add('matched');
            }
            
            this.state.currentNoteIndex++;
            
            if (this.state.currentNoteIndex < song.notes.length) {
                const nextEl = document.querySelector(`.sheet-note[data-index="${this.state.currentNoteIndex}"]`);
                if (nextEl) nextEl.classList.add('current');
            } else {
                this.showSuccess();
            }
        }
    },

    showSuccess() {
        const toast = document.getElementById('success-toast');
        const song = this.config.songs[this.state.currentSongId];
        document.getElementById('success-message').textContent = `你完成了《${song.title}》！`;
        
        // Confetti explosion!
        for(let i=0; i<5; i++) {
            setTimeout(() => {
                const x = window.innerWidth / 2 + (Math.random()*200 - 100);
                const y = window.innerHeight / 2 + (Math.random()*200 - 100);
                this.spawnParticles({getBoundingClientRect: () => ({left: x, width: 0, bottom: y})}); // Hacky but works with spawnParticles logic expecting element
            }, i * 200);
        }
        
        toast.classList.remove('opacity-0', 'pointer-events-none', 'scale-90');
        
        // Auto hide
        setTimeout(() => {
             // toast.classList.add('opacity-0', 'pointer-events-none', 'scale-90');
             // Let user close it manually or replay
        }, 3000);
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            if (this.config.notes[key]) {
                this.playNote(key);
            }
        });

        document.getElementById('song-selector').addEventListener('change', (e) => {
            this.loadSong(e.target.value);
        });
        
        document.getElementById('btn-toast-close').addEventListener('click', () => {
            const toast = document.getElementById('success-toast');
            toast.classList.add('opacity-0', 'pointer-events-none', 'scale-90');
            this.loadSong(this.state.currentSongId); // Reset
        });
    }
};

window.TinyPianoApp = TinyPianoApp;
document.addEventListener('DOMContentLoaded', () => TinyPianoApp.init());
