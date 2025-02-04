import { describe, expect, test } from "vitest";

import { readCurrentVersion, readMainVersion } from "./toBeIncrementedFrom";

describe("CI tests", () => {
  test("Incremented version in package.json", () => {
    const mainVersion = readMainVersion();
    const currentVersion = readCurrentVersion();

    expect(currentVersion).toBeIncrementedFrom(mainVersion);
  });
});
