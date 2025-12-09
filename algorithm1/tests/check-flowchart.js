// 测试脚本：检查流程图是否正确显示
// 可以在浏览器控制台中运行此脚本

function checkFlowcharts() {
    console.log('开始检查流程图显示情况...');
    
    // 检查Mermaid是否已加载
    if (typeof mermaid === 'undefined') {
        console.error('Mermaid库未加载');
        return;
    }
    
    console.log('Mermaid库已加载');
    console.log('Mermaid配置:', mermaid.mermaidAPI.getConfig());
    
    // 检查所有mermaid元素
    const mermaidElements = document.querySelectorAll('.mermaid');
    console.log(`找到 ${mermaidElements.length} 个.mermaid元素`);
    
    mermaidElements.forEach((elem, index) => {
        console.log(`\n检查第 ${index + 1} 个流程图元素:`);
        console.log('元素内容:', elem.textContent);
        console.log('元素可见性:', window.getComputedStyle(elem).display);
        console.log('元素高度:', elem.offsetHeight);
        
        // 检查是否有子元素（渲染后的SVG）
        const svgElement = elem.querySelector('svg');
        if (svgElement) {
            console.log('已渲染为SVG:', svgElement);
            console.log('SVG尺寸:', `${svgElement.offsetWidth}x${svgElement.offsetHeight}`);
        } else {
            console.error('未渲染为SVG');
        }
    });
    
    // 尝试手动渲染
    console.log('\n尝试手动渲染所有流程图...');
    try {
        mermaid.run().then(() => {
            console.log('手动渲染成功');
            
            // 再次检查
            mermaidElements.forEach((elem, index) => {
                const svgElement = elem.querySelector('svg');
                if (svgElement) {
                    console.log(`第 ${index + 1} 个流程图渲染成功`);
                }
            });
        }).catch(error => {
            console.error('手动渲染失败:', error);
        });
    } catch (error) {
        console.error('手动渲染抛出异常:', error);
    }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
    // 页面加载后执行检查
    window.addEventListener('load', checkFlowcharts);
    
    // 也可以手动调用
    window.checkFlowcharts = checkFlowcharts;
    console.log('流程图检查工具已加载，可通过 window.checkFlowcharts() 手动运行');
} else {
    // 在Node环境中执行
    console.log('此脚本需在浏览器环境中运行');
}