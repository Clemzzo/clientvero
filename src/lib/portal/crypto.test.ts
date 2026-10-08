import { describe, expect, it } from "vitest";

import { newToken, openToken, sealToken } from "@/lib/portal/crypto";

describe("sealed setup tokens", () => {
  it("opens what it sealed, with a fresh IV each time", () => {
    const { token } = newToken();
    const sealed = sealToken(token);

    expect(openToken(sealed)).toBe(token);
    expect(sealToken(token)).not.toBe(sealed);
  });

  it("returns null for tampered or unknown values", () => {
    const [version, iv, tag, ciphertext] = sealToken(newToken().token).split("$");
    const flipped = `${ciphertext.startsWith("A") ? "B" : "A"}${ciphertext.slice(1)}`;

    expect(openToken([version, iv, tag, flipped].join("$"))).toBeNull();
    expect(openToken(["v0", iv, tag, ciphertext].join("$"))).toBeNull();
    expect(openToken("not-a-sealed-token")).toBeNull();
  });
});
