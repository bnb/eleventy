const config = require("./Config");

class TemplateEngineManager {
  constructor() {
    this.engineCache = {};
  }

  get config() {
    if (!this._config) {
      this._config = config.getConfig();
    }
    return this._config;
  }

  set config(cfg) {
    this._config = cfg;
  }

  get keyToClassNameMap() {
    if (!this._keyToClassNameMap) {
      this._keyToClassNameMap = {
        ejs: "Ejs",
        md: "Markdown",
        jstl: "JavaScriptTemplateLiteral",
        html: "Html",
        hbs: "Handlebars",
        mustache: "Mustache",
        haml: "Haml",
        pug: "Pug",
        njk: "Nunjucks",
        liquid: "Liquid",
        "11ty.js": "JavaScript",
      };

      if ("extensionMap" in this.config) {
        for (let entry of this.config.extensionMap) {
          this._keyToClassNameMap[entry.key] = "Custom";
        }
      }
    }
    return this._keyToClassNameMap;
  }

  getClassNameFromTemplateKey(key) {
    let keys = this.keyToClassNameMap;

    return keys[key];
  }

  hasEngine(name) {
    return !!this.getClassNameFromTemplateKey(name);
  }

  getEngine(name, includesDir, extensionMap) {
    if (!this.hasEngine(name)) {
      throw new Error(
        `Template Engine ${name} does not exist in getEngine (includes dir: ${includesDir})`
      );
    }

    if (this.engineCache[name]) {
      return this.engineCache[name];
    }

    let path = "./Engines/" + this.getClassNameFromTemplateKey(name);
    const cls = require(path);
    let instance = new cls(name, includesDir);
    instance.extensionMap = extensionMap;
    instance.config = this.config;
    instance.engineManager = this;

    // Make sure cache key is based on name and not path
    // Custom class is used for all plugins, cache once per plugin
    this.engineCache[name] = instance;
    return instance;
  }
}

module.exports = TemplateEngineManager;
