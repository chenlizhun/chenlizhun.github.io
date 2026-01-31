# Edutogather 管理后台与数据分析

本项目提供了一个集中的仪表盘，用于监控所有 Edutogather 应用的用户行为数据。

## 核心组件

1.  **管理后台 (Admin Dashboard)** (`projects/admin/index.html`): 一个基于 Vue.js 的可视化数据应用。
2.  **分析 SDK (Analytics SDK)** (`projects/common/analytics.js`): 集成到各个应用中的通用脚本，用于自动采集事件。
3.  **云函数 (Cloud Functions)**: 用于存储和检索日志的后端逻辑。

## 部署说明

### 1. 部署云函数

您需要将以下两个云函数部署到您的 CloudBase 环境 (`chenlizhun-projects-2ckab9e1cd47`)。

**函数 1: log_event**
- **路径**: `projects/admin/cloud_functions/log_event`
- **用途**: 接收客户端上报的分析事件并保存到数据库。
- **依赖**: `wx-server-sdk`

**函数 2: get_analytics**
- **路径**: `projects/admin/cloud_functions/get_analytics`
- **用途**: 为管理后台聚合和提供统计数据。
- **依赖**: `wx-server-sdk`

### 2. 创建数据库集合

请在 CloudBase 控制台中执行以下操作：
1.  进入 **数据库 (Database)**。
2.  创建一个新集合，命名为：`analytics_events`。
3.  (可选) 将权限设置为 “所有用户可读，仅创建者及管理员可写” 或 “自定义权限”，确保客户端有权限写入日志 (`add`)，管理员有权限读取所有日志。
    *   *建议初始设置*: "所有用户可读写" (为了测试方便)，或者配置安全规则允许 `auth != null` 进行写入。

### 3.  验证

1.  打开 `edutogather` 或 `edutogatherhome` 页面并进行一些操作（如浏览、点击）。
2.  打开 `projects/a/index.html`。
3.  登录后，检查是否显示了相关的数据统计和日志记录。
