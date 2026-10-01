import type { Ratelimit } from "@upstash/ratelimit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withinLimits } from "@/lib/redis/rate-limit";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { RateLimitError } from "@/server/errors";

vi.mock("@/lib/redis/rate-limit", () => ({ withinLimits: vi.fn() }));

const limiter = {} as Ratelimit;
const ctx = { user: { id: "user-123" } };

describe("requireWithinLimit", () => {
  beforeEach(() => {
    vi.mocked(withinLimits).mockReset();
  });

  it("passes when under the limit, keyed by the user", async () => {
    vi.mocked(withinLimits).mockResolvedValue(true);

    await expect(requireWithinLimit(ctx, limiter)).resolves.toBeUndefined();
    expect(withinLimits).toHaveBeenCalledWith([limiter, "user-123"]);
  });

  it("throws a RateLimitError when over the limit", async () => {
    vi.mocked(withinLimits).mockResolvedValue(false);

    await expect(requireWithinLimit(ctx, limiter)).rejects.toBeInstanceOf(RateLimitError);
  });
});
