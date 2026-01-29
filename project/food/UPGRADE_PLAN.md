# Food 项目升级方案：接入腾讯云开发 (CloudBase)

**状态**: ✅ 已完成 (2026-01-25)

本方案已实施完成。Food 项目已升级为动态管理系统，支持通过后台管理数据，且具备云函数安全防护。

## 1. 架构设计

*   **前端展示 (`index.html`)**: 优先从腾讯云数据库读取产品列表和全局配置（如标题、分类），若失败则降级使用本地数据。
*   **后台管理 (`admin.html`)**: 提供产品管理、分类管理、全局配置管理功能。
*   **安全网关 (Cloud Function)**: 所有写操作（增删改）通过 `food_admin` 云函数执行，防止前端直接暴露数据库写权限。
*   **数据存储 (CloudBase Database)**: 
    *   `food_products`: 产品数据
    *   `food_config`: 全局配置
*   **图片存储 (CloudBase Storage)**: 图片存储在 `food/images/` 路径下。

## 2. 数据库设计

### 2.1 产品集合 (`food_products`)
权限：**所有用户可读，仅创建者及管理员可写**

```json
{
  "_id": "自动生成或指定ID",
  "name": "澳洲牛腩块 2kg/袋",
  "category": "牛肉",
  "cut": "牛腩块",
  "origin": "澳大利亚",
  "grade": "MSA",
  "packaging": "2kg/袋",
  "priceWholesale": "¥48/kg",
  "priceRetail": "¥58/kg",
  "stockStatus": "现货",
  "thumb": "https://...",
  "tags": ["澳洲", "谷饲"],
  "description": "...",
  "createTime": "timestamp",
  "updateTime": "timestamp"
}
```

### 2.2 配置集合 (`food_config`)
权限：**所有用户可读，仅创建者及管理员可写**
单文档模式，`_id` 固定为 `global_config`。

```json
{
  "_id": "global_config",
  "appTitle": "世友的肉肉仓库",
  "appSubtitle": "冻肉类产品展示 · 业务演示",
  "categories": [
    { "name": "牛肉", "order": 1 },
    { "name": "猪肉", "order": 2 },
    { "name": "鸡肉", "order": 3 }
  ]
}
```

## 3. 功能模块实现

### 3.1 管理后台 (`admin.html`)
*   **安全登录**: 前端 PIN 码校验（默认 `888888`），后端云函数二次校验。
*   **产品管理**: 
    *   CRUD 操作（增删改查）。
    *   图片上传（支持预览）。
    *   多条件筛选与搜索。
*   **分类管理**:
    *   支持添加、删除分类。
    *   支持分类排序（上移/下移）。
*   **系统设置**:
    *   动态修改网站主标题与副标题。
    *   **一键数据迁移**: 提供从 `js/data.js` 导入演示数据的功能。

### 3.2 前台展示 (`index.html` & `app.js`)
*   **动态加载**: 启动时并行加载配置 (`food_config`) 和产品 (`food_products`)。
*   **动态主题**: 根据配置自动更新页面 `<title>` 和 Header 文字。
*   **自动分类**: 根据配置生成 Tab 栏；若配置缺失，自动从产品数据推断分类。
*   **容错降级**: 云端加载失败时，自动回退到本地数据展示。

### 3.3 安全机制 (`functions/food_admin`)
为了保护 GitHub Pages 纯前端架构下的数据安全，实施了以下机制：
1.  **数据库权限**: 设为“只读”（对公众）。
2.  **云函数网关**: 所有写操作必须通过 `food_admin` 云函数。
3.  **PIN 码校验**: 云函数内部校验 `pin` 参数，匹配成功才允许写入。

## 4. 目录结构

```text
projects/food/
├── admin.html          (后台入口)
├── js/
│   ├── admin.js        (后台逻辑：包含数据迁移、云函数调用)
│   ├── cloudbase.js    (云开发 SDK)
│   ├── app.js          (前台逻辑：支持动态/静态双模)
│   └── data.js         (本地演示数据)
└── index.html          (前台入口)

functions/
└── food_admin/         (云函数代码)
    └── index.js
```

## 5. 部署与使用指南

1.  **部署云函数**:
    *   上传 `functions/food_admin` 到腾讯云。
    *   修改代码中的 `ADMIN_PIN`。
2.  **设置数据库**:
    *   创建 `food_products` 和 `food_config` 集合。
    *   权限设为：**所有用户可读，仅创建者及管理员可写**。
3.  **初始化数据**:
    *   访问 `admin.html` -> 登录 -> 系统设置 -> 点击“从 data.js 导入演示数据”。
