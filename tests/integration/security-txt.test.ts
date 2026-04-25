import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../..");
const canonicalSecurityTxtPath = path.join(
  repoRoot,
  "public",
  ".well-known",
  "security.txt"
);
const duplicateSecurityTxtPath = path.join(repoRoot, "public", "security.txt");

const expectedLines = {
  contact: "Contact: mailto:security@monedario.cl",
  expires: "Expires: 2027-04-03T00:00:00.000Z",
  canonical: "Canonical: https://monedario.cl/.well-known/security.txt",
  policy:
    "Policy: https://github.com/cortega26/Monedario/blob/main/.github/SECURITY.md",
  preferredLanguages: "Preferred-Languages: es, en",
};

function readSecurityTxt(filePath: string) {
  return readFileSync(filePath, "utf8");
}

describe("security.txt publication", () => {
  it("publishes both expected endpoints with identical content", () => {
    expect(existsSync(canonicalSecurityTxtPath)).toBe(true);
    expect(existsSync(duplicateSecurityTxtPath)).toBe(true);

    const canonicalContent = readSecurityTxt(canonicalSecurityTxtPath);
    const duplicateContent = readSecurityTxt(duplicateSecurityTxtPath);

    expect(duplicateContent).toBe(canonicalContent);
  });

  it("includes each required field exactly once", () => {
    const content = readSecurityTxt(canonicalSecurityTxtPath);

    for (const line of Object.values(expectedLines)) {
      expect(content.split(line)).toHaveLength(2);
    }
  });

  it("points Canonical and Contact to the expected disclosure endpoints", () => {
    const content = readSecurityTxt(canonicalSecurityTxtPath);

    expect(content).toContain(expectedLines.contact);
    expect(content).toContain(expectedLines.canonical);
  });

  it("keeps Expires as a valid future timestamp", () => {
    const content = readSecurityTxt(canonicalSecurityTxtPath);
    const expiresLine = content
      .split("\n")
      .find(line => line.startsWith("Expires: "));

    expect(expiresLine).toBe(expectedLines.expires);

    const expiresValue = expiresLine?.replace("Expires: ", "") ?? "";
    const expiresTimestamp = Date.parse(expiresValue);

    expect(Number.isNaN(expiresTimestamp)).toBe(false);
    expect(expiresTimestamp).toBeGreaterThan(Date.now());
  });
});
