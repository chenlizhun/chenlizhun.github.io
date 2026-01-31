# Share 资源共享 · 存储方案

## 1. 整体思路

- **元数据**：存 CloudBase 数据库集合 `share_resources`（标题、描述、类型、分类、上传者、时间等）。
- **文件本体**：存 **CloudBase 云存储**，数据库只存文件标识（fileID）或外链 URL；列表/筛选用数据库，下载时用 fileID 换临时链接或直接跳转外链。

这样家庭间共享以「资源卡片 + 筛选」为主，大文件不占数据库，和现有 CloudBase 环境一致。

## 2. 数据库集合：`share_resources`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 自动生成 |
| title | String | 资源标题 |
| description | String | 描述文本 |
| type | String | 资源类型：image / video / pdf / archive / other |
| category | String | 分类：学习资料 / 娱乐 / 绘本 / 课程 / 其他 |
| file_id | String | CloudBase 云存储 fileID（本地上传时必填） |
| file_name | String | 原始文件名 |
| file_size | Number | 文件大小（字节），可选 |
| url | String | 外链地址（仅当使用「链接」发布时填写，与 file_id 二选一） |
| tags | Array&lt;String&gt; | 标签，便于筛选 |
| uploader_name | String | 上传者昵称/家庭名 |
| family_id | String | 家庭 ID，可选，用于「仅家庭可见」 |
| visibility | String | public / family_only |
| created_at | Date | 创建时间 |
| updated_at | Date | 更新时间 |

- 一条资源要么有 **file_id**（本地上传），要么有 **url**（外链），二选一即可。

## 3. 文件存储：CloudBase 云存储

- **本地上传**：使用 CloudBase Web SDK 的 **云存储上传**：
  - 前端选择文件后调用 `app.uploadFile({ cloudPath, filePath: File })`。
  - `cloudPath` 建议：`share/{year}/{month}/{uuid}_{原始文件名}`，避免重名。
  - 上传成功后得到 **fileID**，写入 `share_resources.file_id`。
  - 列表/详情页需要「下载」时，用 `app.getTempFileURL({ fileList: [fileID] })` 得到临时 URL，跳转或打开新窗口即可；也可在云函数里生成长期签名 URL（若需要）。

- **外链**：用户只填「资源链接」（网盘、B站、公众号等），不传文件，则 `file_id` 为空，只填 `url` 和元数据，列表照常展示、点击即跳转外链。

## 4. 安全与权限建议

- 云存储：在 CloudBase 控制台为存储目录 `share/` 配置「所有用户可读、仅登录用户可写」（或按你的策略：仅登录可读可写），避免匿名用户随意覆盖。
- 数据库：`share_resources` 集合建议「仅登录可写、所有人可读」或「匿名可读、登录可写」，与现有知识库策略一致即可。
- 若启用「仅家庭可见」，列表/详情查询时按 `visibility === 'public'` 或 `family_id === 当前家庭` 过滤。

## 5. 筛选与列表

- 列表从 `share_resources` 查询，支持：
  - **资源类型** type：image / video / pdf / archive / other
  - **分类** category：学习资料 / 娱乐 / 绘本 / 课程 / 其他
  - **关键词**：title、description、tags 模糊匹配
  - **排序**：created_at 降序（最新优先）或按热度（若后续加计数字段）
- 前端筛选项与上述字段一一对应即可。

## 6. 小结

| 内容 | 方案 |
|------|------|
| 元数据 | CloudBase 数据库集合 `share_resources` |
| 本地上传文件 | CloudBase 云存储，库中只存 fileID，下载时用 getTempFileURL |
| 外链资源 | 只存 url + 元数据，不占存储 |
| 筛选 | type、category、关键词、排序，均查数据库 |

这样实现后，每个人都能发布图片、视频、PDF、压缩包和描述文本，家庭间共享；资源有筛选；存储由 CloudBase 统一承担，无需额外 OSS。
