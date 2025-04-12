const fs = require("fs");
const path = require("path");
const os = require("os");

const DEFAULT_CONFIG = {
  environments: [
    {
      name: "dev",
      branch: "develop",
      isProduction: false,
    },
    {
      name: "qa",
      branch: "qa",
      isProduction: false,
    },
    {
      name: "staging",
      branch: "staging",
      isProduction: false,
    },
    {
      name: "prod",
      branch: "main",
      isProduction: true,
    },
  ],
};

class ConfigManager {
  constructor() {
    this.configPath = path.join(process.cwd(), ".tag-manager.json");
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        return this.validateConfig(config) ? config : DEFAULT_CONFIG;
      }
      return null; // Return null when no config file exists
    } catch (error) {
      console.error("Error loading config:", error.message);
      return null;
    }
  }

  saveConfig(config) {
    try {
      if (this.validateConfig(config)) {
        fs.writeFileSync(
          this.configPath,
          JSON.stringify(config, null, 2) + os.EOL
        );
        this.config = config;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving config:", error.message);
      return false;
    }
  }

  validateConfig(config) {
    if (!config || typeof config !== "object") return false;
    if (!Array.isArray(config.environments)) return false;

    // Validate environments
    for (const env of config.environments) {
      if (!env.name || !env.branch || typeof env.isProduction !== "boolean") {
        return false;
      }
    }

    return true;
  }

  getEnvironment(name) {
    return this.config?.environments?.find((env) => env.name === name);
  }

  getEnvironmentByBranch(branch) {
    return this.config?.environments?.find((env) => env.branch === branch);
  }

  getAllEnvironments() {
    return this.config?.environments || DEFAULT_CONFIG.environments;
  }

  isProductionEnvironment(name) {
    const env = this.getEnvironment(name);
    return env ? env.isProduction : false;
  }

  getBranchForEnvironment(name) {
    const env = this.getEnvironment(name);
    return env ? env.branch : null;
  }
}

module.exports = new ConfigManager();
