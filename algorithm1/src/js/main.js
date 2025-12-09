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
    
    // Create chapter cards
    if (algorithms && algorithms.length > 0) {
        algorithms.forEach((chapter, index) => {
            const chapterCard = createChapterCard(chapter, index);
            chaptersList.appendChild(chapterCard);
        });
    } else {
        console.error('algorithms is undefined or empty');
        chaptersList.innerHTML = '<div class="text-red-500">Error: No chapters found</div>';
    }
}

// Create a chapter card element
function createChapterCard(chapter, chapterIndex) {
    const card = document.createElement('div');
    card.className = 'chapter-card bg-white rounded-lg shadow-md p-6 cursor-pointer';
    card.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800">第${chapterIndex + 1}课: ${chapter.title}</h3>
        <p class="text-gray-600 mt-2">${chapter.description}</p>
        <div class="mt-4 text-sm text-gray-500">
            <span class="mr-4">📝 ${chapter.problems.length}道题目</span>
        </div>
    `;
    
    // Add click event to show chapter details
    card.addEventListener('click', () => {
        showChapterDetails(chapter, chapterIndex);
    });
    
    return card;
}

// Global variable to track active chapter
let activeChapterIndex = -1;

// Show chapter details
function showChapterDetails(chapter, chapterIndex) {
    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    const algorithmContent = document.getElementById('algorithm-content');
    
    // Store active chapter index
    activeChapterIndex = chapterIndex;
    console.log('Active chapter index set to:', activeChapterIndex);
    
    // Hide chapter list, show algorithm detail
    chapterNav.classList.add('hidden');
    algorithmDetail.classList.remove('hidden');
    
    // Generate chapter content
    let content = `
        <h2 class="text-2xl font-bold text-gray-800 mb-6">第${chapterIndex + 1}课: ${chapter.title}</h2>
        <p class="text-gray-600 mb-8">${chapter.description}</p>
    `;
    
    // Generate problems list
    chapter.problems.forEach((problem, problemIndex) => {
        content += createProblemHTML(problem, problemIndex);
    });
    
    algorithmContent.innerHTML = content;
    
    // Initialize tabs for each problem
    initializeProblemTabs();
    
    // Initialize step visualizations
    initializeStepVisualizations();
    
    // Initialize code highlighting
    initializeCodeHighlighting()
}

// Create HTML for a problem
function createProblemHTML(problem, problemIndex) {
    // Get LeetCode URL from the problem object if it exists
    const leetCodeUrl = problem.leetCodeUrl || '';
    
    return `
        <div class="algorithm-section">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                题目${problemIndex + 1}: ${problem.title}
                ${leetCodeUrl ? `<a href="${leetCodeUrl}" target="_blank" class="ml-2 text-sm bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600">LeetCode</a>` : ''}
            </h3>
            
            <div class="mb-4">
                <p class="text-gray-600">${problem.description}</p>
            </div>
            
            <!-- Two-column layout: left for tab content, right for fixed code -->
            <div class="flex flex-row gap-6 tab-container">
                <!-- Left column: tab content -->
                <div class="flex-1">
                    <!-- Tab buttons -->
                    <div class="flex flex-row border-b border-gray-200 w-full mb-4">
                        <button class="tab-button active py-3 px-6 font-medium text-center" data-tab="description" data-problem="${problemIndex}">
                            题目描述
                        </button>
                        <button class="tab-button py-3 px-6 font-medium text-gray-600 text-center" data-tab="steps" data-problem="${problemIndex}">
                            步骤说明
                        </button>
                    </div>
                    
                    <!-- Tab contents -->
                    <div class="tab-content-wrapper">
                        <div class="tab-content active" id="description-${problemIndex}">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium mb-2">输入：</h4>
                                <p class="ml-4">${problem.input}</p>
                                <h4 class="font-medium mt-4 mb-2">输出：</h4>
                                <p class="ml-4">${problem.output}</p>
                                <h4 class="font-medium mt-4 mb-2">示例：</h4>
                                <pre class="ml-4 bg-white p-2 rounded"><code>${problem.example}</code></pre>
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
                <div class="flex-1 max-w-2xl sticky top-4 self-start">
                    <div class="bg-white rounded-lg shadow-md border border-gray-200">
                        <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                            <h4 class="font-medium">代码实现</h4>
                        </div>
                        <div class="p-4 code-container">
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

// Show chapter list
function showChapterList() {
    const chapterNav = document.getElementById('chapter-nav');
    const algorithmDetail = document.getElementById('algorithm-detail');
    
    // Hide algorithm detail, show chapter list
    algorithmDetail.classList.add('hidden');
    chapterNav.classList.remove('hidden');
}