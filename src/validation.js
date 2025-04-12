const ALLOWED_ENVS = ["dev", "qa", "stg", "prod"];
const PRERELEASE_TYPES = ["alpha", "beta", "rc"];

const validateTag = (tagArg) => {
  // First check basic format
  const regex = /^v\d+\.\d+\.\d+(-(dev|qa|stg|prod))?(-(alpha|beta|rc))?$/;
  if (!tagArg || !regex.test(tagArg)) {
    return {
      isValid: false,
      error: "❌ Invalid tag format!",
    };
  }

  const [fullTag, versionOnly, env, preRelease] =
    tagArg.match(
      /^v(\d+\.\d+\.\d+)(?:-(dev|qa|stg|prod))?(?:-(alpha|beta|rc))?$/
    ) || [];

  // Check for leading zeros in version numbers
  const versionParts = versionOnly.split(".");
  if (
    versionParts.some((part) => {
      const num = parseInt(part, 10);
      return num.toString() !== part; // This will catch any leading zeros
    })
  ) {
    return {
      isValid: false,
      error: "❌ Version numbers cannot have leading zeros",
    };
  }

  // Version number limits
  if (versionParts.some((part) => parseInt(part) > 999)) {
    return {
      isValid: false,
      error: "❌ Version numbers cannot be larger than 999",
    };
  }

  // Check for all zeros in version
  if (versionParts.every((part) => parseInt(part) === 0)) {
    return {
      isValid: false,
      error:
        "❌ Version cannot be 0.0.0 - at least one number must be greater than 0",
    };
  }

  // Check if it's a valid environment
  const isValidEnv = ALLOWED_ENVS.includes(env);
  if (env && !isValidEnv) {
    return {
      isValid: false,
      error: "❌ Invalid environment!",
    };
  }

  // Production tags cannot use -prod suffix
  if (env === "prod") {
    return {
      isValid: false,
      error: "❌ Production tags cannot use -prod suffix",
    };
  }

  // Check if it's a valid pre-release
  const isPrerelease = PRERELEASE_TYPES.includes(preRelease);

  // Determine if this is a production tag
  const isProd = !env;

  // Determine if this is a production pre-release
  const isProdPrerelease = isProd; // Plain version tags are considered pre-releases

  // Construct tags based on the type
  let immutableTag, mutableTag;

  if (isProd) {
    if (isPrerelease) {
      // For production pre-releases (e.g. v1.0.0-alpha), preserve the full tag
      immutableTag = fullTag;
    } else {
      // For plain version tags (e.g. v1.0.0), use as is
      immutableTag = fullTag;
    }
    mutableTag = "latest";
  } else {
    // For environment tags, use the full tag
    immutableTag = fullTag;
    mutableTag = env;
  }

  return {
    isValid: true,
    data: {
      immutableTag,
      mutableTag,
      versionOnly,
      env: env || null, // Only set env if it's a real environment, not a pre-release
      preRelease, // Store pre-release type separately
      isProd,
      isPrerelease,
      isProdPrerelease,
    },
  };
};

module.exports = { validateTag };
