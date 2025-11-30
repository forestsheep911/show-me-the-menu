# 云端数据库设计方案 (Draft)

考虑到项目需部署在 Azure Static Web Apps，并具备 AI 扩展能力（语义搜索、智能推荐），建议采用 **PostgreSQL** 方案，具体推荐使用 **Supabase** (BaaS) 或 **Azure Database for PostgreSQL**。

## 1. 选型建议：Supabase (PostgreSQL)

虽然项目托管在 Azure，但 Supabase 提供了极佳的开发体验和免费层，且基于标准的 PostgreSQL，未来迁移零成本。

### 核心优势
- **原生向量支持 (pgvector)**: 直接支持存储文本向量，完美契合“根据自定义输入要求推荐”（语义搜索）和“相似菜谱推荐”的 AI 场景。
- **可视化管理 (Table Editor)**: 提供类似 Excel/Notion 的在线表格编辑器，方便非技术人员（如家人）直接录入或修改数据。
- **内置 Auth**: 解决未来的“家庭成员”和“访客”权限管理。
- **JSONB 支持**: 灵活存储复杂的“烹饪步骤”或“营养成分”，无需过度规范化。

---

## 2. 数据库架构设计 (ER图概念)

### 核心实体表

#### 1. `recipes` (菜谱表)
存储核心菜品信息。
- `id`: UUID (PK)
- `name`: Text (菜名)
- `description`: Text (简介/口味描述)
- `cover_image`: Text (图片URL)
- `steps`: JSONB (烹饪步骤，结构化存储)
- `tags`: Text[] (标签：如 "快手", "辣", "汤", "大荤")
- `embedding`: Vector(1536) (用于 AI 语义搜索的向量数据)
- `created_at`: Timestamp

#### 2. `ingredients` (食材库)
基础食材，用于生成购物清单和进行黑名单过滤。
- `id`: UUID (PK)
- `name`: Text (食材名，如 "土豆")
- `category`: Text (分类，如 "蔬菜", "肉类")

#### 3. `recipe_ingredients` (菜谱-食材关联)
多对多关系。
- `recipe_id`: UUID (FK)
- `ingredient_id`: UUID (FK)
- `quantity`: Text (用量，如 "500g", "2个")

### 偏好与记录表

#### 4. `preferences` (用户偏好)
记录用户对菜品或食材的喜好/黑名单。
- `user_id`: UUID (关联用户)
- `target_type`: Enum ('recipe', 'ingredient')
- `target_id`: UUID
- `preference_type`: Enum ('blacklist', 'love', 'like')
- `weight`: Integer (-100 到 100，黑名单为 -100)

#### 5. `menu_history` (推荐记录)
用于“减少最近推荐过菜的概率”。
- `id`: UUID
- `user_id`: UUID
- `week_start_date`: Date
- `menu_snapshot`: JSONB (当周菜单的完整快照)
- `status`: Enum ('active', 'archived', 'locked')

---

## 3. AI 交互流程设计

1.  **录入时**:
    *   用户输入文本/链接 -> AI 解析 -> 存入 `recipes` 表。
    *   同时调用 OpenAI Embedding API -> 生成向量 -> 存入 `embedding` 字段。
2.  **推荐时**:
    *   用户输入 "想吃点辣的下饭菜" -> 转换为向量。
    *   数据库执行 `ORDER BY embedding <-> user_query_vector` (语义相似度查询)。
    *   结合 `preferences` 表过滤掉黑名单菜品。
    *   结合 `menu_history` 降低最近吃过的菜的权重。

## 4. 为什么不选 Notion 或纯 JSON?

*   **Notion**: 也就是 API 稍弱，且并发限制较多，不适合作为高频读取的 App 后端，向量搜索实现复杂。
*   **纯 JSON (Git)**: 适合初期单人开发，但无法处理“多人协作修改数据”（Git 冲突）、“复杂查询”（如倒排索引食材）和“向量搜索”。

## 5. 部署成本预估

*   **Supabase Free Tier**:
    *   数据库大小: 500MB (足够存数万条纯文本食谱)
    *   API 请求: 无限
    *   成本: **$0/月**
*   **Azure Static Web Apps (Free)**:
    *   托管前端和 Serverless API
    *   成本: **$0/月**

---

请检阅此方案，如果同意，我们可以在 **Phase 3** 中按照此结构进行实施。

