import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@actions/core");
vi.mock("@actions/github");

describe("buildGreeting", () => {
  it("greets the given name", async () => {
    const { buildGreeting } = await import("../src/utils.js");
    expect(buildGreeting("Alice")).toBe("Hello, Alice!");
  });

  it("trims whitespace from the name", async () => {
    const { buildGreeting } = await import("../src/utils.js");
    expect(buildGreeting("  Bob  ")).toBe("Hello, Bob!");
  });

  it("falls back to World when name is empty", async () => {
    const { buildGreeting } = await import("../src/utils.js");
    expect(buildGreeting("")).toBe("Hello, World!");
  });

  it("falls back to World when name is whitespace", async () => {
    const { buildGreeting } = await import("../src/utils.js");
    expect(buildGreeting("   ")).toBe("Hello, World!");
  });
});

describe("formatTimestamp", () => {
  it("returns an ISO 8601 string for a given date", async () => {
    const { formatTimestamp } = await import("../src/utils.js");
    const date = new Date("2024-01-15T12:00:00.000Z");
    expect(formatTimestamp(date)).toBe("2024-01-15T12:00:00.000Z");
  });

  it("defaults to the current time", async () => {
    const { formatTimestamp } = await import("../src/utils.js");
    const before = Date.now();
    const result = formatTimestamp();
    const after = Date.now();
    const ts = new Date(result).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe("run", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("sets the greeting output", async () => {
    const core = await import("@actions/core");
    core.getInput = vi.fn((name) => {
      if (name === "who-to-greet") return "Tester";
      if (name === "github-token") return "";
      return "";
    });
    core.setOutput = vi.fn();
    core.info = vi.fn();
    core.debug = vi.fn();
    core.setFailed = vi.fn();

    await import("../src/index.js");

    expect(core.setOutput).toHaveBeenCalledWith("greeting", "Hello, Tester!");
  });

  it("calls setFailed on error", async () => {
    const core = await import("@actions/core");
    core.getInput = vi.fn(() => {
      throw new Error("input error");
    });
    core.setFailed = vi.fn();
    core.info = vi.fn();
    core.debug = vi.fn();
    core.setOutput = vi.fn();

    await import("../src/index.js");

    expect(core.setFailed).toHaveBeenCalledWith("input error");
  });
});
