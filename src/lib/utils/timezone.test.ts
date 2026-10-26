import { describe, expect, it } from "vitest";

import { greetingForTimeZone } from "@/lib/utils/timezone";

describe("greetingForTimeZone", () => {
  const at = (iso: string) => new Date(iso);

  it("picks the greeting from the hour in the user's time zone", () => {
    expect(greetingForTimeZone("UTC", at("2026-10-24T05:00:00Z"))).toBe("Good morning");
    expect(greetingForTimeZone("UTC", at("2026-10-24T11:59:00Z"))).toBe("Good morning");
    expect(greetingForTimeZone("UTC", at("2026-10-24T12:00:00Z"))).toBe("Good afternoon");
    expect(greetingForTimeZone("UTC", at("2026-10-24T18:00:00Z"))).toBe("Good evening");
    expect(greetingForTimeZone("UTC", at("2026-10-24T00:30:00Z"))).toBe("Good evening");
    expect(greetingForTimeZone("UTC", at("2026-10-24T04:59:00Z"))).toBe("Good evening");
  });

  it("uses the time zone rather than the server clock", () => {
    const now = at("2026-10-24T19:00:00Z");
    expect(greetingForTimeZone("Africa/Lagos", now)).toBe("Good evening");
    expect(greetingForTimeZone("America/Los_Angeles", now)).toBe("Good afternoon");
    expect(greetingForTimeZone("Pacific/Auckland", now)).toBe("Good morning");
  });

  it("falls back to UTC for a missing or invalid time zone", () => {
    const now = at("2026-10-24T09:00:00Z");
    expect(greetingForTimeZone(null, now)).toBe("Good morning");
    expect(greetingForTimeZone("Not/AZone", now)).toBe("Good morning");
  });
});
