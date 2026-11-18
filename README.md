# 光影志 Lumina · 架构 V1.0

**Local-first + Optional Cloud Sync**：本地优先，用户主动开启云同步，照片始终留在本地。

光影志是一个支持可选云同步的本地优先 AI 个人记忆系统。不开启同步时，它必须是一个完整可用的本地产品；开启同步后，只同步日记文本和必要元数据，照片与图片 Blob 永远不上传。

## 团队信息

- 团队名称：光影志
- 团队成员：BlueBlueblues、taokenailong、yeapower19
- 代码仓库：https://github.com/BlueBlueblues/Lumina
- 技术文档：[docs/光影志_Lumina_技术文档.pdf](docs/光影志_Lumina_技术文档.pdf)（含 2026-11-18 补充说明）

---

## 一、架构与原则

```
浏览器（本地主工作区）
  HTML / JS  ·  IndexedDB（日记 + 照片 Blob）  ·  Recall Engine  ·  Sync Engine
        │ HTTPS / REST（仅文本与元数据）
        ▼
Nginx（同域 HTTPS 反向代理）
        ▼
Fastify + TypeScript
  AI Service（视觉 / 写作 / 对话 / 检索）   Sync Service（设备 / 日记 / 版本）
        │                                      │
        ▼                                      ▼
   DeepSeek API                            PostgreSQL
```

- **AI Service 与 Sync Service 逻辑分离**：AI Service 只接收任务、调用 DeepSeek、返回结果，不持久化日记；Sync Service 只在用户主动开启同步后保存日记文本与元数据。
- **本地优先**：不开启云同步也能完整使用。服务器故障不会影响本地查看与编辑。
- **只同步必要数据**：不上传照片、缩略图、图片 Blob，不复制全部浏览器数据。
- **AI 与数据存储解耦**：DeepSeek 负责理解与生成；浏览器负责本地记忆；PostgreSQL 负责用户主动选择的云端同步。
- **不引入额外基础设施**：不使用 Redis、Elasticsearch、MinIO、pgvector、图片对象存储。

## 二、数据边界

| 数据 | 保存位置 | 云端同步 |
| --- | --- | --- |
| 原始照片 Blob | IndexedDB（桥接层捕获） | 否 |
| 256px 缩略图 | localStorage（原 UI 读模型）+ IndexedDB 副本 | 否 |
| 本地 AI 临时数据、聊天过程、检索索引 | IndexedDB | 否 |
| 日记 ID、标题、正文、记录日期 | localStorage + IndexedDB 影子 + PostgreSQL（开启同步后） | 是 |
| 情绪、用户标签、AI 观察文字事实、用户补充 | localStorage + IndexedDB 影子 + PostgreSQL（开启同步后） | 是 |
| 记录修改时间、revision、deviceId、删除墓碑 | localStorage + IndexedDB 影子 + PostgreSQL | 是 |
| 照片数量提示（仅有/无照片的布尔值，不含图片） | IndexedDB + PostgreSQL | 是 |

说明：视觉分析时，图片会临时经过后端发送给 DeepSeek，但**后端不持久化图片**；这与云端日记同步是两条不同的数据路径。

## 三、目录

```
lumina/
├── frontend/
│   ├── index.html              # 模块化前端入口（纸墨 UI）
│   ├── assets/                 # 构建资源（JS / CSS / WebP / 字体）
│   ├── recall-assets/          # 证据回忆工作台构建产物
│   ├── README-frontend.txt     # 原前端说明
│   ├── 接入说明.md              # 原前端后端契约
│   └── src/
│       ├── lumina-bridge.js    # localStorage ↔ IndexedDB / 云同步桥
│       ├── config.js
│       ├── providers/
│       ├── storage/            # indexeddb / memories / assets / outbox / record-codec / records
│       ├── sync/               # sync-engine / conflict / api
│       └── recall/             # recall-engine.js
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── config.ts
│   │   ├── routes/             # ai / lumina / sync / evidence
│   │   ├── services/           # AI / sync / evidence-agent / evidence-validation / grounded-writing
│   │   ├── providers/          # deepseek.provider.ts
│   │   ├── database/           # schema / connection / migrate
│   │   ├── prompts/
│   │   ├── schemas/
│   │   └── lib/
│   ├── test/                   # schemas / tokens / evidence / repair
│   ├── package.json
│   └── tsconfig.json
├── recall-workspace/           # 证据回忆工作台源码（Vue 3 + TypeScript）
│   ├── src/                    # Workspace.vue / repository.ts / main.ts / style.css
│   ├── test/
│   ├── vite.config.ts
│   └── package.json
├── docs/                       # 技术文档与作品介绍文档
├── deploy/
│   ├── nginx.conf
│   └── lumina.service
└── README.md
```

### 前端交接包融合方式

- 前端已升级为模块化构建：`index.html` + `assets/` + `recall-assets/`，保留原纸墨视觉；证据回忆工作台随构建产物部署。
- 原 `Providers` 已切到 `mode: 'http'`，端点指向 `/api/lumina`；后端不可用或返回非 2xx 时自动回退到原来的本地规则，页面不会白屏。
- 新增 `src/lumina-bridge.js`：
  - 把 localStorage 的 `lumina.records.v3` 镜像到 IndexedDB 的 `memories` 影子记录，并接入同步引擎；
  - 只把日记文本和必要元数据送入云端，照片缩略图/原图/Blob 不会进入同步 payload；
  - 首次加载不会把“IndexedDB 有、localStorage 没有”的记录误判为本地删除；
  - 页面运行期间的删除/清空会生成墓碑（`deletedAt`）并同步；
  - 从云端拉回的新记录会补进 localStorage，并刷新原 UI。
- 原 UI 的照片只存 256px 缩略图；桥接层会在用户保存照片记录时把**原图**额外写入 IndexedDB，删除记录时一并清理。缩略图仍保留在 localStorage 供原 UI 即时渲染。
- 证据回忆工作台：新增 `/api/recall/start` 与 `/api/recall/continue`，服务端只做决策与逐字校验，检索在浏览器本地执行；前端产物位于 `frontend/recall-assets/`。
- 云同步入口：首页右上角 `⋯` → **云同步**；运行状态面板里也保留入口
- `⋯` 菜单已改为用户语言：`备份到文件` / `从备份恢复`（不出现 JSON），并去掉 `载入示例`；备份含缩略图、不含原图；清空按同步状态提示（同步开启时明确会删除云端）
- 记录 ID 继续使用原前端的 `r...` 形式；同步 API 接受 1–140 字符的文本 ID（不再要求 UUID）。如果之前已经用旧 schema 建过 PostgreSQL，需要重建 `memories.id` / `sync_events.memory_id` 为 `text`。
- 已知限制：localStorage 约 5 MB 的上限仍在（主要是缩略图）；前端已完成 `index.html + assets + recall-assets` 拆分，缩略图迁入 IndexedDB 仍待后续。
- 前端已拆分，请通过 HTTP 访问（开发用 5173，生产用 Nginx 同域）；旧的 6.3 MB 单文件双击模式不再作为主路径。

## 四、快速开始

要求：Node.js **22 LTS**（生产）、PostgreSQL 16。

### 1. 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env：DATABASE_URL、TOKEN_PEPPER、DEEPSEEK_API_KEY
npm install
npm run db:migrate
npm run dev
```

未配置 `DATABASE_URL` 时，同步 API 返回 `503 sync_unavailable`；未配置 `DEEPSEEK_API_KEY` 时，AI API 返回 `503 ai_unavailable`。本地日记功能不受影响。

健康检查：`GET http://127.0.0.1:3000/api/health`

### 2. 前端

前端是原生 HTML/JavaScript，无构建步骤。开发时用任意静态服务器：

```bash
npx http-server frontend -p 5173 -c-1
```

打开 `http://localhost:5173`。前端会自动把 API 指向 `http://127.0.0.1:3000`。
后端 `CORS_ORIGIN` 默认允许 `http://localhost:5173,http://127.0.0.1:5173`。生产环境通过 Nginx 同域访问，不需要 CORS。

### 3. 测试与构建

```bash
cd backend
npm run typecheck
npm test
npm run build
npm start

# 证据回忆工作台（Vue 3 + TypeScript）
cd ../recall-workspace
npm ci --no-audit --no-fund
npm test
npm run build
```

## 五、API 契约

### AI（无账号，按 IP 限流，返回不落库）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/ai/vision` | 图片观察，返回事实/情绪/标签 |
| POST | `/api/ai/writing` | 根据事实生成日记草稿 |
| POST | `/api/ai/conversation` | 基于本地上下文对话 |
| POST | `/api/ai/recall` | 对候选记忆排序 |

AI 请求体使用 Zod 校验，响应为结构化 JSON。服务端不保存请求中的图片或日记内容。
视觉端点的实际能力取决于 `DEEPSEEK_VISION_MODEL` 是否支持 `image_url` 输入；接口契约不变，切换兼容模型不需要改前端。

### 前端交接包兼容 API（`/api/lumina`）

原前端通过 `window.Providers` 调用下面 5 个接口；后端已实现适配层，底层仍复用 DeepSeek Provider、Zod 校验和限流，不持久化请求内容。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/lumina/observe` | 看图，返回 `{scene,time,light,subjects,absence,text_spans,palette,brightness,saturation,conf}` |
| POST | `/api/lumina/write` | `stage=draft/memory/final`，返回 `{text}` |
| POST | `/api/lumina/text/reply` | 文字对话，返回 `{reply,question}` |
| POST | `/api/lumina/text/integrate` | 把用户说过的几段整理成一段，返回 `{text}` |
| POST | `/api/lumina/photo/question` | 看图后追问一句，返回 `{question}` |

前端在开发环境会自动把端点指向 `http://127.0.0.1:3000/api/lumina`；生产环境走同域 `/api/lumina`。后端未配置密钥或请求失败时，前端回退到交接包自带的本地规则。

### 证据回忆 API（`/api/recall`）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/recall/start` | 创建内存态证据回忆会话，返回首轮工具调用决策 |
| POST | `/api/recall/continue` | 回传浏览器本地工具结果，推进多轮阅读与逐字核验 |

接口只持有会话与校验状态，不把本地日记全量上传；浏览器执行 `search_memories` / `get_memory`，服务端做模型决策与引用校验。

### 同步（Bearer 设备令牌）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/sync/pair` | 配对新设备 / 创建同步空间 / 恢复 / 生成新配对码 |
| POST | `/api/sync/push` | 推送本地修改 |
| GET | `/api/sync/pull?cursor=&limit=` | 拉取增量事件 |
| POST | `/api/sync/resolve` | 处理版本冲突 |
| POST | `/api/sync/disable` | 关闭本设备同步，或清除云端数据 |

`POST /api/sync/pair` 的四种模式：

```jsonc
{ "mode": "create", "deviceName": "书房的 Mac" }
{ "mode": "join", "code": "ABCD2345", "deviceName": "手机" }
{ "mode": "recover", "recoveryCode": "XXXX-XXXX-XXXX-XXXX", "deviceName": "新手机" }
{ "mode": "new-code" }   // 需要 Authorization: Bearer <deviceToken>
```

创建成功会返回 `deviceToken`（仅显示一次）、`recoveryCode`（仅显示一次）和一次性 `pairingCode`。
服务端只保存令牌与配对码的 SHA-256 哈希；配对码 10 分钟有效且只能使用一次。

### 同步语义

- 每条日记使用 `revision`（记录版本，不是时间戳）+ `baseRevision` 做乐观并发控制。
- 推送时若服务端版本与 `baseRevision` 不一致，返回 `409 revision_conflict`，并保留服务器版本与客户端版本。
- 客户端可调用 `/api/sync/resolve` 选择保留服务器、保留本地或写入合并版本。
- 删除使用墓碑（`deletedAt`），删除后服务端清空该记录的文本字段；另一台设备不会把已删除日记同步回来。
- `pull` 基于 `sync_events` 的单调事件 ID 做增量游标，不拉取全量 JSON。
- `POST /api/sync/disable` 默认只吊销本设备令牌；`{"purgeCloudData": true, "confirmPurge": "DELETE"}` 会删除整个同步空间的云端数据。

## 六、服务器部署（阿里云上海示例）

> 目标：将域名（例如 `shiyulab.xyz`）解析到你的服务器公网 IP，Nginx 同域静态站点 + `/api` 反代，systemd 守护，Certbot 签发 HTTPS。

1. **DNS**：在 DNS 控制台只保留指向服务器公网 IP 的 A 记录，删除旧的失效 A 记录。
2. **备案**：中国大陆节点通过 80/443 对外提供 Web 服务需要 ICP 备案，请先确认 `shiyulab.xyz` 已备案。
3. **运行环境**：
   ```bash
   # Node.js 22 LTS（NodeSource 示例）
   curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
   apt-get install -y nodejs postgresql nginx certbot python3-certbot-nginx

   useradd --system --home /opt/lumina --shell /usr/sbin/nologin lumina
   install -d -o lumina -g lumina -m 755 /opt/lumina
   install -d -o root -g lumina -m 750 /etc/lumina
   ```
4. **数据库**：
   ```bash
   sudo -u postgres psql -c "CREATE USER lumina WITH PASSWORD '请替换';"
   sudo -u postgres psql -c "CREATE DATABASE lumina OWNER lumina;"
   ```
   1.6GB 内存的机器建议在 `postgresql.conf` 采用小配置：`shared_buffers = 128MB`、`work_mem = 4MB`、`maintenance_work_mem = 64MB`、`max_connections = 20`。
5. **代码与配置**：
   ```bash
   # 将 lumina/ 上传到 /opt/lumina
   cd /opt/lumina/backend
   npm ci
   npm run db:migrate
   npm run build

   cp /opt/lumina/deploy/lumina.service /etc/systemd/system/lumina.service
   cp backend/.env.example /etc/lumina/lumina.env
   # 编辑 /etc/lumina/lumina.env：NODE_ENV=production、DATABASE_URL、TOKEN_PEPPER、DEEPSEEK_API_KEY、TRUST_PROXY=true
   chown root:lumina /etc/lumina/lumina.env
   chmod 640 /etc/lumina/lumina.env
   chown -R lumina:lumina /opt/lumina
   systemctl daemon-reload
   systemctl enable --now lumina
   ```
6. **Nginx 与 HTTPS**：
   ```bash
   cp /opt/lumina/deploy/nginx.conf /etc/nginx/sites-available/lumina
   ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/lumina
   nginx -t && systemctl reload nginx
   certbot --nginx -d shiyulab.xyz -d www.shiyulab.xyz
   ```
7. **验证**：`GET https://shiyulab.xyz/api/health` 应返回 `ok: true`，且 `syncConfigured`、`aiConfigured` 为 `true`。

### 部署注意事项

- 这台 1.6GB 内存的服务器上，VS Code Server 可能占用约 1.1GB。部署前建议停止 VS Code Server，或只保留应用进程。
- 不在开发中途随意升级 Node.js 主版本；生产固定 Node 22 LTS。
- PostgreSQL 数据目录放在持久化磁盘，并配置定期 `pg_dump` 备份。
- 若实际负载或内存压力较大，再迁移到独立托管 PostgreSQL；当前不引入额外云服务成本。

## 七、安全与隐私

- 设备令牌、配对码、恢复码只保存 SHA-256 哈希（可配置 `TOKEN_PEPPER`），不保存明文。
- 配对码一次性、短时效；恢复码用于设备全部丢失的场景。
- 所有同步响应 `Cache-Control: no-store`；日志对 `Authorization`、`Cookie` 做 redact。
- 图片与日记文本不写入服务端日志；AI 服务不持久化日记。
- 云同步开启后，日记文本确实会持久化在 PostgreSQL 中，产品文案不能声称“服务器完全不保存日记”。
- 关闭同步默认保留本地数据；清除云端数据需要显式 `DELETE` 确认。

## 八、当前实现状态与下一步

已实现：

- 后端 Fastify + TypeScript 工程、配置、日志、错误处理、健康检查
- PostgreSQL schema、连接池、迁移脚本
- DeepSeek Provider（OpenAI SDK）、四类 AI 服务与路由、Zod 结构化输出、IP 限流
- 前端交接包兼容层（`/api/lumina` 五个接口）与原 UI 的 HTTP/本地回退
- 证据回忆工作台（`/api/recall/*`）与逐字引文核验、结构化歧义澄清
- 同步空间、设备令牌、一次性配对码、恢复码、增量 push/pull、revision 冲突、墓碑、冲突解决、关闭/清除
- 模块化前端（`index.html + assets + recall-assets`）；localStorage ↔ IndexedDB ↔ 云同步桥、照片原图本地存储、证据回忆工作台、云同步与冲突面板
- Nginx 与 systemd 部署模板、单元测试

真实 DeepSeek 文字与读图接口、PostgreSQL 迁移、双设备同步、冲突、恢复码、清除、浏览器端到端和生产部署均已完成验证。后续可选项见第九节。

> 说明：前端已从 6.3 MB 单文件升级为模块化构建；证据回忆工作台以 `recall-assets` 构建产物部署，主 UI 仍保留纸墨视觉。

## 九、部署验证与后续

- 已在 Ubuntu 24.04 + Node.js 22 LTS + PostgreSQL 16 + Nginx + systemd 上完成生产部署。
- 已在服务器配置全站 HTTPS：Let's Encrypt 证书覆盖 `shiyulab.xyz` / `www`，有效期至 2027-02-16，Nginx 443 与 HTTP→HTTPS 跳转均已启用。
- 域名 HTTPS 已可用：经公网实测 `https://shiyulab.xyz` 返回 200；80 端口 HTTP 仍被阿里云 ICP 拦截（403 Beaver），访问请使用 HTTPS。公网 IP/Tailscale 可作为备用入口。
- 已验证：健康检查、DeepSeek 文字/读图接口、证据回忆工作台、双设备同步、冲突解决、恢复码、清除、浏览器端到端。
- 已配置每日 `pg_dump` 备份。
- 具体服务器地址、域名与密钥不写入仓库；部署时按第六节替换占位符。

后续可选：
- ICP 备案生效（主要影响 80 端口 HTTP 入口；HTTPS 已可用，Certbot 续期已具备）。
- AI 接口的公网限流、评审 IP 白名单与模型消费上限。
- 备份异地保存与恢复演练。
- 将缩略图迁入 IndexedDB（前端拆分已完成）。
