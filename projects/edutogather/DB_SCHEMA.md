# EduToGather 数据库设计文档

本项目已升级为多家庭 SaaS 架构，数据库采用以下 4 个集合设计。

## 1. `ourchildren_families` (家庭/租户表)

存储家庭维度的元数据。

| 字段名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `_id` | String | 自动生成的家庭唯一 ID | `fam_xxxxxxxx` |
| `name` | String | 家庭名称 | "快乐一家人" |
| `owner_id` | String | 创建者 OpenID | `oP3k...` |
| `access_code` | String | 家庭邀请码/口令 | "888888" |
| `status` | String | 状态 | "active" |
| `created_at` | Date | 创建时间 | `ServerDate` |

## 2. `ourchildren_users` (用户表)

存储家长信息，通过 `family_id` 关联到家庭。

| 字段名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `_id` | String | 文档 ID | `user_xxxx` |
| `_openid` | String | 微信 OpenID (核心身份) | `oP3k...` |
| `family_id` | String | **关联 `families._id`** | `fam_xxxxxxxx` |
| `display_name` | String | 显示名称 | "爸爸" |
| `role` | String | 角色权限 | "admin", "member" |
| `avatar` | String | 头像 URL | `https://...` |

## 3. `ourchildren_kids` (孩子表)

存储孩子基本信息和**当前总积分**（热数据）。

| 字段名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `_id` | String | 孩子唯一 ID | `kid_xxxxxxxx` |
| `family_id` | String | **关联 `families._id`** | `fam_xxxxxxxx` |
| `name` | String | 孩子姓名 | "猪姐姐" |
| `current_points` | Number | **当前总积分** | 105 |
| `avatar` | String | 头像/图片名 | "girl.png" |
| `gender` | String | 性别 | "female" |
| `birthday` | String | 生日 | "2015-01-01" |

## 4. `ourchildren_point_logs` (积分流水表)

存储每一次加减分的详细记录（海量数据）。

| 字段名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `_id` | String | 流水 ID | `log_xxxxxxxx` |
| `family_id` | String | **分片索引键** | `fam_xxxxxxxx` |
| `kid_id` | String | 关联孩子 ID | `kid_xxxxxxxx` |
| `operator_id` | String | 操作人 ID | `user_xxxx` |
| `operator_name` | String | 操作人名称快照 | "爸爸" |
| `delta` | Number | 变动值 | +5, -10 |
| `reason` | String | 理由 | "认真作业" |
| `type` | String | 类型 | "reward", "expense" |
| `timestamp` | Number | 时间戳 (用于排序) | 1678888888888 |
| `created_at` | Date | 创建时间 | `ServerDate` |

---

## 如何初始化数据

1. 在云开发控制台创建上述 4 个集合。
2. 部署 `ourchildren_initDatabase` 云函数。
3. 在控制台“云函数”列表 -> 测试 `ourchildren_initDatabase` 函数。
4. 运行成功后，集合中将自动生成一套示例数据。
