// Step visualization functionality for Algorithm1 Web App

// Enhanced step interaction features
function initializeStepVisualizations() {
    const stepContainers = document.querySelectorAll('.step-container');
    
    stepContainers.forEach((container, index) => {
        // Add hover effect
        container.addEventListener('mouseenter', () => {
            container.style.backgroundColor = '#f3f4f6';
            container.style.transform = 'translateX(4px)';
            container.style.transition = 'all 0.2s ease';
        });
        
        container.addEventListener('mouseleave', () => {
            container.style.backgroundColor = '#f9fafb';
            container.style.transform = 'translateX(0)';
        });
        
        // Add click to expand/collapse functionality
        const stepContent = container.querySelector('.step-content');
        const stepTitle = stepContent.querySelector('h4');
        
        if (stepTitle) {
            stepTitle.style.cursor = 'pointer';
            stepTitle.addEventListener('click', () => {
                const description = stepContent.querySelector('p');
                const visualization = stepContent.querySelector('div.mt-2');
                
                if (description) {
                    description.style.display = description.style.display === 'none' ? 'block' : 'none';
                }
                
                if (visualization) {
                    visualization.style.display = visualization.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });
}

// Create an interactive array visualization
function createArrayVisualization(array, highlightedIndices = []) {
    let html = '<div class="array-visualization flex flex-wrap gap-2 mt-2">';
    
    array.forEach((value, index) => {
        const isHighlighted = highlightedIndices.includes(index);
        const className = `array-element px-3 py-2 rounded ${isHighlighted ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`;
        html += `<div class="${className}">${value}</div>`;
    });
    
    html += '</div>';
    return html;
}

// Create a comparison visualization
function createComparisonVisualization(a, b, isEqual) {
    const className = isEqual ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return `
        <div class="comparison-visualization ${className} px-4 py-2 rounded mt-2">
            <span class="font-medium">比较:</span> ${a} ${isEqual ? '=' : '!='} ${b}
        </div>
    `;
}

// Create a swap visualization
function createSwapVisualization(array, index1, index2) {
    const tempArray = [...array];
    const temp = tempArray[index1];
    tempArray[index1] = tempArray[index2];
    tempArray[index2] = temp;
    
    let html = '<div class="swap-visualization mt-2">';
    html += '<div class="text-sm font-medium mb-1">交换前:</div>';
    html += createArrayVisualization(array, [index1, index2]);
    html += '<div class="text-sm font-medium mt-2 mb-1">交换后:</div>';
    html += createArrayVisualization(tempArray, [index2, index1]);
    html += '</div>';
    
    return html;
}

// Add CSS for step visualization enhancements
const stepVisualizationStyles = document.createElement('style');
stepVisualizationStyles.textContent = `
    .array-element {
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .array-element:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .comparison-visualization {
        border-left: 4px solid currentColor;
    }
    
    .step-content h4:hover {
        color: #4f46e5;
    }
`;
document.head.appendChild(stepVisualizationStyles);

// Export functions for use in other scripts
window.initializeStepVisualizations = initializeStepVisualizations;
window.createArrayVisualization = createArrayVisualization;
window.createComparisonVisualization = createComparisonVisualization;
window.createSwapVisualization = createSwapVisualization;