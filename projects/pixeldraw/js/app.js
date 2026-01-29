const PixelApp = {
    config: {
        gridSize: 32, // 32x32 pixels logical
        canvasSize: 512, // 512x512 pixels physical display
        pixelSize: 16, // 512 / 32 = 16px per logical pixel
        showGrid: true
    },
    state: {
        isDrawing: false,
        currentTool: 'pen', // pen, eraser, bucket
        currentColor: '#000000',
        pixels: [], // 2D array [y][x]
        history: [],
        historyIndex: -1,
        isSymmetry: false
    },
    dom: {},
    audio: {
        ctx: null,
        enabled: true
    },

    init() {
        this.initAudio();
        this.cacheDOM();
        this.initGrid();
        
        // Try to load from storage first
        if (!this.loadFromStorage()) {
            this.saveState(); // Save initial empty state if nothing loaded
        }
        
        this.initPalette();
        this.bindEvents();
        this.renderCanvas();
        this.updateHistoryButtons(); // Ensure buttons update based on loaded history
        
        // Auth Integration (Optional)
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
                    userEl.textContent = `🎨 ${name}`;
                    userEl.classList.replace('bg-gray-100', 'bg-pink-100');
                    userEl.classList.replace('text-gray-400', 'text-pink-500');
                }
            });
        }

        console.log("PixelDraw Initialized");
    },

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audio.ctx = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.audio.enabled = false;
        }
    },

    playSound(type) {
        if (!this.audio.enabled || !this.audio.ctx) return;
        
        // Resume context if suspended (browser policy)
        if (this.audio.ctx.state === 'suspended') {
            this.audio.ctx.resume();
        }

        const ctx = this.audio.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'draw') {
            // Soft pop
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'erase') {
            // White noise-ish (using high freq sine cluster for simplicity or just low sine)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'undo' || type === 'redo') {
            // Whoosh
            osc.type = 'sine';
            osc.frequency.setValueAtTime(type === 'undo' ? 400 : 200, now);
            osc.frequency.linearRampToValueAtTime(type === 'undo' ? 200 : 400, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'clear') {
            // Trash sound
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'save') {
            // Success chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            
            // Add a second oscillator for harmony
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6
            gain2.gain.setValueAtTime(0, now);
            gain2.gain.setValueAtTime(0.05, now + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc2.start(now);
            osc2.stop(now + 0.6);
        }
    },

    saveToStorage() {
        const data = {
            pixels: this.state.pixels,
            currentColor: this.state.currentColor,
            currentTool: this.state.currentTool,
            isSymmetry: this.state.isSymmetry
        };
        localStorage.setItem('pixeldraw_state', JSON.stringify(data));
    },

    loadFromStorage() {
        const saved = localStorage.getItem('pixeldraw_state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.pixels && data.pixels.length === this.config.gridSize) {
                    this.state.pixels = data.pixels;
                    this.state.currentColor = data.currentColor || '#000000';
                    this.state.currentTool = data.currentTool || 'pen';
                    this.state.isSymmetry = !!data.isSymmetry;
                    
                    // Rebuild history with just this state to start
                    this.state.history = [JSON.parse(JSON.stringify(this.state.pixels))];
                    this.state.historyIndex = 0;
                    
                    return true;
                }
            } catch (e) {
                console.error('Failed to load save state', e);
            }
        }
        return false;
    },

    cacheDOM() {
        this.dom.canvas = document.getElementById('pixel-canvas');
        this.dom.ctx = this.dom.canvas.getContext('2d');
        this.dom.previewCanvas = document.getElementById('preview-canvas');
        this.dom.previewCtx = this.dom.previewCanvas.getContext('2d');
        this.dom.colorPicker = document.getElementById('color-picker');
        this.dom.colorHex = document.getElementById('color-hex');
        this.dom.tools = document.querySelectorAll('.tool-btn[data-tool]');
        this.dom.clearBtn = document.getElementById('btn-clear');
        this.dom.gridBtn = document.getElementById('btn-grid');
        this.dom.undoBtn = document.getElementById('btn-undo');
        this.dom.redoBtn = document.getElementById('btn-redo');
        this.dom.symmetryBtn = document.getElementById('btn-symmetry');
        this.dom.downloadBtn = document.getElementById('btn-download');
        this.dom.paletteContainer = document.getElementById('preset-colors');
    },

    saveState() {
        // Remove any future states if we are in the middle of history
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        }

        // Deep copy pixels
        const snapshot = JSON.parse(JSON.stringify(this.state.pixels));
        this.state.history.push(snapshot);
        this.state.historyIndex++;

        // Limit history size (e.g., 50 steps)
        if (this.state.history.length > 50) {
            this.state.history.shift();
            this.state.historyIndex--;
        }

        this.updateHistoryButtons();
    },

    undo() {
        if (this.state.historyIndex > 0) {
            this.state.historyIndex--;
            this.state.pixels = JSON.parse(JSON.stringify(this.state.history[this.state.historyIndex]));
            this.renderCanvas();
            this.updateHistoryButtons();
            this.playSound('undo');
        }
    },

    redo() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.historyIndex++;
            this.state.pixels = JSON.parse(JSON.stringify(this.state.history[this.state.historyIndex]));
            this.renderCanvas();
            this.updateHistoryButtons();
            this.playSound('redo');
        }
    },

    updateHistoryButtons() {
        this.dom.undoBtn.disabled = this.state.historyIndex <= 0;
        this.dom.redoBtn.disabled = this.state.historyIndex >= this.state.history.length - 1;
        
        this.dom.undoBtn.classList.toggle('opacity-50', this.dom.undoBtn.disabled);
        this.dom.redoBtn.classList.toggle('opacity-50', this.dom.redoBtn.disabled);
    },

    toggleSymmetry() {
        this.state.isSymmetry = !this.state.isSymmetry;
        this.dom.symmetryBtn.classList.toggle('active', this.state.isSymmetry);
        this.dom.symmetryBtn.classList.toggle('text-pink-500', this.state.isSymmetry);
        
        // Visual feedback on canvas
        this.renderCanvas();
    },

    resetClearBtn() {
        this.dom.clearBtn.dataset.confirm = 'false';
        this.dom.clearBtn.innerHTML = '🗑️';
        this.dom.clearBtn.classList.remove('bg-red-100', 'text-red-600');
        if (this.clearBtnTimeout) clearTimeout(this.clearBtnTimeout);
    },

    initGrid() {
        // Initialize empty pixel grid
        for (let y = 0; y < this.config.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.config.gridSize; x++) {
                row.push(null); // null means transparent/white
            }
            this.state.pixels.push(row);
        }
    },

    initPalette() {
        const colors = [
            '#000000', '#555555', '#AAAAAA', '#FFFFFF',
            '#EF4444', '#F97316', '#F59E0B', '#EAB308', // Red, Orange, Amber, Yellow
            '#84CC16', '#22C55E', '#10B981', '#14B8A6', // Lime, Green, Emerald, Teal
            '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', // Cyan, Sky, Blue, Indigo
            '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', // Violet, Purple, Fuchsia, Pink
            '#F43F5E', '#78350F', '#713F12', '#FCD34D'  // Rose, Brown...
        ];

        colors.forEach(color => {
            const el = document.createElement('div');
            el.className = 'color-swatch';
            el.style.backgroundColor = color;
            el.dataset.color = color;
            el.onclick = () => this.setColor(color);
            this.dom.paletteContainer.appendChild(el);
        });

        // Set initial active
        this.setColor(this.state.currentColor);
    },

    setColor(color) {
        this.state.currentColor = color;
        this.dom.colorPicker.value = color;
        this.dom.colorHex.textContent = color;
        
        // Update UI
        document.querySelectorAll('.color-swatch').forEach(el => {
            if (el.dataset.color.toLowerCase() === color.toLowerCase()) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        if (this.state.currentTool === 'eraser') {
            this.setTool('pen');
        }
        this.saveToStorage();
    },

    setTool(tool) {
        this.state.currentTool = tool;
        this.dom.tools.forEach(btn => {
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this.saveToStorage();
    },

    bindEvents() {
        // Canvas Interaction
        const startPaint = (e) => {
            this.saveState(); // Save state before starting a new stroke
            this.state.isDrawing = true;
            this.handleInput(e);
        };
        
        const stopPaint = () => {
            this.state.isDrawing = false;
        };

        const movePaint = (e) => {
            if (this.state.isDrawing) {
                this.handleInput(e);
            }
        };

        this.dom.canvas.addEventListener('mousedown', startPaint);
        this.dom.canvas.addEventListener('mousemove', movePaint);
        window.addEventListener('mouseup', stopPaint);
        
        // Touch support
        this.dom.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPaint(e.touches[0]); }, {passive: false});
        this.dom.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); movePaint(e.touches[0]); }, {passive: false});
        window.addEventListener('touchend', stopPaint);

        // Tool Buttons
        this.dom.tools.forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });

        // Color Picker Input
        this.dom.colorPicker.addEventListener('input', (e) => this.setColor(e.target.value));

        // New Controls
        this.dom.undoBtn.addEventListener('click', () => this.undo());
        this.dom.redoBtn.addEventListener('click', () => this.redo());
        this.dom.symmetryBtn.addEventListener('click', () => this.toggleSymmetry());

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.redo();
                } else {
                    this.undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });

        // Clear
        this.dom.clearBtn.addEventListener('click', () => {
            if(confirm('确定要清空画布吗？')) {
                this.saveState(); // Save before clearing
                this.initGrid(); // Reset state
                this.state.pixels = []; 
                for (let y = 0; y < this.config.gridSize; y++) {
                    const row = [];
                    for (let x = 0; x < this.config.gridSize; x++) row.push(null);
                    this.state.pixels.push(row);
                }
                this.renderCanvas();
                this.playSound('clear');
            }
        });

        // Grid Toggle
        this.dom.gridBtn.addEventListener('click', () => {
            this.config.showGrid = !this.config.showGrid;
            this.dom.gridBtn.classList.toggle('text-pink-500', this.config.showGrid);
            this.renderCanvas();
        });

        // Download
        this.dom.downloadBtn.addEventListener('click', () => this.downloadImage());
    },

    handleInput(e) {
        const rect = this.dom.canvas.getBoundingClientRect();
        
        // Calculate scale (display size vs actual size)
        const scaleX = this.dom.canvas.width / rect.width;
        const scaleY = this.dom.canvas.height / rect.height;

        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.config.pixelSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.config.pixelSize);

        if (x >= 0 && x < this.config.gridSize && y >= 0 && y < this.config.gridSize) {
            this.applyTool(x, y);
        }
    },

    applyTool(x, y) {
        const tool = this.state.currentTool;
        const targets = [{x, y}];
        
        if (this.state.isSymmetry) {
            const mirrorX = this.config.gridSize - 1 - x;
            if (mirrorX !== x) {
                targets.push({x: mirrorX, y});
            }
        }

        let changed = false;

        targets.forEach(t => {
            if (tool === 'pen') {
                if (this.state.pixels[t.y][t.x] !== this.state.currentColor) {
                    this.state.pixels[t.y][t.x] = this.state.currentColor;
                    changed = true;
                }
            } else if (tool === 'eraser') {
                if (this.state.pixels[t.y][t.x] !== null) {
                    this.state.pixels[t.y][t.x] = null;
                    changed = true;
                }
            } else if (tool === 'bucket') {
                this.floodFill(t.x, t.y, this.state.pixels[t.y][t.x], this.state.currentColor);
                changed = true;
            } else if (tool === 'eyedropper') {
                const color = this.state.pixels[t.y][t.x];
                if (color) {
                    this.setColor(color);
                    this.setTool('pen'); // Auto-switch back to pen for better UX
                }
            }
        });

        if (changed) {
            this.renderCanvas();
            if (tool === 'eraser') {
                this.playSound('erase');
            } else {
                this.playSound('draw');
            }
        }
    },

    floodFill(startX, startY, targetColor, replacementColor) {
        if (targetColor === replacementColor) return;
        
        const stack = [[startX, startY]];
        
        while (stack.length) {
            const [x, y] = stack.pop();
            
            if (x < 0 || x >= this.config.gridSize || y < 0 || y >= this.config.gridSize) continue;
            
            if (this.state.pixels[y][x] === targetColor) {
                this.state.pixels[y][x] = replacementColor;
                
                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }
    },

    renderPreview() {
        const ctx = this.dom.previewCtx;
        const { width, height } = this.dom.previewCanvas;
        const gridSize = this.config.gridSize;
        const pixelSize = width / gridSize; // e.g., 128 / 32 = 4px

        ctx.clearRect(0, 0, width, height);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const color = this.state.pixels[y][x];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    },

    renderCanvas() {
        const ctx = this.dom.ctx;
        const { width, height } = this.dom.canvas;
        const { pixelSize, gridSize, showGrid } = this.config;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Pixels
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const color = this.state.pixels[y][x];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        // Draw Grid
        if (showGrid) {
            ctx.strokeStyle = '#E2E8F0'; // Very light gray
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            // Vertical lines
            for (let x = 0; x <= gridSize; x++) {
                ctx.moveTo(x * pixelSize, 0);
                ctx.lineTo(x * pixelSize, height);
            }
            
            // Horizontal lines
            for (let y = 0; y <= gridSize; y++) {
                ctx.moveTo(0, y * pixelSize);
                ctx.lineTo(width, y * pixelSize);
            }
            
            ctx.stroke();
        }

        // Draw Symmetry Line
        if (this.state.isSymmetry) {
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)'; // Pink-500 transparent
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Trigger preview update
        this.renderPreview();
        // Trigger auto-save
        this.saveToStorage();
    },

    downloadImage() {
        // Confetti!
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        
        this.playSound('save');

        // Temporarily hide grid and symmetry line to save clean image
        const wasGridVisible = this.config.showGrid;
        const wasSymmetryVisible = this.state.isSymmetry;
        
        this.config.showGrid = false;
        this.state.isSymmetry = false;
        this.renderCanvas();

        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.png`;
        link.href = this.dom.canvas.toDataURL('image/png');
        link.click();

        // Restore grid
        this.config.showGrid = wasGridVisible;
        this.state.isSymmetry = wasSymmetryVisible;
        this.renderCanvas();
    }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    PixelApp.init();
});
