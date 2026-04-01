# D10 · Suspense 的局限性

> **对应主课：** L15 异步组件 + Suspense
> **适用版本：** Vue 3.4+
> **当前状态：** Experimental
> **最后核对：** 2026-04-01

---

## 1. Suspense 是什么

Suspense 是 Vue 3 的内置组件，用于协调异步组件的加载状态：

```vue
<Suspense>
  <template #default>
    <AsyncDashboard />   <!-- 有 async setup 的组件 -->
  </template>
  <template #fallback>
    <LoadingSpinner />   <!-- 加载中显示 -->
  </template>
</Suspense>
```

---

## 2. 当前局限性

### 2.1 仍是实验性功能

截至 Vue 3.4，Suspense 仍标记为 **experimental**。API 可能变化。

```
⚠️ <Suspense> is an experimental feature and its API will likely change.
```

### 2.2 错误边界不完善

```vue
<!-- 异步组件抛错时，没有内置的错误边界 UI -->
<Suspense>
  <template #default>
    <AsyncComp />  <!-- 如果这里抛错呢？ -->
  </template>
  <template #fallback>
    <Loading />
  </template>
  <!-- 没有 #error 插槽！ -->
</Suspense>
```

**解决方案：** 用 `onErrorCaptured` 手动处理：

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false  // 阻止错误冒泡
})
</script>

<template>
  <div v-if="error" class="error">{{ error.message }}</div>
  <Suspense v-else>
    <template #default><AsyncComp /></template>
    <template #fallback><Loading /></template>
  </Suspense>
</template>
```

### 2.3 嵌套 Suspense 行为复杂

```vue
<!-- 外层 Suspense -->
<Suspense>
  <ParentAsync>
    <!-- 内层 Suspense -->
    <Suspense>
      <ChildAsync />
    </Suspense>
  </ParentAsync>
</Suspense>

<!-- 问题：
  - 外层等待 ParentAsync 解析完才显示
  - 内层等待 ChildAsync 解析完才显示
  - 两者的加载状态如何协调？
  - 如果 ParentAsync 先完成但 ChildAsync 还没完成？
-->
```

### 2.4 不支持数据更新的 pending 状态

Suspense 只处理**首次加载**。数据更新时的 loading 状态需要自己管理：

```vue
<script setup>
// 首次加载 Suspense 会处理
const data = await fetchInitialData()

// 后续更新 Suspense 不管了
const { loading, execute } = useRequest(fetchData)
</script>
```

### 2.5 与 Transition 配合有限

```vue
<!-- 理想效果：加载完成时有过渡动画 -->
<Suspense>
  <Transition name="fade">
    <AsyncComp />
  </Transition>
</Suspense>
<!-- 实际表现可能不符合预期 -->
```

---

## 3. 替代方案

| 需求 | Suspense | 替代方案 |
|------|---------|---------|
| 首次加载状态 | ✅ | `useRequest` + v-if |
| 数据更新 loading | ❌ | `useRequest` composable |
| 错误处理 | ❌ 需手动 | `onErrorCaptured` 或 composable |
| 骨架屏 | ✅ fallback | CSS skeleton |
| 服务端数据 | ✅ + SSR | Nuxt `useAsyncData` |

---

## 4. 推荐实践

```typescript
// 实际项目中更推荐 composable 方式
function useAsyncData<T>(fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  execute()
  return { data, loading, error, refresh: execute }
}

// 使用
const { data, loading, error } = useAsyncData(() => api.getProducts())
```

## 5. 常见问题与 Workaround

### 问题 1：Suspense 不支持 retry

```typescript
// Suspense 本身没有 retry 机制，需要手动实现
const retryCount = ref(0)
const key = computed(() => `${route.path}-${retryCount.value}`)

function retry() {
  retryCount.value++  // 改变 key → 重新渲染组件 → 重新触发 async setup
}
```

```vue
<template>
  <Suspense>
    <AsyncComponent :key="key" />
    <template #fallback>加载中...</template>
  </Suspense>
  <button v-if="hasError" @click="retry">重试</button>
</template>
```

### 问题 2：多个异步组件的加载顺序

```vue
<!-- ❌ 所有子组件都 resolve 后才显示，最慢的拖累全部 -->
<Suspense>
  <div>
    <FastComponent />   <!-- 100ms -->
    <SlowComponent />   <!-- 5000ms -->
  </div>
</Suspense>

<!-- ✅ 各自包裹，独立加载 -->
<Suspense>
  <FastComponent />
  <template #fallback>快组件加载中...</template>
</Suspense>
<Suspense>
  <SlowComponent />
  <template #fallback>慢组件加载中...</template>
</Suspense>
```

---

## 6. 决策表：Suspense vs useAsyncData

| 需求 | Suspense | useAsyncData composable |
|------|----------|------------------------|
| 简单异步组件加载 | ✅ 适合 | ✅ 也行 |
| 加载状态 UI | ✅ `#fallback` 插槽 | ✅ `loading` ref |
| 错误处理 | ⚠️ 需要 `onErrorCaptured` | ✅ `error` ref |
| 请求重试 | ❌ 手动实现 key 刷新 | ✅ `refresh()` / `retry()` |
| 分页/筛选 | ❌ 不适合 | ✅ watch + re-fetch |
| SSR 数据获取 | ✅ Nuxt `useAsyncData` | ✅ 同 |
| 取消请求 | ❌ 不支持 | ✅ AbortController |

**建议：** Suspense 用于路由级的初始加载；数据获取用 composable 更灵活。

---

## 7. 总结

- Suspense 适合简单的异步组件加载场景
- 复杂场景（错误处理、数据更新、嵌套组件）需要额外处理
- 生产环境建议用 `useRequest` / `useAsyncData` composable 作为补充
- 多个异步组件建议各自包裹 Suspense，避免"最慢拖累全部"
- 关注 Vue 后续版本对 Suspense 的完善
