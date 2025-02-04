import { execSync } from "node:child_process";
import { expect } from "vitest";

interface ExpectationResult {
  pass: boolean;
  message: () => string;
  actual?: unknown;
  expected?: unknown;
}

const parseVersion = (version: string) => version.split(".").map(Number);

interface PackageJSON {
  version: string;
}
export const readMainVersion = () => {
  const getPackageJSON = () => execSync("git show origin/main:package.json", { encoding: "utf-8" });
  return (JSON.parse(getPackageJSON()) as PackageJSON).version;
};

export const readCurrentVersion = () => {
  return import.meta.env.npm_package_version as string;
};

const isSemVer = (version: string) => {
  const parsed = parseVersion(version);
  if (parsed.length !== 3) return false;
  if (!parsed.every(Number.isFinite)) return false;
  return true;
};

const isVersionIncremented = (currentVersion: string, mainVersion: string) => {
  const [currentMajor, currentMinor, currentPatch] = parseVersion(currentVersion);
  const [mainMajor, mainMinor, mainPatch] = parseVersion(mainVersion);

  if (currentMajor > mainMajor) return true;
  if (currentMinor > mainMinor) return true;
  if (currentPatch > mainPatch) return true;
  return false;
};

expect.extend({
  /**
   * toBeIncrementedFrom compares current branch's version with main branch's version
   * @param {string} currentVersion Semantic version for current branch in MAJOR.MINOR.PATCH format, ex 2.3.4
   * @param {string} mainVersion Semantic version for main branch in MAJOR.MINOR.PATCH format, ex 1.2.3
   * Use `readMainVersion` and `readCurrentVersion` functions to get version
   * @returns pass or fail
   */
  toBeIncrementedFrom(currentVersion: string, mainVersion: string): ExpectationResult {
    // check versions are non-empty strings
    if (typeof currentVersion !== "string" || currentVersion === "") {
      return {
        pass: false,
        message: () => `Expected current branch's version to be a non-empty string`,
        actual: currentVersion,
        expected: mainVersion,
      };
    }
    if (typeof mainVersion !== "string" || mainVersion === "") {
      return {
        pass: false,
        message: () => `Expected main branch's version to be a non-empty string`,
        actual: currentVersion,
        expected: mainVersion,
      };
    }

    // check versions contain 3 numbers
    if (!isSemVer(currentVersion)) {
      return {
        pass: false,
        message: () => `Expected the current version '${currentVersion}' to have 3 numbers`,
        actual: currentVersion,
        expected: mainVersion,
      };
    }
    if (!isSemVer(mainVersion)) {
      return {
        pass: false,
        message: () => `Expected the main version '${currentVersion}' to have 3 numbers`,
        actual: currentVersion,
        expected: mainVersion,
      };
    }

    // check is incremented
    if (!isVersionIncremented(currentVersion, mainVersion)) {
      const cta = "Call `npm version <major | minor | patch>` to increment version.";
      return {
        pass: false,
        message: () =>
          `Expected the current version '${currentVersion}' to be incremented from the version in main branch: '${mainVersion}'. ${cta}`,
        actual: currentVersion,
        expected: mainVersion,
      };
    }

    // great success
    return {
      pass: true,
      message: () =>
        `Expected the current version '${currentVersion}' to be incremented from the version in main branch: '${mainVersion}'.`,
    };
  },
});
