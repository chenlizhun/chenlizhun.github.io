# 知识库项目设计方案 (Knowledge Base Design)

## 1. 数据库设计 (Database Design)
基于 CloudBase (NoSQL) 的设计方案，注重灵活性和层级关系。

### 1.1 核心集合 (Collections)

所有集合均以 `k_` 开头，以便在多项目环境中区分。

#### `k_metadata` (元数据/分类维度)
存储科目、年级、教材版本等基础维度信息，采用树状结构。
**层级约定**：`subject` (科目) -> `grade` (年级) -> `course` (课程/学期) -> `unit` (单元)

```json
{
  "_id": "meta_math_grade1_vol1",
  "type": "course", // subject, grade, course, unit
  "parent_id": "meta_grade_1", // 父节点ID
  "name": "一年级上册",
  "order": 1, // 排序权重 (越小越前)
  "description": "人教版2023", // 备注
  "is_visible": true // 是否启用
}
```

#### `k_knowledge_points` (知识点)
核心内容，支持多维度标签。

**dimensions 约定**：理想形态为关联 `k_metadata` 的 `_id`；MVP 阶段允许使用可读字符串（如「数学」「一年级」）以便快速录入与筛选。后续可统一迁移为 metadata _id。

```json
{
  "_id": "kp_123456",
  "dimensions": { // 结构化维度：可为 metadata _id，或 MVP 下可读字符串
    "subject": "meta_subject_math",
    "grade": "meta_grade_1",
    "course": "meta_course_vol1",
    "unit": "meta_unit_3"
  },
  "keywords": ["加法", "凑十法", "进位"], // 搜索关键词
  "title": "10以内加法",
  "summary": "通过凑十法快速计算...", // 列表页摘要
  "content": {
    "type": "rich_text", // rich_text, markdown, video_url
    "body": "..." 
  },
  "attachments": [ // 附件/图片
    { "name": "exercise.pdf", "url": "cloud://...", "type": "application/pdf" }
  ],
  "difficulty": 1, // 1-5 (难度)
  "relations": [ // 知识点关联 (知识图谱基础)
    { "type": "prerequisite", "target_id": "kp_001", "name": "10以内数数" }, // 前置知识
    { "type": "extension", "target_id": "kp_003", "name": "20以内进位加法" }, // 后续延伸
    { "type": "similar", "target_id": "kp_005", "name": "减法(逆运算)" } // 相关知识
  ],
  "visibility": "public", // public, private (仅自己可见)
  "created_by": {
    "family_id": "family_abc",
    "user_id": "user_mom",
    "role": "妈妈",
    "name": "张妈妈"
  },
  "created_at": "2023-10-27T10:00:00Z",
  "updated_at": "2023-10-28T10:00:00Z",
  "status": "published", // pending, published, rejected
  "version": 1
}
```

#### `k_questions` (题库)
关联到知识点，用于生成试卷。**关联知识点**统一使用 `related_kp_ids`（数组）；单题只关联一个知识点时写为单元素数组，如 `["kp_123456"]`，不关联时写为 `[]`。
```json
{
  "_id": "q_98765",
  "related_kp_ids": ["kp_123456"],
  "type": "choice", // choice, fill, calculation
  "content": "小明有1个苹果，又买了1个，现在有几个？",
  "options": ["1", "2", "3", "4"],
  "answer": "B",
  "difficulty": 1, // 1-5
  "dimensions": { "subject": "数学", "grade": "一年级", "unit": "第一单元", "course": "加法" },
  "explanation": "可选，题目解析或解题思路",
  "contributor": "family_xyz",
  "created_at": "2023-10-27T10:00:00Z"
}
```

#### `k_papers` (试卷)
生成的试卷存档或模板。
```json
{
  "_id": "paper_uuid",
  "title": "一年级数学第一单元测试",
  "questions": [
    { "id": "q_98765", "score": 5 }
  ],
  "config": {
    "total_score": 100,
    "time_limit": 45 // minutes
  },
  "generated_by": "family_abc"
}
```

#### `k_exam_records` (答题记录)
线上答题的记录。
```json
{
  "_id": "record_uuid",
  "paper_id": "paper_uuid",
  "student_id": "kid_123",
  "answers": {
    "q_98765": "B"
  },
  "score": 100,
  "auto_graded": true,
  "finished_at": "..."
}
```

### 1.2 批量导入数据结构 (Batch Import Schema)

为支持通过外部 AI (如 ChatGPT/Claude) 快速生成内容，定义以下 JSON 交换格式。导入工具会自动解析并分发到 `k_knowledge_points` 和 `k_questions` 集合。

```json
[
  {
    "title": "知识点标题",
    "summary": "简短摘要",
    "keywords": ["关键词1", "关键词2"],
    "difficulty": 1,
    "content": {
      "type": "markdown",
      "body": "# 标题\n\n内容..."
    },
    "dimensions": {
      "subject": "数学",
      "grade": "一年级",
      "course": "上册",
      "unit": "第一单元"
    },
    // 题目数组 (导入时会自动分离到 k_questions 集合并建立关联)
    "questions": [
      {
        "type": "choice",
        "content": "1 + 1 = ?",
        "options": ["1", "2", "3", "4"],
        "answer": "B",
        "difficulty": 1
      }
    ]
  }
]
```

### 1.3 进阶模型：知识图谱与学习路径 (Advanced Model)
为支持个性化推荐和长期学习规划，引入以下集合：

#### `k_learning_paths` (学习路径/歌单)
将知识点串联成有序的学习序列，如“一周攻克凑十法”。
```json
{
  "_id": "path_abc",
  "title": "一年级上册计算能力突破",
  "description": "从数数到20以内进位加法",
  "steps": [
    { "kp_id": "kp_100", "order": 1, "required_score": 80 }, // 必须达到80分才能解锁下一关
    { "kp_id": "kp_101", "order": 2 }
  ],
  "tags": ["数学", "计算", "一年级"]
}
```

#### `k_user_mastery` (用户掌握度/画像)
记录每个孩子在各个知识点上的熟练度，用于“薄弱点推荐”。
```json
{
  "_id": "mastery_user1_kp123",
  "user_id": "user_mom", // 关联 kid_id 更佳
  "kp_id": "kp_123456",
  "proficiency": 0.85, // 0-1 熟练度
  "last_practice_at": "2023-11-01...",
  "history": [
    { "date": "2023-10-01", "score": 60 },
    { "date": "2023-10-05", "score": 90 }
  ]
}
```

## 2. 开发周期预估 (Development Estimate)
假设由 1 名熟练全栈工程师开发：

### 第一阶段：基础架构与内容录入 (MVP) - 约 1-2 周
- [x] 项目初始化与路由搭建
- [ ] 数据库集合创建与索引优化
- [ ] 知识点 CRUD（增删改查）
- [ ] JSON 快速导入功能
- [ ] 首页仪表盘（展示贡献动态）

### 第二阶段：题库与组卷系统 - 约 2-3 周
- [ ] 题目管理（支持多种题型）
- [ ] 试卷生成器（随机/选题）
- [ ] PDF 导出功能 (使用 jsPDF 或 html2canvas)

### 第三阶段：线上答题与交互 - 约 2 周
- [ ] 在线答题界面（适合儿童操作）
- [ ] 自动批改逻辑
- [ ] 错题本功能

**总计预估：5-7 周** (按业余时间开发计算，若全职开发约需 2-3 周)

## 3. 关键步骤 (Key Steps)
1.  **数据建模**：确定分类树结构，这是检索的基础。
2.  **权限系统**：利用现有的 Auth SDK，扩展角色权限（Admin vs Contributor）。
3.  **编辑器开发**：知识点和题目的录入体验至关重要，需要支持公式（MathJax/KaTeX）和图片。
4.  **PDF 引擎**：调试浏览器端的打印样式，确保 A4 纸输出美观。
5.  **导入工具**：编写脚本解析特定格式的 JSON，降低初始化数据的门槛。

## 4. 用户使用意愿分析 (Adoption Analysis)
**痛点 (Pain Points)**：
- 现有题库太杂，不贴合学校进度。
- 打印试卷排版麻烦。
- 找不到针对薄弱知识点的专项练习。

**激励机制 (Incentives)**：
- **"我为人人"**：共享优质笔记和错题集。
- **Gamification**：贡献题目获得积分，积分可用于兑换“高级试卷模板”或孩子在 Edutogather 中的奖励。
- **工具价值**：最核心的是**“一键生成打印版试卷”**，这是刚需。如果能做到“拍照录题”->“生成试卷”，意愿度会极高。

**挑战**：
- **录入成本**：手动打字录入题目太累。**解决方案**：必须支持 OCR 拍照识别或 JSON 批量导入。
