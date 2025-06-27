# vue2-user-habit

📦 **Vue 2 Plugin: Automatically manage persistent user preferences**

[🇨🇳 简体中文文档](./README.zh-CN.md) | [🌐 English Doc](./README.en-US.md)

---

## ✨ Features

- 🔁 Automatically load and save user preferences (e.g., pagination, filters, chart settings)
- ⚙️ Fully configurable: custom field name, unique ID, context, debounce delay
- 💾 Flexible caching strategy: `localStorage` by default, supports backend APIs
- 🧩 Vue Mixin based integration, easy to use and non-intrusive
- 🚀 `queryAll` support for preload and performance boost

---

## 📦 Installation

```bash
npm install vue2-user-habit lodash
```

---

## 🚀 Quick Start

### 1. Initialize habitManager (default to localStorage strategy)

```js
import { UserHabitManager, createHabitPlugin } from "vue2-user-habit";

const habitManager = new UserHabitManager();

Vue.use(createHabitPlugin(habitManager));
```

> Data is stored in `localStorage` with key format `vue-user-habit:{tag}`.

---

### 2. Custom strategy (connect to backend APIs)

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

> `queryAll()` results are deduplicated and cached. `get()` uses cache first if available.

---

### 3. Use in Vue Component

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

## 📘 Config Fields (`__habit`)

| Field Name      | Type   | Default        | Description                |
| --------------- | ------ | -------------- | -------------------------- |
| `id`            | string | Component name | Unique habit ID            |
| `path`          | string | -              | Optional extra path key    |
| `field`         | string | `habitPrefs`   | Data binding field name    |
| `context`       | object | `{}`           | Context passed to strategy |
| `debounceDelay` | number | `2000`         | Debounce delay in ms       |

---

## 🧠 Strategy Interface

```ts
interface HabitStrategy {
  queryOne: (context) => Promise<{ [cacheKey]: string; data: object }>;
  update: (context, data) => Promise<any>;
  create: (context, data) => Promise<any>;
  queryAll: (identity) => Promise<Array<{ [cacheKey]: string; data: object }>>;
}
```

---

## 💡 Caching Behavior

- `habitManager.get()` uses internal memory cache first (from `queryAll`)
- If no cache, it falls back to `queryOne()`
- `set()` will decide `update` or `create` based on `cacheKey` presence

---

## 📎 Tips

- Habit data fields (e.g., `prefs`) must be initialized as an object in `data()`
- Use `this.__habitReady` to wait for preference loading
- Automatically save on page exit in `beforeDestroy`; you can also manually trigger saving using `this.__saveHabitDebounced()`

---

## 📄 License

[MIT](./LICENSE)

---

✨ Star, issue or PR are welcome — help make `vue2-user-habit` better!
