# vue2-user-habit

📦 **Vue 2 插件：自动管理用户习惯配置（持久化偏好设置）**

[🌐 English Doc](./README.en-US.md) | [📘 返回英文主文档](./README.md)

---

## ✨ 特性

- 🔁 自动读取并保存用户在页面上的操作偏好（如分页、筛选、图表设置等）
- ⚙️ 灵活配置：字段名、唯一标识、上下文参数、节流延迟皆可定制
- 💾 支持缓存策略（默认 `localStorage`，也支持自定义后端接口）
- 🧩 插件采用 Mixin 方式接入，零侵入、使用简单
- 🚀 提供 `queryAll` 初始化预加载能力，提升加载性能

---

## 📦 安装

```bash
npm install vue2-user-habit lodash
```

---

## 🚀 快速开始

### 1. 初始化 habitManager（默认使用 localStorage 策略）

```js
import { UserHabitManager, createHabitPlugin } from "vue2-user-habit";

const habitManager = new UserHabitManager();

Vue.use(createHabitPlugin(habitManager));
```

> 默认策略下，数据将以 `vue-user-habit:{tag}` 键名存储在浏览器 localStorage 中。

---

### 2. 自定义策略（对接后端接口）

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

> `queryAll()` 的结果将会进行去重并缓存在内存中，`get()` 会优先使用缓存，减少接口请求。

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

## 📘 插件配置字段（`__habit`）

| 字段名          | 类型   | 默认值       | 说明                 |
| --------------- | ------ | ------------ | -------------------- |
| `id`            | string | 组件名       | 唯一标识 ID          |
| `path`          | string | -            | 附加路径（用于区分） |
| `field`         | string | `habitPrefs` | 数据字段名           |
| `context`       | object | `{}`         | 附加上下文参数       |
| `debounceDelay` | number | `2000`       | 防抖延迟（毫秒）     |

---

## 🧠 策略接口定义

```ts
interface HabitStrategy {
  queryOne: (context) => Promise<{ [cacheKey]: string; data: object }>;
  update: (context, data) => Promise<any>;
  create: (context, data) => Promise<any>;
  queryAll: (identity) => Promise<Array<{ [cacheKey]: string; data: object }>>;
}
```

---

## 💡 缓存机制说明

- `habitManager.get()` 会优先读取缓存（若调用过 `queryAll`）
- 若无缓存，则调用 `queryOne()` 请求数据
- `set()` 方法根据配置的 `cacheKey` 判断是更新还是创建

---

## 📎 使用建议

- 偏好数据字段（如 `prefs`）必须在 `data()` 中初始化为对象
- 可使用 `this.__habitReady` 等待数据加载完成
- 使用 `this.__saveHabitDebounced()` 手动触发保存

---

## 📄 License

[MIT](./LICENSE)

---

✨ 欢迎 Star、Issue 和 PR，一起完善 vue2-user-habit！
