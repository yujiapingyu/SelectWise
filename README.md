# SelectWise - AI 驱动的文本分析 Chrome 插件

SelectWise 是一个 Chrome 浏览器插件，可以使用 Google 的 Gemini AI 分析你选中的文本，并支持将分析结果保存到 Notion。

## ✨ 功能特性

- 🎯 **智能文本选择**: 选中网页上的任何文本即可触发分析
- 🤖 **AI 智能分析**: 使用 Gemini 2.0 Flash 进行深度文本分析
- 🌍 **多语言翻译**: 支持翻译为英语、中文、西班牙语、法语、德语、日语或韩语
- 🎨 **多语言界面**: 界面支持 5 种语言（英语、中文、日语、西班牙语、法语）
- 📝 **深度洞察**: 获取翻译、分析、例句、标签和相关词汇
- 💾 **Notion 集成**: 一键保存分析结果到 Notion 数据库
- ✍️ **Markdown 支持**: Analysis 字段支持 Markdown 格式显示
- 🎨 **优雅动画**: 流畅的淡入淡出效果，现代化用户体验
- 🔒 **Shadow DOM**: 完全的样式隔离，不影响网页原有样式

## 📦 安装方法

### 从源码安装

1. **克隆或下载此仓库**
   ```bash
   git clone <repository-url>
   cd SelectWise
   ```

2. **加载到 Chrome**
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 在右上角启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `SelectWise` 目录

3. **验证安装**
   - 工具栏出现 ⚡ SelectWise 图标
   - 插件卡片显示在扩展列表中

## ⚙️ 设置配置

### 1. 获取 Gemini API Key（必需）

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 使用 Google 账号登录
3. 点击「Create API key」
4. 复制生成的 API key

### 2. 配置插件

1. 点击 Chrome 工具栏中的 ⚡ SelectWise 图标
2. 点击「打开设置」
3. 填写以下信息：
   - **Gemini API Key**（必需）：粘贴你的 API key
   - **Target Language**（必需）：选择翻译目标语言
   - **UI Language**（可选）：选择界面显示语言
4. 点击「保存设置」

### 3. 设置 Notion 集成（可选）

#### 步骤 1：创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击「+ New integration」
3. 配置：
   - **Name**: SelectWise
   - **Type**: Internal
   - **Capabilities**: Read, Update, Insert content
4. 保存并复制 **Integration Token**（格式：`secret_xxx...`）

#### 步骤 2：创建 Notion 数据库

在 Notion 中创建一个数据库，包含以下属性：

| 属性名称 | 类型 | 必需 | 说明 |
|---------|------|------|------|
| **Name** | Title | ✅ | 选中的原文 |
| **Translation** | Text | ✅ | 翻译结果 |
| **Type** | Select | ✅ | 文本类型（Word/Sentence） |
| **Analysis** | Text | ✅ | AI 深度分析 |
| **Examples** | Text | ✅ | 例句 |
| **Tags** | Multi-select | ✅ | 相关标签 |
| **URL** | URL | ✅ | 来源网页链接 |

**Type 属性的选项**：
- `Word`（单词）
- `Sentence`（句子）

#### 步骤 3：共享数据库

1. 打开创建的数据库
2. 点击右上角「...」→「Add connections」
3. 选择「SelectWise」Integration
4. 确认共享

#### 步骤 4：获取 Database ID

1. 复制数据库页面的 URL
   ```
   https://www.notion.so/workspace/DatabaseName-1234567890abcdef1234567890abcdef?v=...
   ```
2. 提取 32 位字符串（位于数据库名和 `?v=` 之间）
   ```
   1234567890abcdef1234567890abcdef
   ```
3. 如果包含连字符，需要移除：
   ```
   12345678-90ab-cdef-1234-567890abcdef → 1234567890abcdef1234567890abcdef
   ```

#### 步骤 5：在插件中配置

1. 打开 SelectWise 设置页面
2. 填写：
   - **Notion Integration Token**: 粘贴 Token
   - **Notion Database ID**: 粘贴 Database ID（32位，无连字符）
3. 保存设置

## 🚀 使用方法

1. **选中文本**
   - 在任何网页上用鼠标选中单词、短语或句子
   - 松开鼠标后，选中文本旁边会出现紫色 ⚡ 图标（带淡入动画）

2. **查看分析**
   - 点击 ⚡ 图标
   - 图标消失，页面中央弹出分析面板
   - 显示「Analyzing with AI...」加载动画
   - 几秒后显示完整的 AI 分析结果

3. **面板操作**
   - **拖拽移动**：按住面板标题栏可拖动位置
   - **保存到 Notion**：点击底部「Save to Notion」按钮
   - **关闭面板**：
     - 点击右上角 ✕ 按钮
     - 或点击面板外的任何区域

4. **分析结果包含**
   - ✅ 原文（Original Text）
   - ✅ 翻译（Translation）
   - ✅ 深度分析（Analysis）- 支持 Markdown 格式
   - ✅ 标签（Tags）
   - ✅ 例句（Examples）
   - ✅ 相关词汇（Related Vocabulary）

## 🧠 工作原理

### 智能分析逻辑

插件会根据文本长度和内容智能选择分析策略：

**单词/短语**（≤3 个词）：
- 词性和详细释义
- 发音提示（日语使用假名，其他语言用 IPA）
- 常见搭配和用法
- 2-3 个实用例句
- 相关词汇和同义词

**句子/段落**：
- 完整准确的翻译
- 语法结构分析
- 核心思想和主旨
- 语气和情感分析
- 类似表达和改写

### 语言处理规则

- **Translation**: 翻译为用户选择的目标语言
- **Analysis**: 使用目标语言进行分析
- **Examples**: 使用原文语言（保持真实性）
- **Tags**: 使用原文语言
- **Related Vocabulary**: 使用原文语言

### 特殊规则

**日语文本识别**：
- 当目标语言为中文时，自动检测日语文本（平假名/片假名）
- 对于纯汉字，默认按日语处理（避免误判）
- 发音使用假名标注，禁用罗马音

**发音标注**：
- 仅在 Analysis 字段中提供发音
- Examples 中不包含发音标注
- 日语使用振假名（ふりがな）
- 其他语言使用 IPA 音标

## 🛠️ 技术栈

- **Manifest V3**: Chrome 扩展最新标准
- **Vanilla JavaScript**: 无框架依赖，轻量高效
- **Shadow DOM**: 完全样式隔离
- **Gemini 2.0 Flash Exp**: Google 最新 AI 模型
- **Chrome Storage API**: 跨设备同步设置
- **Notion API**: 数据持久化
- **i18n 系统**: 自定义多语言支持
- **Markdown Parser**: 简单高效的文本渲染

## 📁 项目结构

## 📁 项目结构

```
SelectWise/
├── manifest.json          # 插件配置文件（Manifest V3）
├── background.js          # Service Worker（API 调用处理）
├── content.js             # 内容脚本（文本选择、UI 渲染）
├── i18n.js               # 多语言翻译系统
├── markdown.js           # Markdown 渲染器
├── options.html          # 设置页面
├── options.js            # 设置逻辑
├── popup.html            # 扩展弹窗
├── popup.js              # 弹窗逻辑
├── icons/                # 插件图标
│   ├── icon.svg          # 源文件
│   ├── icon16.png        # 16x16 工具栏图标
│   ├── icon48.png        # 48x48 管理页图标
│   └── icon128.png       # 128x128 应用商店图标
└── README.md             # 项目文档
```

## 🔍 故障排除

### Gemini API 相关

**问题：「请在设置中配置你的 Gemini API key」**
- 解决：进入设置页面，粘贴有效的 Gemini API key
- 检查：API key 是否完整，没有多余空格

**问题：分析失败或无响应**
- 检查网络连接是否正常
- 验证 API key 是否有效（可能过期）
- 查看 API 配额是否用完（访问 Google AI Studio）
- 打开控制台查看错误信息（F12 → Console）

### Notion 集成相关

**问题：保存到 Notion 失败**

插件会显示详细的检查清单：
- ✅ Integration Token 是否正确？
- ✅ Database ID 是否正确？（32位字符）
- ✅ 数据库已共享给 Integration？
- ✅ 数据库包含所有必需的属性？

**解决步骤**：
1. **检查 Token**：重新复制 Integration Token，确保以 `secret_` 开头
2. **检查 Database ID**：确保是 32 位字符，移除所有连字符
3. **重新共享数据库**：数据库 → ... → Add connections → 选择 SelectWise
4. **验证属性**：确保包含所有 7 个必需属性，类型正确

### 界面相关

**问题：选中文本后图标不出现**
- 确保选中的文本不为空（至少 1 个字符）
- 尝试重新选择文本
- 刷新页面后重试
- 检查页面是否有冲突的 JavaScript

**问题：面板位置不对或显示异常**
- 面板会自动调整位置避免超出屏幕
- 可以拖拽面板标题栏移动
- 点击外部区域关闭面板

**问题：界面语言没有切换**
- 在设置页面选择 UI Language
- 保存设置后会立即更新
- 刷新已打开的网页以更新内容脚本

## 💡 使用技巧

### 最佳实践

1. **选择合适的文本长度**
   - 单词/短语：3 个词以内效果最佳
   - 句子：完整的一句话
   - 段落：不超过 200 字符

2. **充分利用 Markdown**
   - Analysis 字段支持 **粗体**、*斜体*、`代码`、[链接]()
   - Gemini 可能会在分析中使用 Markdown 格式化

3. **Notion 管理技巧**
   - 在 Notion 中创建不同视图（按类型、标签分组）
   - 添加 Created time 属性追踪学习时间
   - 使用筛选器查找特定内容

### 键盘快捷键

- 选中文本：双击单词，或拖拽选择
- 关闭面板：点击外部或按 ESC（部分网站）
- 拖拽面板：按住标题栏移动

## 🔐 隐私与安全

- ✅ 所有 API key 使用 Chrome Storage API 加密存储
- ✅ 数据仅在本地和你选择的服务间传输
- ✅ 不收集用户数据
- ✅ 不向第三方发送信息
- ✅ API 调用直接发送到 Google/Notion 服务器
- ✅ 文本选择仅在用户明确点击时触发

## ⚡ 性能优化

- **轻量级**：无外部依赖，总大小 < 100KB
- **快速响应**：使用 Gemini 2.0 Flash 模型（延迟 < 2s）
- **样式隔离**：Shadow DOM 确保零冲突
- **智能缓存**：Settings 使用 Chrome 同步存储

## 🌐 API 限制

### Gemini API
- 免费层：15 RPM（每分钟请求数）
- 详细限制：查看 [Google AI Pricing](https://ai.google.dev/pricing)

### Notion API
- 速率限制：3 请求/秒
- 数据库限制：无限行数

## 🚧 开发指南

### 本地开发

1. **修改代码**
   ```bash
   # 编辑任何 .js、.html、.css 文件
   ```

2. **重新加载扩展**
   - 访问 `chrome://extensions/`
   - 点击 SelectWise 卡片上的刷新图标 🔄

3. **查看日志**
   - **内容脚本**：网页按 F12 → Console
   - **后台脚本**：扩展页面 → 查看视图 → Service worker
   - **设置页面**：设置页面按 F12 → Console

### 调试技巧

```javascript
// 在 background.js 中添加日志
console.log('API Response:', response);

// 在 content.js 中调试
console.log('Selected text:', selectedText);

// 测试 i18n
console.log(t('panel_title', 'zh-CN'));
```

## 📝 更新日志

### 最新版本特性

- ✨ 添加 Markdown 渲染支持
- 🌍 完整的多语言界面（5 种语言）
- 🎨 优化图标动画效果（淡入淡出）
- 🐛 修复浮动图标位置越界问题
- 🔧 改进 Notion 错误提示（多语言）
- 📱 点击外部关闭面板功能
- 🎯 智能语言检测（中日文）
- ✍️ 发音标注规则优化（假名代替罗马音）

## 🤝 贡献

欢迎贡献！可以：
- 🐛 报告 Bug（通过 Issues）
- 💡 提出新功能建议
- 🔀 提交 Pull Request
- 📖 改进文档
- 🌍 添加新语言翻译

## 📄 许可证

本项目开源，可用于个人和教育用途。

## 💬 支持与反馈

如有问题或建议：
1. 查看本 README 的故障排除部分
2. 检查浏览器控制台的错误信息
3. 提交 Issue 并附上详细信息

## 🙏 致谢

- 🤖 由 [Google Gemini AI](https://ai.google.dev/) 驱动
- 📝 集成 [Notion API](https://developers.notion.com/)
- ❤️ 用心为语言学习者打造

---

**注意**：此插件需要有效的网络连接和 Gemini API key 才能正常工作。Notion 集成为可选功能。

**Enjoy learning with SelectWise! 🚀**
