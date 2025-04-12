#!/usr/bin/env node

const inquirer = require("inquirer").default;
const { execSync } = require("child_process");
const config = require("../src/config");
const {
  getCurrentBranch,
  getLatestTag,
  determineNewVersion,
} = require("../src/release");
const { getGitBranches } = require("../src/git-utils");

const PRE_RELEASE_TYPES = ["alpha", "beta", "rc"];

async function setupConfig() {
  try {
    // Get list of branches
    const branches = getGitBranches();

    if (branches.length === 0) {
      console.log(
        "\n❌ No remote branches found. Please ensure you have:\n" +
          "  1. Initialized a Git repository (git init)\n" +
          "  2. Added a remote repository (git remote add origin <url>)\n" +
          "  3. Created at least one branch\n\n" +
          "After setting up your repository, run 'npx wags-tags' again."
      );
      return;
    }

    // Add skip option to branches
    const branchChoices = [
      ...branches,
      new inquirer.Separator(),
      "Skip this environment",
    ];

    // Prompt for environment mappings
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "devBranch",
        message: "Select your development branch (or skip):",
        choices: branchChoices,
        default: "develop",
      },
      {
        type: "list",
        name: "qaBranch",
        message: "Select your QA branch (or skip):",
        choices: branchChoices,
        default: "qa",
      },
      {
        type: "list",
        name: "stagingBranch",
        message: "Select your staging branch (or skip):",
        choices: branchChoices,
        default: "staging",
      },
      {
        type: "list",
        name: "prodBranch",
        message: "Select your production branch (or skip):",
        choices: branchChoices,
        default: "main",
      },
    ]);

    // Create config object with only non-skipped environments
    const environments = [];

    if (answers.devBranch !== "Skip this environment") {
      environments.push({
        name: "dev",
        branch: answers.devBranch,
        isProduction: false,
      });
    }

    if (answers.qaBranch !== "Skip this environment") {
      environments.push({
        name: "qa",
        branch: answers.qaBranch,
        isProduction: false,
      });
    }

    if (answers.stagingBranch !== "Skip this environment") {
      environments.push({
        name: "stg",
        branch: answers.stagingBranch,
        isProduction: false,
      });
    }

    if (answers.prodBranch !== "Skip this environment") {
      environments.push({
        name: "prod",
        branch: answers.prodBranch,
        isProduction: true,
      });
    }

    // Create config object
    const newConfig = { environments };

    // Save config
    if (config.saveConfig(newConfig)) {
      console.log("Configuration saved successfully!");
      console.log(
        "Configured environments:",
        environments.map((e) => e.name).join(", ")
      );
    } else {
      console.error("Failed to save configuration");
    }
  } catch (error) {
    console.error("Error setting up configuration:", error.message);
  }
}

async function createRelease(incrementType = "patch", preRelease = false) {
  try {
    // Get current branch and latest tag
    const currentBranch = getCurrentBranch();
    const latestTag = getLatestTag(currentBranch);

    let preReleaseType = null;
    if (preRelease) {
      const { selectedType } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedType",
          message: "Select pre-release type:",
          choices: PRE_RELEASE_TYPES,
        },
      ]);
      preReleaseType = selectedType;
    }

    // Determine new version based on increment type
    const versionInfo = determineNewVersion(incrementType, preReleaseType);
    let { immutableTag, mutableTag } = versionInfo;

    // Show tag creation options
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Create tags:",
        choices: [
          {
            name: `Use generated tags:\n  - ${immutableTag} (immutable)\n  - ${mutableTag} (mutable)`,
            value: "use_generated",
          },
          {
            name: "Enter custom tags",
            value: "custom",
          },
          {
            name: "Cancel",
            value: "cancel",
          },
        ],
      },
    ]);

    if (action === "cancel") {
      console.log("Release cancelled");
      return;
    }

    if (action === "custom") {
      // Get custom immutable tag
      const { customImmutable } = await inquirer.prompt([
        {
          type: "input",
          name: "customImmutable",
          message: "What is your immutable tag (e.g. v1.2.3-dev)?",
          default: immutableTag,
        },
      ]);

      // Get custom mutable tag
      const { customMutable } = await inquirer.prompt([
        {
          type: "input",
          name: "customMutable",
          message: "What is your mutable tag (e.g. dev)?",
          default: mutableTag,
        },
      ]);

      immutableTag = customImmutable.trim();
      mutableTag = customMutable.trim();
    }

    // Final confirmation
    const { finalConfirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "finalConfirm",
        message: `About to create tags:\n  - ${immutableTag} (immutable)\n  - ${mutableTag} (mutable)\n\nProceed?`,
        default: false,
      },
    ]);

    if (!finalConfirm) {
      console.log("Release cancelled");
      return;
    }

    // Create and push tags
    execSync(`git tag ${immutableTag}`);
    execSync(`git push origin ${immutableTag}`);

    if (mutableTag) {
      execSync(`git tag -f ${mutableTag}`);
      execSync(`git push -f origin ${mutableTag}`);
    }

    console.log("Tags created and pushed successfully!");
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Check for config flag
  if (args.includes("-config")) {
    await setupConfig();
    return;
  }

  // Check if configuration exists
  const envConfig = config.loadConfig();
  if (!envConfig) {
    console.log("No configuration found. Setting up configuration...");
    await setupConfig();
    return;
  }

  // Determine increment type
  let incrementType = "patch";
  if (args.includes("-major")) {
    incrementType = "major";
  } else if (args.includes("-minor")) {
    incrementType = "minor";
  }

  // Check for pre-release flag
  const preRelease = args.includes("--pre-release") || args.includes("-pr");

  // Create release
  await createRelease(incrementType, preRelease);
}

main();
