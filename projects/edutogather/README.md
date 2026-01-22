# Edutogather - 家庭积分管理系统

这是一个基于 **腾讯云开发 (CloudBase)** 的家庭积分管理 Web 应用。支持多家庭管理、成员角色（管理员/普通成员）、积分增减、积分历史报表等功能。

## 📁 项目结构

```
projects/edutogather/
├── index.html              # 入口 HTML，包含 UI 容器和 SDK 引用
├── app.js                  # 核心业务逻辑、UI 渲染、状态管理
├── data.js                 # 数据层，负责与云开发后端通信 (API 调用)
├── cloudbase.js            # 腾讯云开发 Web SDK
├── functions/              # 云函数 (后端代码)
│   ├── ourchildren_kidApi  # 核心业务接口 (创建家庭、加减分、查询等)
│   └── ourchildren_initDatabase # 数据库初始化脚本
└── DB_SCHEMA.md            # 数据库设计文档
```

## 🚀 如何运行 (解决报错问题)

**重要提示**：由于浏览器安全策略 (CORS)，**不能**直接双击 `index.html` 打开，否则会出现 `Origin 'null'` 网络请求错误。

### 正确运行方式：
必须使用本地 Web 服务器运行。

1.  **启动服务器** (在项目根目录下)：
    ```bash
    python3 -m http.server 8080
    ```
    *(当前终端已为您启动，无需重复操作)*

2.  **在浏览器访问**：
    打开浏览器访问：[http://localhost:8080/projects/edutogather/index.html](http://localhost:8080/projects/edutogather/index.html)

## ✨ 功能特性

1.  **多家庭支持 (SaaS 模式)**
    -   用户可以创建新家庭（自动成为管理员）。
    -   用户可以输入家庭 ID 加入已有家庭。
    -   首页显示“所有家庭目录”，方便浏览和加入。
    -   **唯一性检查**：家庭名称不能重复。

2.  **积分管理**
    -   **加分/扣分**：支持预设理由和自定义理由。
    -   **历史记录**：查看详细的积分变动日志。
    -   **实时反馈**：操作后积分即时更新。

3.  **数据安全**
    -   **PIN 码验证**：关键操作需验证管理密码。
    -   **权限隔离**：只能看到自己所在家庭的数据。

## 🛠 部署指南 (云开发)

如果您修改了 `functions/` 目录下的代码，必须重新部署云函数才能生效。

1.  登录腾讯云开发控制台。
2.  进入云函数列表。
3.  找到 `ourchildren_kidApi`。
4.  上传 `functions/ourchildren_kidApi` 目录下的 `index.js` 和 `package.json`。
5.  保存并部署。

## 📊 数据库集合 (Collections)

-   `families`: 存储家庭信息 (名称, 管理密码, 创建者)
-   `users`: 存储用户与家庭的绑定关系 (角色, 昵称)
-   `kids`: 存储孩子信息及当前积分
-   `point_logs`: 存储积分变动流水
-   `reasons`: (可选) 存储自定义理由

---
*Created by Edutogather Team*
