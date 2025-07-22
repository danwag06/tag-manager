const { expect } = require("@jest/globals");
const { validateTag } = require("../validation");

describe("validateTag", () => {
  describe("valid tags", () => {
    test.each([
      // Production cases
      [
        "v1.0.0",
        {
          versionOnly: "1.0.0",
          env: null,
          isProd: true,
          isProdPrerelease: true,
        },
      ],
      [
        "v1.0.0-alpha",
        {
          versionOnly: "1.0.0",
          env: null,
          isProd: true,
          isProdPrerelease: true,
        },
      ],
      [
        "v1.0.0-beta",
        {
          versionOnly: "1.0.0",
          env: null,
          isProd: true,
          isProdPrerelease: true,
        },
      ],
      [
        "v1.0.0-rc",
        {
          versionOnly: "1.0.0",
          env: null,
          isProd: true,
          isProdPrerelease: true,
        },
      ],
      // Development cases
      [
        "v1.0.0-dev",
        {
          versionOnly: "1.0.0",
          env: "dev",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-dev-alpha",
        {
          versionOnly: "1.0.0",
          env: "dev",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-dev-beta",
        {
          versionOnly: "1.0.0",
          env: "dev",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-dev-rc",
        {
          versionOnly: "1.0.0",
          env: "dev",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      // QA cases
      [
        "v1.0.0-qa",
        {
          versionOnly: "1.0.0",
          env: "qa",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-qa-alpha",
        {
          versionOnly: "1.0.0",
          env: "qa",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-qa-beta",
        {
          versionOnly: "1.0.0",
          env: "qa",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-qa-rc",
        {
          versionOnly: "1.0.0",
          env: "qa",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      // Staging cases
      [
        "v1.0.0-stg",
        {
          versionOnly: "1.0.0",
          env: "stg",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-stg-alpha",
        {
          versionOnly: "1.0.0",
          env: "stg",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-stg-beta",
        {
          versionOnly: "1.0.0",
          env: "stg",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
      [
        "v1.0.0-stg-rc",
        {
          versionOnly: "1.0.0",
          env: "stg",
          isProd: false,
          isProdPrerelease: false,
        },
      ],
    ])("should validate %s correctly", (tag, expected) => {
      const result = validateTag(tag);
      expect(result.isValid).toBe(true);
      expect(result.data.versionOnly).toBe(expected.versionOnly);
      expect(result.data.env).toBe(expected.env);
      expect(result.data.isProd).toBe(expected.isProd);
      expect(result.data.isProdPrerelease).toBe(expected.isProdPrerelease);
    });
  });

  describe("invalid tags", () => {
    test.each([
      // Leading zeros
      ["v01.0.0-dev", "❌ Version numbers cannot have leading zeros"],
      ["v1.02.0-dev", "❌ Version numbers cannot have leading zeros"],
      ["v1.0.03-dev", "❌ Version numbers cannot have leading zeros"],
      ["v01.02.03-dev", "❌ Version numbers cannot have leading zeros"],

      // Version number limits
      ["v1000.0.0-dev", "❌ Version numbers cannot be larger than 999"],
      ["v0.1000.0-dev", "❌ Version numbers cannot be larger than 999"],
      ["v0.0.1000-dev", "❌ Version numbers cannot be larger than 999"],
      ["v1000.1000.1000-dev", "❌ Version numbers cannot be larger than 999"],

      // All zeros
      [
        "v0.0.0-dev",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-qa",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-stg",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-prod",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-alpha",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-beta",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],
      [
        "v0.0.0-rc",
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
      ],

      // Invalid format
      ["v1.0.0-", "❌ Invalid tag format!"],
      ["v1.0.0-abc", "❌ Invalid tag format!"],
      ["v1.0.0-DEV", "❌ Invalid tag format!"],
      ["v1.0.0-staging", "❌ Invalid tag format!"],
      ["v1.0.0-gamma", "❌ Invalid tag format!"],
      ["v1.0.0-ALPHA", "❌ Invalid tag format!"],
      ["v1.0.0-alpha.1", "❌ Invalid tag format!"], // TODO: look into if we want to support this. It may overcomplicate existing logic.
      ["v1.0.0-alpha-1", "❌ Invalid tag format!"],
      ["v1.0.0-alpha-beta", "❌ Invalid tag format!"],
      ["v1.0.0-alpha+001", "❌ Invalid tag format!"],

      // Missing parts
      ["", "❌ Invalid tag format!"],
      ["v1.0", "❌ Invalid tag format!"],
      ["v1", "❌ Invalid tag format!"],
      ["v1.0.0.0", "❌ Invalid tag format!"],

      // Whitespace
      ["v1.0.0-dev ", "❌ Invalid tag format!"],
      [" v1.0.0-dev", "❌ Invalid tag format!"],
      ["v1.0.0-dev\t", "❌ Invalid tag format!"],
      ["\tv1.0.0-dev", "❌ Invalid tag format!"],

      // Extra characters
      ["v1.0.0-dev-extra", "❌ Invalid tag format!"],
      ["v1.0.0-dev#", "❌ Invalid tag format!"],
      ["v1.0.0-dev@", "❌ Invalid tag format!"],
      ["v1.0.0-dev+", "❌ Invalid tag format!"],

      // Special characters
      ["v1.0.0-dev!", "❌ Invalid tag format!"],
      ["v1.0.0-dev?", "❌ Invalid tag format!"],
      ["v1.0.0-dev*", "❌ Invalid tag format!"],
      ["v1.0.0-dev&", "❌ Invalid tag format!"],

      // Unicode characters
      ["v1.0.0-dév", "❌ Invalid tag format!"],
      ["v1.0.0-ßeta", "❌ Invalid tag format!"],
      ["v1.0.0-∂ev", "❌ Invalid tag format!"],
    ])("should reject %s with correct error", (tag, expectedError) => {
      const result = validateTag(tag);
      expect(result.isValid).toBe(false);
    });
  });

  describe("tag construction", () => {
    describe("development environment", () => {
      test("should construct tags correctly for dev", () => {
        const result = validateTag("v1.0.0-dev");
        expect(result.data.immutableTag).toBe("v1.0.0-dev");
        expect(result.data.mutableTag).toBe("dev");
      });

      test("should construct tags correctly for qa", () => {
        const result = validateTag("v1.0.0-qa");
        expect(result.data.immutableTag).toBe("v1.0.0-qa");
        expect(result.data.mutableTag).toBe("qa");
      });

      test("should construct tags correctly for stg", () => {
        const result = validateTag("v1.0.0-stg");
        expect(result.data.immutableTag).toBe("v1.0.0-stg");
        expect(result.data.mutableTag).toBe("stg");
      });

      test("should construct tags correctly for dev with pre-release", () => {
        const result = validateTag("v1.0.0-dev-alpha");
        expect(result.data.immutableTag).toBe("v1.0.0-dev-alpha");
        expect(result.data.mutableTag).toBe("dev");
      });
    });

    describe("production environment", () => {
      test("should construct tags correctly for plain version", () => {
        const result = validateTag("v1.0.0");
        expect(result.data.immutableTag).toBe("v1.0.0");
        expect(result.data.mutableTag).toBe("latest");
      });

      test("should construct tags correctly for alpha", () => {
        const result = validateTag("v1.0.0-alpha");
        expect(result.data.immutableTag).toBe("v1.0.0-alpha");
        expect(result.data.mutableTag).toBe("latest");
      });

      test("should construct tags correctly for beta", () => {
        const result = validateTag("v1.0.0-beta");
        expect(result.data.immutableTag).toBe("v1.0.0-beta");
        expect(result.data.mutableTag).toBe("latest");
      });

      test("should construct tags correctly for rc", () => {
        const result = validateTag("v1.0.0-rc");
        expect(result.data.immutableTag).toBe("v1.0.0-rc");
        expect(result.data.mutableTag).toBe("latest");
      });
    });

    describe("version number variations", () => {
      test("should handle single digit versions", () => {
        const result = validateTag("v1.0.0-dev");
        expect(result.data.immutableTag).toBe("v1.0.0-dev");
        expect(result.data.mutableTag).toBe("dev");
      });

      test("should handle double digit versions", () => {
        const result = validateTag("v10.10.10-dev");
        expect(result.data.immutableTag).toBe("v10.10.10-dev");
        expect(result.data.mutableTag).toBe("dev");
      });

      test("should handle triple digit versions", () => {
        const result = validateTag("v100.100.100-dev");
        expect(result.data.immutableTag).toBe("v100.100.100-dev");
        expect(result.data.mutableTag).toBe("dev");
      });

      test("should handle max allowed versions", () => {
        const result = validateTag("v999.999.999-dev");
        expect(result.data.immutableTag).toBe("v999.999.999-dev");
        expect(result.data.mutableTag).toBe("dev");
      });
    });
  });
});
