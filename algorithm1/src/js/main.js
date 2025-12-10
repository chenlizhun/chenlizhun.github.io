// Main application logic for Algorithm1 Web App

// 全局调试信息
console.log('Algorithm1 Web App loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Load and display chapters first
    loadChapters();

    // Add event listener for back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', showChapterList);
    }
});

// Load and display chapters
function loadChapters() {
    const chapterNav = document.getElementById('chapter-nav');
    const chaptersList = document.getElementById('chapters-list');
    
    if (!chaptersList) {
        console.error('chaptersList not found');
        return;
    }
    
    // Clear existing content
    chaptersList.innerHTML = '';
    
    // Create a grid container for chapter cards
    const gridContainer = document.createElement('div');
    gridContainer.className = 'chapters-grid';
    
    // Create chapter cards
    if (algorithms && algorithms.length > 0) {
        algorithms.forEach((chapter, index) => {
            const chapterCard = createChapterCard(chapter, index);
            gridContainer.appendChild(chapterCard);
        });
    } else {
        console.error('algorithms is undefined or empty');
        gridContainer.innerHTML = '<div class="text-red-500">Error: No chapters found</div>';
    }
    
    // Append the grid container to the chapters list
    chaptersList.appendChild(gridContainer);
}

// Create a chapter card element
function createChapterCard(chapter, chapterIndex) {
    const card = document.createElement('div');
    card.className = 'chapter-card cursor-pointer';
    card.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-primary bg-blue-100 px-2 py-1 rounded">第${chapterIndex + 1}课</span>
                <span class="text-xs font-medium text-gray-500">📝 ${chapter.problems.length}道题目</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${chapter.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">${chapter.description}</p>
        </div>
    `;
    
    // Add click event to show chapter details
    card.addEventListener('click', () => {
        showChapterDetails(chapter.title); // 使用章节标题作为ID查找
    });
    
    return card;
}

// Global variable to track active chapter
let activeChapterIndex = -1;

// Show chapter details with loading state
function showChapterDetails(chapterTitle) {
    // 根据章节标题查找章节
    const chapter = algorithms.find(c => c.title === chapterTitle);
    if (!chapter) return;

    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    const algorithmContent = document.getElementById('algorithm-content');
    
    // Show algorithm detail immediately
    algorithmDetail.classList.remove('hidden');
    
    // Generate HTML for the chapter details
    let html = `
        <div class="p-6">
            <button id="back-btn" class="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                返回课程列表
            </button>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">${chapter.title}</h2>
        </div>
    `;
    
    // Add chapter description
    html += `<p class="text-gray-600 mb-8 px-6">${chapter.description}</p>`;
    
    // Add problems
    chapter.problems.forEach((problem, index) => {
        html += createProblemHTML(problem, index + 1);
    });
    
    // Update content
    algorithmContent.innerHTML = html;
    
    // Hide chapter list
    chapterNav.classList.add('hidden');
    
    // Initialize code highlighting and copy buttons
    initializeCodeHighlighting();
    initializeCopyCodeButtons();
    
    // Add event listener for back button
    document.getElementById('back-btn').addEventListener('click', showChapterList);
    
    // Initialize tabs for each problem
    initializeProblemTabs();
    
    // Initialize step visualizations
    initializeStepVisualizations();
}

// Create HTML for a problem
function createProblemHTML(problem, problemIndex) {
    // Get LeetCode URL from the problem object if it exists
    const leetCodeUrl = problem.leetCodeUrl || '';
    
    return `
        <div class="algorithm-section">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                题目${problemIndex + 1}: ${problem.title}
                ${leetCodeUrl ? `<a href="${leetCodeUrl}" target="_blank" class="leetcode-link ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    LeetCode
                </a>` : ''}
            </h3>
            
            <div class="mb-4">
                <p class="text-gray-600">${problem.description}</p>
            </div>
            
            <!-- Two-column layout: left for tab content, right for fixed code -->
            <div class="flex flex-row gap-6 tab-container">
                <!-- Left column: tab content -->
                <div class="flex-1">
                    <!-- Tab buttons -->
                    <div class="tab-buttons">
                        <button class="tab-button active" data-tab="description" data-problem="${problemIndex}">
                            题目描述
                        </button>
                        <button class="tab-button" data-tab="steps" data-problem="${problemIndex}">
                            步骤说明
                        </button>
                    </div>
                    
                    <!-- Tab contents -->
                    <div class="tab-content-wrapper">
                        <div class="tab-content active" id="description-${problemIndex}">
                            <div class="bg-gray-50 p-4 rounded-lg">
                            ${problem.input ? `
                                <div class="input-output">
                                    <h4>输入:</h4>
                                    <pre>${problem.input}</pre>
                                </div>
                            ` : ''}
                            ${problem.output ? `
                                <div class="input-output">
                                    <h4>输出:</h4>
                                    <pre>${problem.output}</pre>
                                </div>
                            ` : ''}
                            <div class="example-code">
    <h4>示例：</h4>
    <pre><code>${problem.example}</code></pre>
</div>
                        </div>
                        </div>
                        
                        <div class="tab-content" id="steps-${problemIndex}">
                            <div id="steps-container-${problemIndex}">
                                ${createStepsHTML(problem.steps)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right column: code area -->
                <div class="flex-1 max-w-2xl sticky top-4 self-start overflow-visible">
                    <div class="rounded-lg shadow-md border border-gray-200">
                        <div class="code-container">
                            <div class="code-header">
                                <span>Dart 代码</span>
                                <button class="copy-btn">复制代码</button>
                            </div>
                            <pre><code class="language-dart line-numbers">${problem.code}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create HTML for steps visualization
function createStepsHTML(steps) {
    let html = '';
    steps.forEach((step, index) => {
        let visualizationHTML = '';
        if (step.visualization) {
            if (step.visualization.startsWith('create') || step.visualization.includes('createArrayVisualization') || step.visualization.includes('createComparisonVisualization')) {
                // Execute the visualization function call
                visualizationHTML = eval(step.visualization);
            } else {
                // Use the visualization as is if it's not a function call
                visualizationHTML = step.visualization;
            }
        }
        html += `
            <div class="step-container">
                <div class="step flex items-start">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h4 class="font-medium mb-1">${step.title}</h4>
                        <p class="text-gray-600">${step.description}</p>
                        ${visualizationHTML ? `<div class="mt-2">${visualizationHTML}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    return html;
}

// Initialize tab functionality for each problem
function initializeProblemTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            const problemIndex = button.getAttribute('data-problem');
            
            // Remove active class from all buttons in the same problem
            const problemButtons = button.parentElement.querySelectorAll('.tab-button');
            problemButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-600');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            button.classList.remove('text-gray-600');
            
            // Hide all tab contents for this problem except the fixed code area
            const allProblemContents = document.querySelectorAll(`[id$="-${problemIndex}"]`);
            allProblemContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const selectedContent = document.getElementById(`${tab}-${problemIndex}`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
        });
    });
}

// Initialize step visualizations
function initializeStepVisualizations() {
    // Additional step visualization logic can be added here
}

// Initialize code highlighting with Prism.js
function initializeCodeHighlighting() {
    // Make sure Prism is loaded
    if (typeof Prism !== 'undefined') {
        // Add line numbers to code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Add line-numbers class
            block.classList.add('line-numbers');
            // Ensure proper language class is set
            if (!block.classList.contains('language-dart')) {
                block.classList.add('language-dart');
            }
        });
        
        // Apply syntax highlighting
        Prism.highlightAll();
    }
}

// Initialize copy code buttons
function initializeCopyCodeButtons() {
    // Add event listeners to all copy buttons
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.closest('.code-container').querySelector('code');
            const codeText = codeBlock.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                // Show feedback
                const originalText = this.textContent;
                this.textContent = '已复制!';
                this.style.backgroundColor = '#10b981';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        });
    });
}

// Show chapter list
function showChapterList() {
    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    
    // Hide algorithm detail, show chapter list
    algorithmDetail.classList.add('hidden');
    chapterNav.classList.remove('hidden');
}