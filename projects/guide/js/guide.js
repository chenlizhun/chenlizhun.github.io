document.addEventListener('DOMContentLoaded', () => {
    // Inject Toast Container if not present
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    // Generic Copy Code Logic
    document.querySelectorAll('.code-block').forEach(block => {
        // Check if button already exists
        if (block.querySelector('.copy-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        
        btn.addEventListener('click', () => {
            // Get text content
            const clone = block.cloneNode(true);
            const existingBtn = clone.querySelector('.copy-btn');
            if (existingBtn) existingBtn.remove();
            
            const code = clone.textContent.trim();
            
            navigator.clipboard.writeText(code).then(() => {
                showToast('Code copied!');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        });
        
        block.appendChild(btn);
    });
});

// Expose showToast globally
window.showToast = function(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    
    toast.timeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
};

// Expose copyToClipboard globally (for Color cards)
window.copyToClipboard = function(variable, hex) {
    const textToCopy = `var(${variable})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied ${variable}`);
    });
};

// Confetti Logic
window.createConfetti = function(x, y) {
    const colors = ['#FFD93D', '#6BCB77', '#FF6B6B', '#4D96FF', '#FBB6CE'];
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        // Random velocity
        const velocityX = (Math.random() - 0.5) * 15;
        const velocityY = (Math.random() - 1) * 15;
        
        document.body.appendChild(particle);
        
        let posX = x;
        let posY = y;
        let velX = velocityX;
        let velY = velocityY;
        let opacity = 1;
        
        const animate = () => {
            posX += velX;
            posY += velY;
            velY += 0.8; // Gravity
            opacity -= 0.02;
            
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${opacity})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Auto-bind confetti
document.addEventListener('click', (e) => {
    if (e.target.closest('.trigger-confetti')) {
        createConfetti(e.clientX, e.clientY);
    }
});
