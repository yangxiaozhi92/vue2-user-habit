import debounce from "lodash/debounce";

class DefaultLocalStorageStrategy {
  constructor(storageKeyPrefix = "vue-user-habit:") {
    this.storageKeyPrefix = storageKeyPrefix;
  }

  _getKey(tag) {
    return `${this.storageKeyPrefix}${tag}`;
  }

  async queryOne(context) {
    const key = this._getKey(context.tag);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return {
        key: context.tag,
        data: JSON.parse(raw),
      };
    } catch {
      return null;
    }
  }

  async update(context, data) {
    const key = this._getKey(context.tag);
    window.localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  }

  async create(context, data) {
    return this.update(context, data);
  }

  async queryAll(identity) {
    return [];
  }
}

export class UserHabitManager {
  constructor({ strategies, cacheKey = "key" } = {}) {
    this.cache = {};
    this.cacheKey = cacheKey;
    this.strategies = strategies || new DefaultLocalStorageStrategy();
  }

  async get(context) {
    const tag = context.tag;
    let data = {};
    if (this.cache[tag]) {
      data = this.cache[tag].data;
    } else {
      const res = await this.strategies.queryOne?.(context);
      data = res?.data || {};
      if (res) this.cache[tag] = res;
    }

    return { ...data };
  }

  async set(context, prefs = {}) {
    const last = this.cache[context.tag];

    if (last && JSON.stringify(last.data) === JSON.stringify(prefs)) return;

    if (last) {
      this.cache[context.tag].data = { ...prefs };
      return this.strategies.update?.(context, prefs, last);
    } else {
      return this.strategies.create?.(context, prefs);
    }
  }

  async queryAllUserHabits(identity) {
    const list = (await this.strategies.queryAll?.(identity)) || [];
    const _ = await import("lodash");
    const uniqueList = _.uniqBy(list, this.cacheKey);
    const habitMap = _.keyBy(uniqueList, this.cacheKey);
    this.cache = { ...this.cache, ...habitMap };
  }

  clearTagCache(tag) {
    delete this.cache[tag];
  }

  clearAll() {
    this.cache = {};
  }
}

export function createHabitPlugin(habitManagerInstance) {
  return {
    install(Vue) {
      Vue.mixin({
        beforeCreate() {
          const comp = this.$options;
          const habitDecl = comp.__habit;
          if (!habitDecl) return;

          const config =
            typeof habitDecl === "function"
              ? habitDecl.call(this, this)
              : habitDecl;

          const {
            enabled = true,
            id,
            path,
            field = "habitPrefs",
            context = {},
            debounceDelay = 2000,
          } = config;

          if (!enabled) return;

          const compId = id || this.$options.name || "anonymous-component";
          let tag = compId;
          if (path) tag += `/${path}`;

          this.__habitField = field;
          this.__habitContext = { tag, ...context };

          this.__habitReady = new Promise((resolve) => {
            this.__resolveHabitReady = resolve;
          });

          this.__saveHabitDebounced = debounce(() => {
            if (this.__habitEnabled && this[field]) {
              habitManagerInstance.set(this.__habitContext, this[field]);
            }
          }, debounceDelay);

          this.__habitEnabled = true;
        },

        async created() {
          if (!this.__habitEnabled) return;
          const field = this.__habitField;
          const res = await habitManagerInstance.get(this.__habitContext);

          if (res) {
            this[field] = { ...(this[field] || {}), ...res };
          }
          this.__resolveHabitReady?.();
        },

        beforeDestroy() {
          if (!this.__habitEnabled) return;
          const field = this.__habitField;
          habitManagerInstance.set(this.__habitContext, this[field]);
        },
      });
    },
  };
}
