# vue2-user-habit

📦 **Vue 2 插件：自动管理用户习惯配置（持久化偏好设置）**

---

## ✨ 特性

- 🔁 自动读取并保存用户在页面上的操作偏好（如分页、筛选、图表设置）
- 🔧 支持配置字段名、唯一标识、自定义上下文参数
- 🧩 插件封装简单易接入，基于 Vue Mixin
- 📦 支持本地缓存（`localStorage`）或后端接口接入
- 🛠 灵活策略：可由开发者提供 `queryOne/create/update/queryAll` 方法；默认使用浏览器本地存储

---

## 📦 安装

```bash
npm install vue-user-habit lodash
```

---

## 🚀 使用

### 1. 初始化 habitManager（默认使用 localStorage）

```js
import { UserHabitManager, createHabitPlugin } from "vue-user-habit";

const habitManager = new UserHabitManager();

Vue.use(createHabitPlugin(habitManager));
```

### ✅ 使用 localStorage 策略说明

- 默认使用 `window.localStorage`，键名为 `vue-user-habit:{tag}`
- 数据自动读取、保存，无需接口依赖

---

### 2. 自定义策略示例（连接后端接口）

```js
const habitManager = new UserHabitManager({
  strategies: {
    async queryOne(ctx) {
      return await api.fetchUserPrefs(ctx.tag);
    },
    async update(ctx, data) {
      return await api.updateUserPrefs(ctx.tag, data);
    },
    async create(ctx, data) {
      return await api.createUserPrefs(ctx.tag, data);
    },
    async queryAll(identity) {
      return await api.fetchAllUserPrefs(identity);
    },
  },
  cacheKey: "key",
});
```

---

### 3. 在组件中使用

```js
export default {
  name: "UserListPage",
  __habit: {
    id: "user-list",
    path: "tab1",
    field: "prefs",
    debounceDelay: 1000,
    context: {
      userId: "abc123",
    },
  },
  data() {
    return {
      prefs: { pageSize: 20, filter: {} },
    };
  },
  methods: {
    onFilterChanged() {
      this.__saveHabitDebounced?.();
    },
  },
};
```

---

## 📘 插件字段说明

| 字段名          | 类型   | 说明                                    |
| --------------- | ------ | --------------------------------------- |
| `id`            | string | 唯一 ID，默认使用组件名                 |
| `path`          | string | 附加路径标识，用于更细粒度区分          |
| `field`         | string | 存储偏好数据的字段名，默认 `habitPrefs` |
| `context`       | object | 传入给策略函数的额外上下文参数          |
| `debounceDelay` | number | 自动保存延迟，默认 2000ms               |

---

## 🧠 策略函数说明

```ts
interface HabitStrategy {
  queryOne: (context) => Promise<{ id?: string; data: object; key: string }>;
  update: (context, data) => Promise<any>;
  create: (context, data) => Promise<any>;
  queryAll: (
    identity
  ) => Promise<Array<{ id?: string; data: object; key: string }>>;
}
```

---

## 📎 注意事项

- `prefs`（或其他字段名）必须在 `data()` 中初始化为对象。
- `created` 会合并 habit 数据；`beforeDestroy` 会自动保存。
- 可通过 `this.__habitReady` 等待 habit 加载完成。
- 可调用 `this.__saveHabitDebounced()` 主动触发保存。
- 默认使用 localStorage，如需接入接口请传入 `strategies`

---

## 📄 License

[MIT](./LICENSE)
