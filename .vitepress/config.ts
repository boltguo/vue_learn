import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'Vue 3 学习体系',
  description: '项目驱动的 Vue 3 全栈学习教程',
  lang: 'zh-CN',

  mermaid: {},

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '课程',
        items: [
          { text: 'Phase 1 · Todo App', link: '/lessons/phase-1/L01-project-setup' },
          { text: 'Phase 2 · 任务管理系统', link: '/lessons/phase-2/L09-architecture' },
          { text: 'Phase 3 · 全栈电商', link: '/lessons/phase-3/L19-backend-setup' },
          { text: 'Phase 4 · Vue 3 原理', link: '/lessons/phase-4/L31-proxy-reactivity' },
        ]
      },
      { text: '深度专题', link: '/lessons/deep-dives/D01-options-vs-composition' },
    ],

    sidebar: {
      '/lessons/phase-1/': [
        {
          text: 'Phase 1 · Todo App（基础篇）',
          items: [
            { text: 'L01 · 项目脚手架 + 开发环境', link: '/lessons/phase-1/L01-project-setup' },
            { text: 'L02 · 第一个组件：TodoItem', link: '/lessons/phase-1/L02-first-component' },
            { text: 'L03 · 响应式数据', link: '/lessons/phase-1/L03-reactivity' },
            { text: 'L04 · 列表渲染：v-for 与 key', link: '/lessons/phase-1/L04-list-rendering' },
            { text: 'L05 · 条件渲染与事件', link: '/lessons/phase-1/L05-conditionals-events' },
            { text: 'L06 · 表单与 v-model', link: '/lessons/phase-1/L06-v-model' },
            { text: 'L07 · computed 与 watch', link: '/lessons/phase-1/L07-computed-watch' },
            { text: 'L08 · localStorage + Composable', link: '/lessons/phase-1/L08-localstorage-composable' },
          ]
        }
      ],
      '/lessons/phase-2/': [
        {
          text: 'Phase 2 · 任务管理系统（工程篇）',
          items: [
            { text: 'L09 · 架构升级', link: '/lessons/phase-2/L09-architecture' },
            { text: 'L10 · Vue Router', link: '/lessons/phase-2/L10-vue-router' },
            { text: 'L11 · Pinia 状态管理', link: '/lessons/phase-2/L11-pinia' },
            { text: 'L12 · 任务分类与标签', link: '/lessons/phase-2/L12-categories-tags' },
            { text: 'L13 · 拖拽排序', link: '/lessons/phase-2/L13-drag-drop' },
            { text: 'L14 · 组件通信全景', link: '/lessons/phase-2/L14-component-communication' },
            { text: 'L15 · 异步组件与 Suspense', link: '/lessons/phase-2/L15-async-suspense' },
            { text: 'L16 · 自定义指令 + 主题', link: '/lessons/phase-2/L16-directives-theme' },
            { text: 'L17 · 单元测试', link: '/lessons/phase-2/L17-testing' },
            { text: 'L18 · 部署上线 CI/CD', link: '/lessons/phase-2/L18-deployment' },
          ]
        }
      ],
      '/lessons/phase-3/': [
        {
          text: 'Phase 3 · 全栈电商（实战篇）',
          items: [
            { text: 'L19 · Express + MongoDB', link: '/lessons/phase-3/L19-backend-setup' },
            { text: 'L20 · RESTful API', link: '/lessons/phase-3/L20-restful-api' },
            { text: 'L21 · Axios 封装', link: '/lessons/phase-3/L21-axios' },
            { text: 'L22 · JWT 认证', link: '/lessons/phase-3/L22-jwt-auth' },
            { text: 'L23 · 商品列表', link: '/lessons/phase-3/L23-product-list' },
            { text: 'L24 · 购物车', link: '/lessons/phase-3/L24-cart' },
            { text: 'L25 · 订单系统', link: '/lessons/phase-3/L25-order-system' },
            { text: 'L26 · 支付模拟', link: '/lessons/phase-3/L26-payment' },
            { text: 'L27 · 文件上传', link: '/lessons/phase-3/L27-file-upload' },
            { text: 'L28 · WebSocket 实时通知', link: '/lessons/phase-3/L28-websocket' },
            { text: 'L29 · SSR 与 Nuxt', link: '/lessons/phase-3/L29-ssr-nuxt' },
            { text: 'L30 · 性能优化 + E2E', link: '/lessons/phase-3/L30-performance-e2e' },
          ]
        }
      ],
      '/lessons/phase-4/': [
        {
          text: 'Phase 4 · Vue 3 原理（深潜篇）',
          items: [
            { text: 'L31 · Proxy 响应式原理', link: '/lessons/phase-4/L31-proxy-reactivity' },
            { text: 'L32 · 依赖追踪', link: '/lessons/phase-4/L32-dependency-tracking' },
            { text: 'L33 · Virtual DOM Diff', link: '/lessons/phase-4/L33-virtual-dom' },
            { text: 'L34 · 编译器优化', link: '/lessons/phase-4/L34-compiler-optimization' },
            { text: 'L35 · 调度器与 nextTick', link: '/lessons/phase-4/L35-scheduler-nexttick' },
            { text: 'L36 · 组件渲染流程', link: '/lessons/phase-4/L36-component-rendering' },
            { text: 'L37 · Composition API 哲学', link: '/lessons/phase-4/L37-composition-api-philosophy' },
            { text: 'L38 · Vapor Mode', link: '/lessons/phase-4/L38-vapor-mode' },
          ]
        }
      ],
      '/lessons/deep-dives/': [
        {
          text: '深度专题',
          items: [
            { text: 'D01 · Options vs Composition', link: '/lessons/deep-dives/D01-options-vs-composition' },
            { text: 'D02 · 调度器与 nextTick', link: '/lessons/deep-dives/D02-scheduler-nexttick' },
            { text: 'D03 · Proxy vs defineProperty', link: '/lessons/deep-dives/D03-proxy-vs-defineproperty' },
            { text: 'D04 · 编译优化 PatchFlag', link: '/lessons/deep-dives/D04-compile-optimization' },
            { text: 'D05 · ref vs reactive', link: '/lessons/deep-dives/D05-ref-vs-reactive' },
            { text: 'D06 · effect/track/trigger', link: '/lessons/deep-dives/D06-effect-track-trigger' },
            { text: 'D07 · 单向数据流 vs v-model', link: '/lessons/deep-dives/D07-one-way-vs-vmodel' },
            { text: 'D08 · Pinia vs Vuex', link: '/lessons/deep-dives/D08-pinia-vs-vuex' },
            { text: 'D09 · Composables vs Hooks', link: '/lessons/deep-dives/D09-composables-vs-hooks' },
            { text: 'D10 · Suspense 的局限性', link: '/lessons/deep-dives/D10-suspense-limitations' },
            { text: 'D11 · Diff 算法深入', link: '/lessons/deep-dives/D11-diff-algorithm' },
            { text: 'D12 · 闭包陷阱', link: '/lessons/deep-dives/D12-closure-traps' },
            { text: 'D13 · 竞态条件', link: '/lessons/deep-dives/D13-race-conditions' },
            { text: 'D14 · JWT vs Session', link: '/lessons/deep-dives/D14-jwt-vs-session' },
            { text: 'D15 · Vapor Mode', link: '/lessons/deep-dives/D15-vapor-mode' },
          ]
        }
      ],
    },

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除搜索条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    docFooter: {
      prev: '上一节',
      next: '下一节'
    },

    lastUpdated: {
      text: '最后更新'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/boltguo/vue_learn' }
    ],
  }
}))
