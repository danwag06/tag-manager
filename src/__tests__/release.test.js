const { incrementVersion, determineNewVersion } = require("../release");

// Set environment for tests
process.env.NODE_ENV = "test";

jest.mock("../config", () => ({
  loadConfig: jest.fn(() => ({
    environments: [
      { name: "dev", branch: "develop", isProduction: false },
      { name: "qa", branch: "qa", isProduction: false },
      { name: "stg", branch: "staging", isProduction: false },
      { name: "prod", branch: "main", isProduction: true },
    ],
  })),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(() => "develop"),
}));

describe("incrementVersion", () => {
  describe("basic version increments", () => {
    test("should increment patch version", () => {
      expect(incrementVersion("v0.0.7-dev-rc", "patch")).toBe("0.0.8");
    });

    test("should increment minor version", () => {
      expect(incrementVersion("v0.0.7-dev-rc", "minor")).toBe("0.1.0");
    });

    test("should increment major version", () => {
      expect(incrementVersion("v0.0.7-dev-rc", "major")).toBe("1.0.0");
    });
  });

  describe("pre-release handling", () => {
    test("should strip pre-release before incrementing", () => {
      expect(incrementVersion("v0.0.7-dev-rc", "patch")).toBe("0.0.8");
      expect(incrementVersion("v0.0.7-dev-alpha", "patch")).toBe("0.0.8");
      expect(incrementVersion("v0.0.7-dev-beta", "patch")).toBe("0.0.8");
    });

    test("should handle versions without pre-release", () => {
      expect(incrementVersion("v0.0.7-dev", "patch")).toBe("0.0.8");
      expect(incrementVersion("v0.0.7", "patch")).toBe("0.0.8");
    });
  });
});

describe("determineNewVersion", () => {
  describe("with pre-release", () => {
    test("should create new version with pre-release", () => {
      const result = determineNewVersion("patch", "alpha");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-dev-alpha/);
      expect(result.mutableTag).toBe("dev");
    });

    test("should handle minor increment with pre-release", () => {
      const result = determineNewVersion("minor", "beta");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.0-dev-beta/);
      expect(result.mutableTag).toBe("dev");
    });

    test("should handle major increment with pre-release", () => {
      const result = determineNewVersion("major", "rc");
      expect(result.immutableTag).toMatch(/v\d+\.0\.0-dev-rc/);
      expect(result.mutableTag).toBe("dev");
    });
  });

  describe("without pre-release", () => {
    test("should create new version without pre-release", () => {
      const result = determineNewVersion("patch");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-dev/);
      expect(result.mutableTag).toBe("dev");
    });

    test("should handle minor increment without pre-release", () => {
      const result = determineNewVersion("minor");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.0-dev/);
      expect(result.mutableTag).toBe("dev");
    });

    test("should handle major increment without pre-release", () => {
      const result = determineNewVersion("major");
      expect(result.immutableTag).toMatch(/v\d+\.0\.0-dev/);
      expect(result.mutableTag).toBe("dev");
    });
  });

  describe("pre-release transitions", () => {
    test("should handle transition from rc to alpha", () => {
      const result = determineNewVersion("patch", "alpha");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-dev-alpha/);
    });

    test("should handle transition from alpha to beta", () => {
      const result = determineNewVersion("patch", "beta");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-dev-beta/);
    });

    test("should handle transition from beta to rc", () => {
      const result = determineNewVersion("patch", "rc");
      expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-dev-rc/);
    });
  });
});

describe("determineNewVersion (production)", () => {
  let determineNewVersion;

  beforeEach(() => {
    // Reset modules
    jest.resetModules();

    // Mock child_process for production tests
    jest.mock("child_process", () => ({
      execSync: jest.fn().mockImplementation((cmd) => {
        if (cmd === "git rev-parse --abbrev-ref HEAD") {
          return "main";
        }
        return "";
      }),
    }));

    // Mock config
    jest.mock("../config", () => ({
      loadConfig: jest.fn(() => ({
        environments: [
          { name: "dev", branch: "develop", isProduction: false },
          { name: "qa", branch: "qa", isProduction: false },
          { name: "stg", branch: "staging", isProduction: false },
          { name: "prod", branch: "main", isProduction: true },
        ],
      })),
    }));

    // Re-require the release module
    const release = require("../release");
    determineNewVersion = release.determineNewVersion;

    // Mock getCurrentVersion
    jest.spyOn(release, "getCurrentVersion").mockReturnValue("v0.0.7");

    // Mock getLatestTag to return a production tag
    jest.spyOn(release, "getLatestTag").mockReturnValue("v0.0.7");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create production version without pre-release", () => {
    const result = determineNewVersion("patch");
    expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+$/);
    expect(result.mutableTag).toBe("latest");
  });

  test("should create production version with pre-release", () => {
    const result = determineNewVersion("patch", "alpha");
    expect(result.immutableTag).toMatch(/v\d+\.\d+\.\d+-alpha$/);
    expect(result.mutableTag).toBe("latest");
  });

  test("should handle production minor release", () => {
    const result = determineNewVersion("minor");
    expect(result.immutableTag).toMatch(/v\d+\.\d+\.0$/);
    expect(result.mutableTag).toBe("latest");
  });

  test("should handle production major release", () => {
    const result = determineNewVersion("major");
    expect(result.immutableTag).toMatch(/v\d+\.0\.0$/);
    expect(result.mutableTag).toBe("latest");
  });

  test("should handle production pre-release transitions", () => {
    const alphaResult = determineNewVersion("patch", "alpha");
    expect(alphaResult.immutableTag).toMatch(/v\d+\.\d+\.\d+-alpha$/);

    const betaResult = determineNewVersion("patch", "beta");
    expect(betaResult.immutableTag).toMatch(/v\d+\.\d+\.\d+-beta$/);

    const rcResult = determineNewVersion("patch", "rc");
    expect(rcResult.immutableTag).toMatch(/v\d+\.\d+\.\d+-rc$/);
  });
});
