const EFFECTS = [
    {
        id: 'neon-button',
        title: '霓虹发光按钮',
        category: 'button',
        description: '使用 CSS box-shadow 实现的赛博朋克风格霓虹发光按钮。',
        path: 'effects/neon-button/index.html',
        tags: ['css', 'animation', 'hover']
    },
    {
        id: 'glass-card',
        title: '毛玻璃卡片',
        category: 'card',
        description: '基于 backdrop-filter 的现代毛玻璃拟态效果卡片。',
        path: 'effects/glass-card/index.html',
        tags: ['css', 'ui', 'modern']
    },
    {
        id: 'typing-text',
        title: '打字机效果',
        category: 'text',
        description: '纯 CSS 实现的打字机文本输入动画效果。',
        path: 'effects/typing-text/index.html',
        tags: ['css', 'animation', 'text']
    },
    {
        id: '3d-flip-card',
        title: '3D 翻转卡片',
        category: 'card',
        description: '鼠标悬停时进行 3D 翻转，展示背面内容的交互卡片。',
        path: 'effects/3d-flip-card/index.html',
        tags: ['css', '3d', 'transform', 'card']
    },
    {
        id: 'glitch-text',
        title: '故障艺术文字',
        category: 'text',
        description: '赛博朋克风格的文字故障闪烁效果 (Glitch Effect)。',
        path: 'effects/glitch-text/index.html',
        tags: ['css', 'animation', 'text', 'cyberpunk']
    },
    {
        id: 'gradient-border',
        title: '流动渐变边框',
        category: 'card',
        description: '使用伪元素旋转实现的炫酷流动渐变边框效果。',
        path: 'effects/gradient-border/index.html',
        tags: ['css', 'border', 'animation', 'modern']
    },
    {
        id: 'liquid-loader',
        title: '液体加载动画',
        category: 'animation',
        description: '基于 SVG 滤镜 (Gooey Effect) 的液体融合加载动画。',
        path: 'effects/liquid-loader/index.html',
        tags: ['css', 'svg', 'filter', 'loader']
    },
    {
        id: 'matrix-rain',
        title: '黑客帝国代码雨',
        category: 'animation',
        description: '经典的黑客帝国数字雨效果，使用 Canvas 实现。',
        path: 'effects/matrix-rain/index.html',
        tags: ['canvas', 'animation', 'matrix', 'cool']
    },
    {
        id: 'spotlight-card',
        title: '聚光灯卡片',
        category: 'card',
        description: '鼠标移动时照亮卡片边缘，仿 Windows Fluent Design 效果。',
        path: 'effects/spotlight-card/index.html',
        tags: ['css', 'js', 'hover', 'modern']
    },
    {
        id: 'kinetic-loader',
        title: '动力学加载器',
        category: 'animation',
        description: '纯 CSS 实现的几何图形旋转加载动画。',
        path: 'effects/kinetic-loader/index.html',
        tags: ['css', 'animation', 'loader', 'minimal']
    },
    {
        id: 'parallax-tilt',
        title: '视差倾斜卡片',
        category: 'card',
        description: '跟随鼠标移动产生 3D 视差倾斜效果的卡片。',
        path: 'effects/parallax-tilt/index.html',
        tags: ['css', 'js', '3d', 'interactive']
    },
    {
        id: 'water-wave-btn',
        title: '水波纹按钮',
        category: 'button',
        description: '鼠标悬停时填充水波纹动画的按钮效果。',
        path: 'effects/water-wave-btn/index.html',
        tags: ['css', 'animation', 'hover']
    },
    {
        id: 'particles-bg',
        title: '粒子连线背景',
        category: 'animation',
        description: 'Canvas 实现的粒子运动与自动连线背景效果。',
        path: 'effects/particles-bg/index.html',
        tags: ['canvas', 'animation', 'background']
    },
    {
        id: 'magnetic-btn',
        title: '磁吸按钮',
        category: 'button',
        description: '鼠标靠近时会被磁力吸引的交互按钮。',
        path: 'effects/magnetic-btn/index.html',
        tags: ['js', 'interactive', 'physics']
    },
    {
        id: 'text-reveal',
        title: '文字揭示效果',
        category: 'text',
        description: '带有滑块遮罩动画的炫酷文字入场效果。',
        path: 'effects/text-reveal/index.html',
        tags: ['css', 'animation', 'typography']
    },
    {
        id: 'circular-progress',
        title: '圆形进度条',
        category: 'layout',
        description: 'SVG 描边动画实现的圆形百分比进度条。',
        path: 'effects/circular-progress/index.html',
        tags: ['css', 'svg', 'chart']
    },
    {
        id: 'accordion-menu',
        title: '手风琴菜单',
        category: 'layout',
        description: '纯 CSS (Radio Hack) 实现的平滑折叠菜单。',
        path: 'effects/accordion-menu/index.html',
        tags: ['css', 'layout', 'ui']
    },
    {
        id: 'social-icons',
        title: '社交图标悬停',
        category: 'button',
        description: '鼠标悬停时图标立体旋转并发光的 3D 效果。',
        path: 'effects/social-icons/index.html',
        tags: ['css', '3d', 'hover', 'icon']
    },
    {
        id: 'fab-menu',
        title: '悬浮按钮菜单',
        category: 'button',
        description: '点击展开子菜单的悬浮操作按钮 (FAB)。',
        path: 'effects/fab-menu/index.html',
        tags: ['css', 'js', 'ui', 'menu']
    },
    {
        id: 'skeleton-loading',
        title: '骨架屏加载',
        category: 'layout',
        description: '模拟内容加载状态的闪烁骨架屏效果。',
        path: 'effects/skeleton-loading/index.html',
        tags: ['css', 'animation', 'loading', 'ux']
    },
    {
        id: 'glass-sidebar',
        title: '毛玻璃侧边栏',
        category: 'layout',
        description: '使用 backdrop-filter 实现的磨砂玻璃风格侧边导航。',
        path: 'effects/glass-sidebar/index.html',
        tags: ['css', 'glassmorphism', 'layout']
    },
    {
        id: 'neumorphic-toggle',
        title: '拟态开关',
        category: 'button',
        description: '软 UI (Neumorphism) 风格的切换开关，具有凹凸质感。',
        path: 'effects/neumorphic-toggle/index.html',
        tags: ['css', 'neumorphism', 'ui']
    },
    {
        id: 'jelly-checkbox',
        title: '果冻复选框',
        category: 'button',
        description: '点击时具有果冻般弹性缩放动画的复选框。',
        path: 'effects/jelly-checkbox/index.html',
        tags: ['css', 'animation', 'checkbox']
    },
    {
        id: 'animated-search',
        title: '动画搜索框',
        category: 'button',
        description: '鼠标悬停时自动展开的伸缩式搜索输入框。',
        path: 'effects/animated-search/index.html',
        tags: ['css', 'hover', 'ui']
    },
    {
        id: 'glowing-input',
        title: '发光输入框',
        category: 'text',
        description: '输入时标签上浮并带有发光边框效果的表单输入框。',
        path: 'effects/glowing-input/index.html',
        tags: ['css', 'form', 'glow']
    },
    {
        id: 'pagination-hover',
        title: '悬停分页',
        category: 'button',
        description: '鼠标悬停时带有滑动填充动画的分页按钮。',
        path: 'effects/pagination-hover/index.html',
        tags: ['css', 'hover', 'pagination']
    },
    {
        id: 'glass-tooltip',
        title: '毛玻璃提示框',
        category: 'text',
        description: '具有磨砂玻璃质感的纯 CSS 提示工具 (Tooltip)。',
        path: 'effects/glass-tooltip/index.html',
        tags: ['css', 'glassmorphism', 'tooltip']
    },
    {
        id: 'notification-stack',
        title: '通知堆栈',
        category: 'card',
        description: '模拟右上角弹出的通知消息堆栈，支持自动消失。',
        path: 'effects/notification-stack/index.html',
        tags: ['js', 'ui', 'notification']
    },
    {
        id: 'card-expand',
        title: '卡片展开',
        category: 'card',
        description: '鼠标悬停时向下展开显示更多内容的交互卡片。',
        path: 'effects/card-expand/index.html',
        tags: ['css', 'hover', 'card']
    },
    {
        id: 'image-comparison',
        title: '图片对比滑块',
        category: 'layout',
        description: '拖动滑块对比两张图片（如原图与滤镜图）的差异。',
        path: 'effects/image-comparison/index.html',
        tags: ['js', 'image', 'interactive']
    },
    {
        id: 'masonry-gallery',
        title: '瀑布流画廊',
        category: 'layout',
        description: '纯 CSS (column-count) 实现的响应式瀑布流图片布局。',
        path: 'effects/masonry-gallery/index.html',
        tags: ['css', 'layout', 'gallery']
    },
    {
        id: 'infinite-marquee',
        title: '无限滚动跑马灯',
        category: 'animation',
        description: '纯 CSS 实现的无缝循环滚动文字跑马灯效果。',
        path: 'effects/infinite-marquee/index.html',
        tags: ['css', 'animation', 'text']
    },
    {
        id: 'music-visualizer',
        title: '音乐可视化',
        category: 'animation',
        description: '模拟音乐播放时的频谱跳动动画效果。',
        path: 'effects/music-visualizer/index.html',
        tags: ['css', 'animation', 'music']
    },
    {
        id: 'clock-neumorphism',
        title: '拟态时钟',
        category: 'layout',
        description: '软 UI 风格的模拟时钟，实时显示当前时间。',
        path: 'effects/clock-neumorphism/index.html',
        tags: ['js', 'neumorphism', 'clock']
    },
    {
        id: 'calculator-glass',
        title: '毛玻璃计算器',
        category: 'layout',
        description: '全功能的简单计算器，采用现代毛玻璃设计风格。',
        path: 'effects/calculator-glass/index.html',
        tags: ['js', 'glassmorphism', 'tool']
    },
    {
        id: 'weather-glass',
        title: '毛玻璃天气卡片',
        category: 'card',
        description: '展示天气信息的精美 UI 卡片，采用磨砂玻璃效果。',
        path: 'effects/weather-glass/index.html',
        tags: ['css', 'glassmorphism', 'ui']
    },
    {
        id: 'login-glass',
        title: '毛玻璃登录页',
        category: 'layout',
        description: '带有输入框动画和毛玻璃背景的现代登录表单。',
        path: 'effects/login-glass/index.html',
        tags: ['css', 'form', 'login']
    },
    {
        id: 'profile-card',
        title: '社交资料卡',
        category: 'card',
        description: '包含头像、统计数据和关注按钮的个人资料卡片。',
        path: 'effects/profile-card/index.html',
        tags: ['css', 'ui', 'profile']
    },
    {
        id: 'loader-ring',
        title: '环形加载器',
        category: 'animation',
        description: '带有发光尾迹的环形旋转加载动画。',
        path: 'effects/loader-ring/index.html',
        tags: ['css', 'animation', 'loader']
    },
    {
        id: 'confetti-button',
        title: '礼花按钮',
        category: 'button',
        description: '点击时触发全屏五彩纸屑礼花效果的庆祝按钮。',
        path: 'effects/confetti-button/index.html',
        tags: ['js', 'canvas', 'confetti']
    }
];

const CATEGORIES = [
    { id: 'all', name: '全部' },
    { id: 'button', name: '按钮' },
    { id: 'card', name: '卡片' },
    { id: 'text', name: '文字' },
    { id: 'layout', name: '布局' },
    { id: 'animation', name: '动画' }
];
