---
alwaysApply: true
scene: git_message
---

**格式模板：**
```
<类型>(<scope>): <修改综述>

- <具体修改点> [<point_scope>]
- ...
```

**说明：**
- `<类型>`：必填，取值 `feat|fix|refactor|docs|style|perf|test|chore`
- `<scope>`：可选，表示本次修改的影响范围（如 `api`、`config`、`ui`）
- `<修改综述>`：必填，中文一句话概括，不超过30字
- `<具体修改点>`：中文短句，每点一条
- `[<point_scope>]`：可选，表示该条修改的具体作用范围（如 `backend`、`frontend`、`db`），放在方括号内，紧接句尾

**要求：**
1. 综述与各分点均用中文
2. 分点以 `-` 开头，空格后写内容
3. 分点之间不空行
4. 保持简洁，无多余解释

**示例：**
```
feat(auth): 增加短信验证码登录功能

- 添加验证码发送接口 [api]
- 集成阿里云短信服务 [service]
- 增加验证码校验逻辑 [backend]
```
