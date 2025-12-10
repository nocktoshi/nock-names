import { describe, it, expect } from "vitest";
import { getFee } from "./index";

describe("getFee", () => {
  it("returns 0 for empty name", () => {
    expect(getFee("")).toBe(0);
  });

  it("applies 100 NOCK for names length >= 10", () => {
    expect(getFee("longname123.nock")).toBe(100);
  });

  it("applies 500 NOCK for names length between 5 and 9", () => {
    expect(getFee("shorty.nock")).toBe(500);
  });

  it("applies 5000 NOCK for short names", () => {
    expect(getFee("abc.nock")).toBe(5000);
  });
});

