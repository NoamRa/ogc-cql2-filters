import "vitest";

interface CustomMatchers<R = unknown> {
  /**
   * toBeIncrementedFrom compares current branch's version with main branch's version
   * @param {string} currentVersion Semantic version for current branch in MAJOR.MINOR.PATCH format, ex 2.3.4
   * @param {string} mainVersion Semantic version for main branch in MAJOR.MINOR.PATCH format, ex 1.2.3
   * Use `readMainVersion` and `readCurrentVersion` functions to get version
   * @returns pass or fail
   */
  toBeIncrementedFrom: (mainVersion: string) => R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
