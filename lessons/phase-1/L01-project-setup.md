# L01 · 项目脚手架 + 开发环境

```
🎯 本节目标：用 Vite 创建 Vue 3 + TypeScript 项目，理解每个文件的作用
📦 本节产出：可运行的 Hello World 项目 + 配置好的开发环境 + 第一次 Git 提交
🔗 前置钩子：无（起点）
🔗 后续钩子：L02 将在此项目基础上创建第一个 TodoItem 组件
```

> [!TIP]
> **本节较长（12 个章节），推荐学习路径：**
> - **必学：** §2 创建项目、§3 项目结构解析、§4 SFC 三段式、§5 script setup、§7 动手改造
> - **建议了解：** §1 Vite 原理、§8 HMR
> - **可跳过（后续需要时回查）：** §6 vite.config、§9 TypeScript 配置、§10 public vs assets、§11 npm scripts

---

## 1. 为什么选 Vite 而不是 Webpack

在写第一行代码之前，先理解我们为什么选 Vite 作为构建工具。

### 1.1 Webpack 的痛点

Webpack 在启动开发服务器时，需要**先打包整个应用**，再提供给浏览器：

```mermaid
flowchart LR
    subgraph Webpack["Webpack 启动流程"]
        entry["入口 main.js"] --> scan["扫描所有依赖\nimport 树"]
        scan --> bundle["打包成\nbundle.js"]
        bundle --> serve["启动 Dev Server\n提供 bundle"]
    end

    slow["❌ 项目越大\n启动越慢"]
    bundle --> slow

    style Webpack fill:#1a1a2e,color:#e0e0e0,stroke:#ff6347
    style slow fill:#ff634730,stroke:#ff6347,color:#ff6347
```

一个中型项目（200+ 模块）冷启动可能需要 **30 秒甚至更久**，热更新也经常需要 2-5 秒。

### 1.2 Vite 的解法：原生 ESM

Vite 利用浏览器原生支持的 ES Modules，**不打包、按需编译**：

```mermaid
flowchart LR
    subgraph Vite["Vite 启动流程"]
        start["启动 Dev Server\n< 300ms"] --> request["浏览器请求\n/src/App.vue"]
        request --> transform["Vite 即时编译\n这一个文件"]
        transform --> respond["返回编译后的\nES Module"]
    end

    fast["✅ 冷启动 < 1s\nHMR < 50ms"]
    respond --> fast

    style Vite fill:#1a1a2e,color:#e0e0e0,stroke:#42b883
    style fast fill:#42b88330,stroke:#42b883,color:#42b883
```

**核心区别：**

| 对比项 | Webpack | Vite |
|--------|---------|------|
| 启动方式 | 先打包，再提供服务 | 先启动服务，按需编译 |
| 冷启动 | 随项目增大线性变慢 | 几乎恒定 < 1s |
| 热更新 (HMR) | 2-5s（需重新打包受影响模块链） | < 50ms（只更新当前模块） |
| 底层 | Node.js（纯 JS） | esbuild（Go 语言，快 10-100x） |
| 生产构建 | webpack | Rollup（可选 esbuild） |

### 1.3 Vite 为什么能这么快

两个关键技术：

1. **预构建依赖（Pre-bundling）**：用 esbuild 把 `node_modules` 里的库（如 `vue`、`lodash`）预编译为 ESM 格式，只做一次
2. **按需编译源码**：你的 `.vue`、`.ts` 文件在**浏览器请求时才编译**，没请求的文件根本不处理

```mermaid
flowchart TB
    subgraph deps["依赖（node_modules）"]
        vue_pkg["vue"]
        router_pkg["vue-router"]
        pinia_pkg["pinia"]
    end

    subgraph source["源码（src/）"]
        app["App.vue"]
        comp1["ComponentA.vue"]
        comp2["ComponentB.vue"]
        comp3["ComponentC.vue\n（本次未访问）"]
    end

    esbuild["esbuild 预构建\n启动时一次性完成"]
    deps --> esbuild
    esbuild --> cache["缓存到\nnode_modules/.vite"]

    browser["浏览器"] -->|"请求 App.vue"| app
    app -->|"import"| comp1
    app -->|"import"| comp2
    comp3 -.-|"❌ 未请求\n不编译"| browser

    style deps fill:#35495e20,stroke:#35495e
    style source fill:#42b88320,stroke:#42b883
    style comp3 fill:#66666630,stroke:#666,stroke-dasharray: 5 5
```

---

## 2. 创建项目

### 2.1 初始化 Vue 3 项目

打开终端，执行：

```bash
npm create vue@latest
```

> `create-vue` 是 Vue 官方的脚手架工具，底层基于 Vite。

交互式选项推荐：

```
✔ Project name: … vue-todo
✔ Add TypeScript? … Yes
✔ Add JSX Support? … No
✔ Add Vue Router? … No          ← Phase 1 不需要路由
✔ Add Pinia? … No               ← Phase 1 不需要状态管理
✔ Add Vitest? … No              ← Phase 2 再加
✔ Add an End-to-End Testing Solution? … No
✔ Add ESLint for code quality? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Vue DevTools browser extension? … Yes
```

> **为什么现在不加 Router 和 Pinia？**
> Phase 1 是纯基础阶段。让你先理解组件、响应式和模板语法，不被额外概念干扰。Phase 2 用到时再手动安装，这样你会知道**每个依赖解决什么问题**。

安装依赖并启动：

```bash
cd vue-todo
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，看到 Vue 欢迎页就成功了。

### 2.2 初始化 Git

```bash
git init
git add .
git commit -m "L01: 项目初始化 - Vite + Vue 3 + TypeScript"
```

> **每节课结束都提交一次**，这样你可以随时回溯到任何阶段。

---

## 3. 项目结构解析

执行 `tree -I node_modules` 查看目录结构：

```
vue-todo/
├── public/                  # 静态资源（不经过 Vite 处理）
│   └── favicon.ico
├── src/                     # 源码目录（核心）
│   ├── assets/              # 需要 Vite 处理的资源（CSS、图片）
│   │   ├── base.css
│   │   └── main.css
│   ├── components/          # 组件目录
│   │   └── HelloWorld.vue
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── index.html               # HTML 入口（注意：在根目录，不在 public/）
├── env.d.ts                 # TypeScript 环境声明
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── package.json             # 依赖和脚本
└── .eslintrc.cjs            # ESLint 配置
```

```mermaid
flowchart TD
    subgraph Entry["入口层"]
        html["index.html\n浏览器入口"]
        main["src/main.ts\nVue 入口"]
    end

    subgraph App["应用层"]
        root["src/App.vue\n根组件"]
        components["src/components/\n子组件"]
    end

    subgraph Config["配置层"]
        vite["vite.config.ts"]
        ts["tsconfig.json"]
        eslint[".eslintrc.cjs"]
    end

    subgraph Static["资源层"]
        publicDir["public/\n原样复制"]
        assets["src/assets/\nVite 处理"]
    end

    html -->|"<script src='/src/main.ts'>"| main
    main -->|"createApp(App)"| root
    root -->|"<HelloWorld />"| components

    style Entry fill:#42b88330,stroke:#42b883
    style App fill:#35495e30,stroke:#35495e
    style Config fill:#f9a82530,stroke:#f9a825
    style Static fill:#764ba230,stroke:#764ba2
```

### 3.1 关键文件逐行解读

#### `index.html` — 浏览器入口

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- ⬆ Vue 将在这个 div 内渲染整个应用 -->

    <script type="module" src="/src/main.ts"></script>
    <!-- ⬆ type="module" 告诉浏览器用 ES Module 方式加载 -->
    <!-- ⬆ Vite 拦截这个请求，即时编译 main.ts -->
  </body>
</html>
```

> **注意：** `index.html` 在项目根目录，不在 `public/` 里。这是 Vite 和 Webpack 的一个不同点。Vite 把 `index.html` 当作"入口"（等同于 Webpack 的 `entry`），通过 HTML 里的 `<script>` 标签找到 JS 入口。

#### `src/main.ts` — Vue 应用入口

```typescript
import { createApp } from 'vue'    // 从 Vue 导入创建应用的工厂函数
import App from './App.vue'         // 导入根组件

import './assets/main.css'          // 导入全局样式

createApp(App)     // 创建 Vue 应用实例，App 是根组件
  .mount('#app')   // 挂载到 index.html 的 <div id="app">
```

**`createApp` 做了什么？**

```mermaid
sequenceDiagram
    participant main as main.ts
    participant createApp as createApp()
    participant instance as App 实例
    participant dom as DOM

    main->>createApp: createApp(App)
    createApp->>instance: 创建应用实例
    Note over instance: 此时组件还没渲染<br/>只是创建了配置容器

    main->>instance: .mount('#app')
    instance->>instance: 执行 App 的 setup()
    instance->>instance: 调用 render() 生成 VNode
    instance->>dom: patch() 将 VNode 渲染为真实 DOM
    Note over dom: 页面出现内容
```

#### `src/App.vue` — 根组件（SFC 单文件组件）

```vue
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>
</template>

<style scoped>
/* scoped: 样式只作用于当前组件 */
header {
  line-height: 1.5;
}
</style>
```

---

## 4. SFC 三段式结构

Vue 的单文件组件（Single File Component）由三部分组成：

```mermaid
flowchart TB
    subgraph SFC[".vue 单文件组件"]
        script["<b>&lt;script setup lang='ts'&gt;</b>\n组件逻辑\n响应式数据、函数、生命周期"]
        template["<b>&lt;template&gt;</b>\n组件模板\nHTML + Vue 指令"]
        style_block["<b>&lt;style scoped&gt;</b>\n组件样式\n支持 scoped 作用域隔离"]
    end

    script -->|"变量自动暴露给"| template
    template -->|"class/id 被"| style_block

    style SFC fill:#1a1a2e20,stroke:#42b883
    style script fill:#42b88320,stroke:#42b883
    style template fill:#35495e20,stroke:#35495e
    style style_block fill:#764ba220,stroke:#764ba2
```

### 4.1 为什么把 HTML/JS/CSS 放在同一个文件？

这是 Vue 最有争议也最精妙的设计。关键理解：

**"关注点分离" ≠ "文件类型分离"**

传统方式按文件类型分离（`.html` / `.js` / `.css`），但一个按钮的逻辑、模板和样式分散在三个文件里，改一个按钮要打开三个文件。

SFC 按**功能单元分离**——一个组件的所有相关代码放在一起：

```
❌ 按文件类型分离（改一个按钮 → 打开 3 个文件）
src/
├── templates/
│   └── button.html
├── scripts/
│   └── button.js
└── styles/
    └── button.css

✅ 按功能单元分离（改一个按钮 → 打开 1 个文件）
src/
└── components/
    └── Button.vue      ← template + script + style
```

---

## 5. `<script setup>` 语法糖

### 5.1 普通写法 vs `<script setup>`

**普通写法（Vue 3 也支持但不推荐）：**

```vue
<script lang="ts">
import { defineComponent, ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  components: {        // 手动注册组件
    HelloWorld
  },
  setup() {            // setup 函数
    const count = ref(0)
    function increment() {
      count.value++
    }
    return {           // 必须手动 return 暴露给模板
      count,
      increment
    }
  }
})
</script>
```

**`<script setup>` 语法糖（推荐）：**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

// 顶层变量自动暴露给模板，不需要 return
const count = ref(0)
function increment() {
  count.value++
}
// 导入的组件自动注册，不需要 components 选项
</script>
```

### 5.2 `<script setup>` 帮你省了什么

```mermaid
flowchart LR
    subgraph Without["不用 script setup"]
        w1["defineComponent()"] --> w2["components: { }"]
        w2 --> w3["setup() { }"]
        w3 --> w4["return { count, fn }"]
    end

    subgraph With["用 script setup"]
        s1["直接写逻辑"]
        s2["✅ 自动注册组件\n✅ 自动暴露变量\n✅ 更好的类型推断"]
    end

    Without -->|"编译器自动处理"| With

    style Without fill:#ff634720,stroke:#ff6347
    style With fill:#42b88320,stroke:#42b883
```

| 特性 | 普通 `<script>` | `<script setup>` |
|------|----------------|-------------------|
| 组件注册 | 手动在 `components` 中注册 | import 就自动注册 |
| 暴露给模板 | 必须在 `setup()` 中 `return` | 顶层变量自动暴露 |
| TypeScript 推断 | 需要 `defineComponent()` 包裹 | 天生完美推断 |
| 代码量 | 多 ~40% 样板代码 | 精简 |
| Props 声明 | `props` 选项 | `defineProps()` 宏 |
| Emits 声明 | `emits` 选项 | `defineEmits()` 宏 |

> **本教程全程使用 `<script setup>`**，这是 Vue 3 官方推荐的写法。

---

## 6. 了解 `vite.config.ts`

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),  // Vue SFC 支持：编译 .vue 文件
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
      // ⬆ 路径别名：@/components/xxx 等价于 src/components/xxx
    }
  }
})
```

**`@vitejs/plugin-vue` 做了什么：**

```mermaid
flowchart LR
    sfc[".vue 文件"] --> plugin["@vitejs/plugin-vue"]
    plugin --> script_out["<script> → JavaScript"]
    plugin --> template_out["<template> → render 函数"]
    plugin --> style_out["<style> → CSS（注入 scoped hash）"]

    style plugin fill:#42b88330,stroke:#42b883
```

它在 Vite 构建管线中注册了一个"转换器"，遇到 `.vue` 文件时，把三段式 SFC 拆分编译为浏览器可执行的 JS + CSS。

---

## 7. 动手：改造为 Todo 应用骨架

现在让我们把默认的 Hello World 改造为 Todo 应用的骨架。

### 7.1 清理默认文件

删除不需要的默认内容：

```bash
# 删除默认组件和资源
rm src/components/HelloWorld.vue
rm src/components/TheWelcome.vue
rm src/components/WelcomeItem.vue
rm -rf src/components/icons/
rm src/assets/logo.svg
```

### 7.2 替换 `src/App.vue`

```vue
<script setup lang="ts">
// 目前为空，L02 会在这里导入第一个组件
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>📝 Vue Todo</h1>
      <p class="subtitle">Phase 1 — 用 Vue 3 从零做一个 Todo App</p>
    </header>

    <main class="app-main">
      <p class="placeholder">🚧 Todo 列表将在 L02-L08 中逐步实现</p>
    </main>

    <footer class="app-footer">
      <p>Built with Vue 3 + Vite + TypeScript</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 2rem;
  color: #42b883;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #888;
  font-size: 0.9rem;
}

.app-main {
  flex: 1;
}

.placeholder {
  text-align: center;
  padding: 3rem;
  background: #f6f8fa;
  border-radius: 12px;
  color: #666;
  border: 2px dashed #e0e0e0;
}

.app-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  color: #aaa;
  font-size: 0.8rem;
}
</style>
```

### 7.3 替换 `src/assets/main.css`

```css
/* 全局基础样式 */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

> 你可以删除 `src/assets/base.css`，因为我们用自己的全局样式。

### 7.4 确认效果

```bash
npm run dev
```

浏览器应该显示一个简洁的页面：标题 "📝 Vue Todo" + 一个占位框。

---

## 8. 理解热更新（HMR）

现在试一下：**不关闭浏览器**，修改 `App.vue` 里的标题文字。

```vue
<h1>📝 Vue Todo</h1>
<!-- 改为 -->
<h1>✅ My Todo App</h1>
```

保存文件，浏览器**瞬间更新**，没有整页刷新，表单状态也不会丢失。

这就是 HMR（Hot Module Replacement）：

```mermaid
sequenceDiagram
    participant Editor as VS Code
    participant Vite as Vite Dev Server
    participant Browser as 浏览器

    Editor->>Vite: 文件保存（App.vue 修改）
    Vite->>Vite: 重新编译 App.vue（< 10ms）
    Vite->>Browser: 通过 WebSocket 推送更新
    Browser->>Browser: 替换 App 模块<br/>保留组件状态
    Note over Browser: 页面无刷新更新<br/>表单输入不丢失
```

**与整页刷新的区别：**
- **整页刷新**：重新加载 HTML → 重新执行所有 JS → 所有状态归零
- **HMR**：只替换变化的模块 → 其他模块状态保留 → 开发体验极佳

---

## 9. TypeScript 配置简析

打开 `tsconfig.json`，几个关键配置：

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",           // 编译目标：现代浏览器
    "module": "ESNext",           // 模块系统：ES Modules
    "moduleResolution": "bundler", // 模块解析：让 Vite 处理
    "strict": true,               // 严格模式：推荐开启
    "jsx": "preserve",            // JSX：保留，交给 Vue 编译器
    "paths": {                    // 路径别名：与 vite.config.ts 保持一致
      "@/*": ["./src/*"]
    }
  }
}
```

> **`strict: true` 很重要。** 它开启了 TypeScript 的所有严格检查，虽然写代码时可能会多一些类型标注，但能在编译时就捕获大量 bug。

---

## 10. `public/` vs `src/assets/` 的区别

| | `public/` | `src/assets/` |
|--|-----------|---------------|
| 处理方式 | 原样复制到构建输出 | 被 Vite 处理（哈希、压缩等） |
| 引用方式 | 绝对路径 `/logo.png` | `import logo from '@/assets/logo.png'` |
| 文件名 | 构建后名字不变 | 构建后加哈希 `logo.a1b2c3.png` |
| 适合存放 | `favicon.ico`、`robots.txt` | 图片、字体、CSS |
| 缓存控制 | 需手动管理 | 自动长期缓存（哈希变则 URL 变） |

```mermaid
flowchart LR
    subgraph Public["public/favicon.ico"]
        p1["原样复制"]
        p2["URL: /favicon.ico"]
        p3["无哈希，无压缩"]
    end

    subgraph Assets["src/assets/logo.png"]
        a1["Vite 处理"]
        a2["URL: /assets/logo.a1b2c3.png"]
        a3["压缩 + 哈希 + 长期缓存"]
    end

    style Public fill:#f9a82520,stroke:#f9a825
    style Assets fill:#42b88320,stroke:#42b883
```

**经验法则：** 除了 `favicon.ico` 和 `robots.txt`，所有资源都放 `src/assets/`。

---

## 11. npm scripts 解读

打开 `package.json` 的 `scripts` 部分：

```json
{
  "scripts": {
    "dev": "vite",                    // 启动开发服务器
    "build": "run-p type-check \"build-only {@}\" --",  // 类型检查 + 构建
    "preview": "vite preview",        // 预览构建产物
    "build-only": "vite build",       // 只构建，不类型检查
    "type-check": "vue-tsc --build",  // TypeScript 类型检查
    "lint": "eslint . --fix"          // ESLint 检查 + 自动修复
  }
}
```

| 命令 | 用途 | 什么时候用 |
|------|------|-----------|
| `npm run dev` | 启动开发服务器 | 日常开发 |
| `npm run build` | 生产构建 | 部署前 |
| `npm run preview` | 预览生产构建 | 部署前验证 |
| `npm run lint` | 代码风格检查 | 提交前 |

---

## 12. 本节总结

### 知识清单

```mermaid
flowchart TB
    subgraph Learned["L01 知识图谱"]
        vite["Vite\n为什么快\nESM + esbuild"]
        project["项目结构\n每个文件的作用"]
        sfc["SFC 三段式\nscript + template + style"]
        setup["script setup\n语法糖的本质"]
        hmr["HMR 热更新\n开发体验"]
        ts["TypeScript\n配置与意义"]
    end

    vite --> project --> sfc --> setup
    project --> hmr
    project --> ts

    style Learned fill:#42b88310,stroke:#42b883
```


### 🔬 深度专题

> 📖 [D01 · Options API vs Composition API](/lessons/deep-dives/D01-options-vs-composition) — 为什么本教程全程使用 Composition API？

### 检查清单

- [ ] 能用 `npm create vue@latest` 创建项目
- [ ] 能解释 Vite 比 Webpack 快的原因
- [ ] 能说出 `index.html → main.ts → App.vue` 的加载链
- [ ] 能解释 SFC 三段式结构的每个部分
- [ ] 能解释 `<script setup>` 相比普通 `<script>` 省了什么
- [ ] 能区分 `public/` 和 `src/assets/` 的用途
- [ ] 项目已完成第一次 `git commit`

### 课后练习

**练习 1：跟做（10 min）**
完整跟做本节内容：创建项目 → 清理默认文件 → 替换 App.vue → 启动确认。

**练习 2：举一反三（15 min）**
给 `main.css` 增加一套 CSS 变量（`--color-primary`、`--color-bg`、`--color-text`），在 `App.vue` 中使用这些变量。思考：为什么用 CSS 变量比硬编码颜色值更好？

**挑战题（20 min）**
在 `vite.config.ts` 中配置第二个路径别名 `@components` → `src/components`，确认在 `.vue` 文件中 `import from '@components/xxx'` 可以正常工作。同时需要同步修改 `tsconfig.json` 的 `paths`。

### Git 提交

```bash
git add .
git commit -m "L01: 清理默认文件，搭建 Todo App 骨架"
```

---

## 🔗 钩子连接

### → 下一节：L02 · 第一个组件：TodoItem

L02 将在当前项目基础上：
1. 在 `src/components/` 创建 `TodoItem.vue` 组件
2. 学习 `defineProps()` 定义组件接口
3. 理解 **Props 单向数据流** 原则
4. 在 `App.vue` 中引入并渲染 TodoItem

**L02 会用到这节课的：**
- 项目结构（知道在哪创建组件）
- `<script setup>`（知道 import 即自动注册）
- SFC 三段式（知道如何组织组件代码）
