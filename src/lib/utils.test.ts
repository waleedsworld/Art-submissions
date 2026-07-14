import { describe, it, expect } from "vitest";
import { cn, parseImageData, formatDate } from "./utils";

describe("cn", () => {
  it("joins multiple class name strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    const off = false as boolean;
    expect(cn("a", off && "b", null, undefined, "c")).toBe("a c");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("merges conflicting tailwind utilities keeping the last one", () => {
    expect(cn("px-2 px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});

describe("parseImageData", () => {
  it("parses a full, valid JSON payload", () => {
    const payload = JSON.stringify({
      studentName: "Ada",
      grade: "5",
      title: "Sunset",
      type: "ai",
      aiGenerator: "midjourney",
      aiPrompt: "a bright sunset",
      fromCheckDashboard: true,
    });

    const result = parseImageData(payload);

    expect(result.studentName).toBe("Ada");
    expect(result.grade).toBe("5");
    expect(result.title).toBe("Sunset");
    expect(result.type).toBe("ai");
    expect(result.aiGenerator).toBe("midjourney");
    expect(result.aiPrompt).toBe("a bright sunset");
    expect(result.fromCheckDashboard).toBe(true);
  });

  it("parses a minimal hand-drawn payload", () => {
    const payload = JSON.stringify({
      studentName: "Bo",
      grade: "3",
      title: "Cat",
    });

    const result = parseImageData(payload);

    expect(result.studentName).toBe("Bo");
    expect(result.grade).toBe("3");
    expect(result.title).toBe("Cat");
  });

  it("falls back to Unknown defaults on invalid JSON", () => {
    const result = parseImageData("not-json-at-all");

    expect(result).toEqual({
      studentName: "Unknown",
      grade: "Unknown",
      title: "Unknown",
      type: "handdrawn",
      fromCheckDashboard: false,
    });
  });

  it("falls back to defaults on an empty string", () => {
    const result = parseImageData("");
    expect(result.studentName).toBe("Unknown");
    expect(result.type).toBe("handdrawn");
  });
});

describe("formatDate", () => {
  it("renders a parseable date string via toLocaleString", () => {
    const iso = "2026-06-01T12:00:00.000Z";
    const expected = new Date(iso).toLocaleString();
    expect(formatDate(iso)).toBe(expected);
  });

  it("returns 'Invalid Date' for an unparseable input", () => {
    expect(formatDate("definitely-not-a-date")).toBe("Invalid Date");
  });
});
