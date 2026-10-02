import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { activityLogs, type Organization, type User } from "@/db/schema";
import { ConflictError, NotFoundError } from "@/server/errors";
import { createClient } from "@/server/services/client.service";
import {
  createProposal,
  getProposal,
  sendProposal,
  updateProposal,
  withdrawProposal,
} from "@/server/services/proposal.service";
import {
  acceptProposal,
  declineProposal,
  getPublicProposal,
  markProposalViewed,
} from "@/server/services/public-proposal.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";
import type { ProposalFormInput } from "@/validators/proposals";

const clientInput = {
  name: "Acme",
  email: null,
  phone: null,
  company: null,
  website: null,
  address: null,
  country: null,
  notes: null,
};

function proposalInput(clientId: string, overrides: Partial<ProposalFormInput> = {}): ProposalFormInput {
  return {
    clientId,
    title: "Website redesign",
    description: null,
    currency: "USD",
    subtotal: "1500.00",
    discount: "100.00",
    tax: "75.00",
    timeline: null,
    terms: null,
    sections: [{ title: "Scope", content: "Five pages", sectionType: "SCOPE" }],
    ...overrides,
  };
}

async function activityFor(proposalId: string, action: string) {
  return db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.resourceId, proposalId), eq(activityLogs.action, action)));
}

describe("proposals", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;
  let clientA: string;
  let clientB: string;

  const ctxA = () => ({ user, organization: orgA });
  const ctxB = () => ({ user, organization: orgB });

  async function sentProposal() {
    const id = await createProposal(ctxA(), proposalInput(clientA));
    const publicId = await sendProposal(ctxA(), id);
    return { id, publicId };
  }

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);
    [clientA, clientB] = await Promise.all([createClient(ctxA(), clientInput), createClient(ctxB(), clientInput)]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  describe("workspace", () => {
    it("computes the total on the server and saves sections in order", async () => {
      const id = await createProposal(
        ctxA(),
        proposalInput(clientA, {
          sections: [
            { title: "Intro", content: "", sectionType: "INTRO" },
            { title: "Scope", content: "Pages", sectionType: "SCOPE" },
          ],
        }),
      );
      const proposal = await getProposal(orgA.id, id);

      expect(proposal).toMatchObject({ status: "DRAFT", total: "1475.00", clientName: "Acme" });
      expect(proposal.publicId).toMatch(/^[A-Za-z0-9_-]{22}$/);
      expect(proposal.sections.map((section) => section.title)).toEqual(["Intro", "Scope"]);
    });

    it("locks a sent proposal until it is withdrawn, then allows edit and resend", async () => {
      const { id } = await sentProposal();

      await expect(updateProposal(ctxA(), id, proposalInput(clientA))).rejects.toBeInstanceOf(ConflictError);

      await withdrawProposal(ctxA(), id);
      await updateProposal(ctxA(), id, proposalInput(clientA, { title: "Revised", subtotal: "2000.00" }));
      await sendProposal(ctxA(), id);

      expect(await getProposal(orgA.id, id)).toMatchObject({ status: "SENT", title: "Revised", total: "1975.00" });
      expect(await activityFor(id, "PROPOSAL_SENT")).toHaveLength(2);
    });

    it("rejects sending twice", async () => {
      const { id } = await sentProposal();
      await expect(sendProposal(ctxA(), id)).rejects.toBeInstanceOf(ConflictError);
    });

    it("isolates workspaces", async () => {
      const { id } = await sentProposal();

      await expect(getProposal(orgB.id, id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(updateProposal(ctxB(), id, proposalInput(clientB))).rejects.toBeInstanceOf(NotFoundError);
      await expect(withdrawProposal(ctxB(), id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(createProposal(ctxA(), proposalInput(clientB))).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("public link", () => {
    it("hides drafts and unknown ids", async () => {
      const draftId = await createProposal(ctxA(), proposalInput(clientA));
      const draft = await getProposal(orgA.id, draftId);

      expect(await getPublicProposal(draft.publicId)).toBeNull();
      expect(await getPublicProposal("x".repeat(22))).toBeNull();
    });

    it("only resolves the intended proposal", async () => {
      const first = await sentProposal();
      await sentProposal();

      const proposal = await getPublicProposal(first.publicId);
      expect(proposal?.id).toBe(first.id);

      const altered = first.publicId.slice(0, -1) + (first.publicId.endsWith("A") ? "B" : "A");
      expect(await getPublicProposal(altered)).toBeNull();
    });

    it("marks the first view only", async () => {
      const { id, publicId } = await sentProposal();

      await markProposalViewed(publicId);
      await markProposalViewed(publicId);

      expect((await getProposal(orgA.id, id)).status).toBe("VIEWED");
      expect(await activityFor(id, "PROPOSAL_VIEWED")).toHaveLength(1);
    });

    it("records the signer and treats a repeat accept as success", async () => {
      const { id, publicId } = await sentProposal();

      await acceptProposal(publicId, "Jane Doe");
      await acceptProposal(publicId, "Jane Doe");

      const accepted = await activityFor(id, "PROPOSAL_ACCEPTED");
      expect(accepted).toHaveLength(1);
      expect(accepted[0]).toMatchObject({ actorType: "CLIENT", actorUserId: null });
      expect((await getPublicProposal(publicId))?.signerName).toBe("Jane Doe");
    });

    it("accepts exactly once when two responses race", async () => {
      const { id, publicId } = await sentProposal();

      await Promise.allSettled([acceptProposal(publicId, "Jane"), acceptProposal(publicId, "Sam")]);

      expect(await activityFor(id, "PROPOSAL_ACCEPTED")).toHaveLength(1);
    });

    it("closes the link after the first response", async () => {
      const declined = await sentProposal();
      await declineProposal(declined.publicId, "Over budget");
      await expect(acceptProposal(declined.publicId, "Jane")).rejects.toBeInstanceOf(ConflictError);

      const accepted = await sentProposal();
      await acceptProposal(accepted.publicId, "Jane");
      await expect(declineProposal(accepted.publicId, null)).rejects.toBeInstanceOf(ConflictError);

      const withdrawn = await sentProposal();
      await withdrawProposal(ctxA(), withdrawn.id);
      await expect(acceptProposal(withdrawn.publicId, "Jane")).rejects.toBeInstanceOf(ConflictError);
      expect(await getPublicProposal(withdrawn.publicId)).toBeNull();
    });
  });
});
