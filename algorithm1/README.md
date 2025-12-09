# 《算法1》课程案例大全

这是一个用于展示《算法1》课程案例的静态Web应用，使用HTML、CSS和JavaScript构建。

## 功能特性

- 📚 **课程导航**：浏览《算法1》课程的多个章节内容
- 📝 **案例展示**：每章包含多个算法案例
- 📊 **多种可视化形式**：
  - 代码高亮展示（使用Prism.js）
  - 步骤说明图
  - 交互式数组可视化
- 🎨 **现代化界面**：使用Tailwind CSS构建的响应式设计

## 项目结构

```
algorithm1/
├── src/
│   ├── data/
│   │   └── algorithms.js    # 算法数据和模型
│   ├── js/
│   │   ├── main.js          # 主应用逻辑
│   │   └── step-visualizer.js # 步骤可视化功能
│   └── css/
│       └── main.css         # 自定义样式
└── index.html               # 主页面
```

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式设计
- **JavaScript (ES6+)**：交互逻辑
- **Tailwind CSS**：快速样式开发
- **Prism.js**：代码高亮

## 如何使用

### 本地运行

1. 克隆或下载项目
2. 在项目根目录下启动HTTP服务器：
   ```bash
   python3 -m http.server 8000
   ```
3. 在浏览器中访问：`http://localhost:8000`

### 添加新课程或算法题

编辑 `data/algorithms.js` 文件，按照现有数据结构添加新的课程和算法题：

```javascript
{
    title: "课程标题",
    description: "课程描述",
    problems: [
        {
            title: "算法题标题",
            description: "算法题描述",
            input: "输入说明",
            output: "输出说明",
            example: "示例",
            flowchart: "Mermaid流程图代码",
            code: "Dart代码",
            steps: [
                {
                    title: "步骤标题",
                    description: "步骤描述",
                    visualization: "可视化内容"
                }
            ]
        }
    ]
}
```

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 未来改进

- 添加更多算法题
- 实现搜索功能
- 添加用户笔记功能
- 支持深色模式

## 许可证

MIT License