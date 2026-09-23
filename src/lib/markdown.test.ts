import { describe, expect, it } from "vitest";
import { stripMarkdown } from "./markdown";

describe("stripMarkdown", () => {
  it("strips bold, italic and headings", () => {
    expect(stripMarkdown("# Title\n**bold** and *italic* text")).toBe(
      "Title bold and italic text",
    );
  });

  it("strips links but keeps their label", () => {
    expect(stripMarkdown("See [the guide](https://example.com) for details")).toBe(
      "See the guide for details",
    );
  });

  it("strips images entirely", () => {
    expect(stripMarkdown("Before ![alt text](https://example.com/x.png) after")).toBe(
      "Before after",
    );
  });

  it("strips inline code and fenced code blocks", () => {
    expect(stripMarkdown("Use `npm install` then\n```\nnpm run build\n```\ndone")).toBe(
      "Use npm install then done",
    );
  });

  it("strips list markers and blockquotes", () => {
    expect(stripMarkdown("- one\n- two\n> a quote\n1. first")).toBe("one two a quote first");
  });

  it("collapses whitespace and trims", () => {
    expect(stripMarkdown("  hello   world  \n\n next line  ")).toBe("hello world next line");
  });

  it("returns an empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });
});
