# Show Me The Menu - 开发计划

## 1. 项目定位
一个智能化的家庭食谱推荐系统，支持一键生成周菜单、灵活调整（拖拽/替换）、AI 辅助决策及个性化偏好记忆。

## 2. 技术栈选型
- **前端框架**: Next.js (React) - *兼顾前后端，方便 API 开发*
- **样式库**: Tailwind CSS - *快速构建现代化 UI*
- **状态管理**: Zustand - *轻量级全局状态管理*
- **交互库**: dnd-kit - *实现拖拽功能*
- **数据存储 (演进式)**:
    1. **初期**: 本地 JSON 文件 (通过 Node.js FS 读写)
    2. **中期**: SQLite (via Prisma ORM) - *轻量级关系型数据库*
    3. **后期/可选**: Notion API 或 Supabase - *便于非技术人员编辑或云端同步*
- **AI 对接**: Vercel AI SDK / OpenAI API
- **部署架构**: Azure Static Web Apps (SWA) + GitHub Actions CI/CD

## 3. 分步开发路线图

### Phase 1: 基础架构与交互重构 (MVP)
目标：将静态 HTML 转化为动态 Web App，实现核心的“生成”与“调整”功能。
- [x] **项目初始化**: 创建 Next.js 项目，配置 Tailwind CSS。
- [x] **组件化**: 将 `weekly_menu.html` 拆分为 `WeekView`, `DayCard`, `MenuItem` 等 React 组件。
- [x] **数据层**: 将 `menu_data.js` 扩展为更完整的 JSON 数据库（包含更多菜品池）。
- [x] **核心逻辑**:
    - [x] 实现“一键推荐”算法（基于本地 JSON 的加权随机）。
    - [x] 实现“点击替换”功能（弹窗选择同类菜品）。
    - [x] 实现“拖拽调整”功能（使用 dnd-kit）。

### Phase 2: 部署与 DevOps (Azure)
目标：建立 CI/CD 流水线，确保代码每次提交都能自动部署到 Azure。
- [x] **CI/CD 架子**: 创建 `.github/workflows/azure-static-web-apps.yml` (参考 Azure SWA 标准流程)。
- [x] **配置**: 添加 `staticwebapp.config.json` 用于路由和安全配置。
- [ ] **基础设施**: (文档) 指导如何在 Azure Portal 创建 Static Web App 并连接 GitHub。

### Phase 3: 数据管理与偏好系统
目标：建立可持续维护的菜谱库，实现黑名单和喜好记录。
- [ ] **数据结构升级**: 定义 `Recipe` (菜谱) 和 `Ingredient` (食材) 模型。
- [ ] **管理后台**: 开发 `/admin/recipes` 页面，允许 CRUD（增删改查）菜谱。
- [ ] **偏好逻辑**:
    - [ ] 实现“黑名单”功能（菜品/食材）。
    - [ ] 实现“锁定”功能（生成新菜单时保留被锁定的菜品）。
    - [ ] 记录“最近使用”，降低重复推荐权重。

### Phase 4: AI 智能化集成
目标：引入 AI 提升推荐质量和录入效率。
- [ ] **AI 辅助录入**: 输入菜谱文本/链接，AI 自动提取食材、步骤并存入数据库。
- [ ] **智能推荐模式**: 允许用户输入“想吃辣”、“清理冰箱里的胡萝卜”，调用 LLM 生成符合条件的菜单。
- [ ] **烹饪指导**: 点击菜名显示详情，若数据库无详情，实时调用 AI 生成做法或搜索视频链接。

### Phase 5: 持久化与多用户
目标：从单机运行转向云端服务。
- [ ] **数据库迁移**: 评估是否迁移至 Supabase/Azure SQL。
- [ ] **用户系统**: 简单的 Auth，区分“临时访客”和“家庭成员”。

## 4. 下一步行动 (Next Steps)
1. 完善 Phase 1 的核心交互逻辑。
2. 搭建 Phase 2 的 CI/CD 骨架。
