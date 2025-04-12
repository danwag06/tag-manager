const { execSync } = require("child_process");

const getGitBranches = () => {
  try {
    const output = execSync("git branch -a", { encoding: "utf8" });
    console.log(output.split("\n").map((branch) => branch.trim()));
    return output
      .split("\n")
      .map((branch) => branch.trim())
      .filter((branch) => {
        if (!branch) return false;
        if (branch.includes("HEAD ->")) return false;
        if (branch.includes("origin/")) return false;
        if (branch.includes("feature/")) return false;
        if (branch.includes("feat/")) return false;
        if (branch.includes("hotfix/")) return false;
        if (branch.includes("refactor/")) return false;
        return true;
      })
      .map((branch) => branch.replace("remotes/origin/", ""))
      .map((branch) => branch.replace("* ", ""))
      .filter((branch, index, self) => self.indexOf(branch) === index)
      .sort();
  } catch (error) {
    console.error("Error getting Git branches:", error.message);
    return [];
  }
};

module.exports = {
  getGitBranches,
};
