import {
  FileSignature,
  FolderKanban,
  Inbox,
  PanelsTopLeft,
  Receipt,
  UserCheck,
} from "lucide-react";

import type { Guide } from "@/components/marketing/resources/guides/guides";

export const qualifyALead: Guide = {
  slug: "qualify-a-lead",
  title: "Qualify a new lead in five minutes",
  summary:
    "A short, repeatable check that tells you which enquiries deserve a proposal and which deserve a polite no.",
  stage: "leads",
  readMinutes: 4,
  icon: Inbox,
  tone: "brand",
  takeaways: [
    "Capture every enquiry in one place the moment it arrives.",
    "Qualify on fit, budget, and timing before you write anything.",
    "Record a next step and a date, every time.",
  ],
  sections: [
    {
      id: "capture-first",
      heading: "Capture first, judge later",
      body: [
        "Leads arrive through email, referrals, social messages, and your website. If they live in five inboxes, some of them go cold before you ever reply.",
        "Add each enquiry as a lead as soon as it lands, with the source and the service they asked about. It takes a minute, and it means nothing slips through while you decide.",
      ],
    },
    {
      id: "three-questions",
      heading: "Ask three questions",
      body: [
        "Most enquiries can be qualified with three answers. You rarely need a long discovery call to get them; a short reply by email is usually enough.",
      ],
      checklist: [
        "Fit: is this work you do well and want more of?",
        "Budget: is there an estimated value that makes the work worthwhile?",
        "Timing: do they need it when you can actually deliver it?",
      ],
    },
    {
      id: "move-the-status",
      heading: "Move the status honestly",
      body: [
        "Once you have answers, move the lead from New to Qualified, or mark it Lost with a note on why. A pipeline full of maybes hides the leads that need your attention.",
        "Add the estimated value while you are there. It turns your pipeline into a realistic view of the work ahead.",
      ],
    },
    {
      id: "next-step",
      heading: "Always leave a next step",
      body: [
        "Before you close the lead, write down what happens next and when you last made contact. When you come back in a week, you will know exactly where things stand.",
      ],
    },
  ],
  product: { label: "See how leads work", href: "/product/leads" },
};

export const convertLeadToClient: Guide = {
  slug: "convert-lead-to-client",
  title: "Turn a won lead into a client without retyping",
  summary:
    "The moment a lead says yes, set up a client record that everything else — proposals, projects, invoices — can hang from.",
  stage: "clients",
  readMinutes: 4,
  icon: UserCheck,
  tone: "violet",
  takeaways: [
    "Convert the lead instead of creating a client from scratch.",
    "Add every person you will work with as a contact.",
    "Keep private notes private: clients never see them.",
  ],
  sections: [
    {
      id: "convert-dont-copy",
      heading: "Convert, don't copy",
      body: [
        "Copying details from a lead into a new client record is where typos and missing emails creep in. Converting the lead carries its details across in one step and marks the lead as won.",
        "Either the whole conversion succeeds or none of it does, so you never end up with half a client and a lead that still looks open.",
      ],
    },
    {
      id: "add-contacts",
      heading: "Add the people, not just the company",
      body: [
        "Most clients involve more than one person: the one who signs, the one who approves, the one who sends files. Add each of them as a contact and mark one as primary.",
      ],
      checklist: [
        "Primary contact for approvals and invoices",
        "Day-to-day contact for questions and files",
        "Role and email for everyone you will write to",
      ],
    },
    {
      id: "one-record",
      heading: "Make it the single record",
      body: [
        "From here on, proposals, projects, invoices, files, and messages all belong to this client. When you open the record, the whole relationship is in one place.",
        "Use notes for context only you should see, such as how they found you or what they are sensitive about. Notes never appear in the client's portal.",
      ],
    },
  ],
  product: { label: "See how clients work", href: "/product/clients" },
};

export const writeAWinningProposal: Guide = {
  slug: "write-a-winning-proposal",
  title: "Write a proposal clients say yes to",
  summary:
    "Structure, pricing, and follow-up for proposals that read like a plan, not a price list — and get accepted online.",
  stage: "proposals",
  readMinutes: 6,
  icon: FileSignature,
  tone: "amber",
  featured: true,
  takeaways: [
    "Lead with their problem, not your process.",
    "Make scope and deliverables specific enough to say no to.",
    "Set an expiry date and follow up when the proposal is viewed.",
  ],
  sections: [
    {
      id: "open-with-them",
      heading: "Open with their problem",
      body: [
        "The introduction is the part everyone reads. Use it to restate what the client told you they need, in their words. It shows you listened before you quote anything.",
      ],
    },
    {
      id: "scope-and-deliverables",
      heading: "Be specific about scope",
      body: [
        "Vague scope is how projects grow without the budget growing with them. Separate scope (what you will do) from deliverables (what they will receive), and list both plainly.",
      ],
      checklist: [
        "Introduction in the client's own terms",
        "Scope: the work included, and what is not",
        "Deliverables: what they receive at the end",
        "Timeline: phases and rough dates",
        "Pricing and terms, stated once and clearly",
      ],
    },
    {
      id: "price-with-confidence",
      heading: "Price with confidence",
      body: [
        "Show the total, the currency, and any discount or tax clearly. Clients hesitate when they have to work out the number themselves.",
        "If you offer options, keep them to two or three and make the difference between them obvious.",
      ],
    },
    {
      id: "send-and-follow-up",
      heading: "Send it, then follow up at the right moment",
      body: [
        "Send the proposal as a link the client can open anywhere and accept online. Set an expiry date so the decision has a natural deadline.",
        "You will see when the proposal has been viewed. That is the best moment for a short, friendly check-in, not a week later when it has been forgotten.",
      ],
    },
  ],
  product: { label: "See how proposals work", href: "/product/proposals" },
};

export const planProjectsInMilestones: Guide = {
  slug: "plan-projects-in-milestones",
  title: "Plan a project in milestones clients can follow",
  summary:
    "Break accepted work into a handful of clear milestones so progress is visible without a single status call.",
  stage: "projects",
  readMinutes: 5,
  icon: FolderKanban,
  tone: "emerald",
  takeaways: [
    "Start the project from the accepted proposal.",
    "Use four to seven milestones, each with a clear finish line.",
    "Progress updates itself as milestones are completed.",
  ],
  sections: [
    {
      id: "start-from-proposal",
      heading: "Start from what was agreed",
      body: [
        "Create the project from the accepted proposal so the client, budget, and scope carry across. Everyone starts from the same agreement.",
      ],
    },
    {
      id: "right-sized-milestones",
      heading: "Right-size your milestones",
      body: [
        "Too few milestones and progress looks stuck for weeks. Too many and the list becomes a task tracker. Four to seven milestones suit most projects.",
      ],
      checklist: [
        "Name each one after an outcome, not an activity",
        "Give each a due date the client can plan around",
        "Order them the way the work will really happen",
      ],
    },
    {
      id: "progress-that-updates",
      heading: "Let progress speak for itself",
      body: [
        "Project progress is calculated from completed milestones. Mark one complete and the progress moves forward for you and for your client at the same time.",
        "When a milestone slips, update its date rather than leaving it overdue. An honest plan builds more trust than a perfect-looking one.",
      ],
    },
  ],
  product: { label: "See how projects work", href: "/#projects" },
};

export const setUpClientPortal: Guide = {
  slug: "set-up-client-portal",
  title: "Set up a client portal your clients actually use",
  summary:
    "Invite clients to one private space for progress, files, messages, and invoices — and make it the place they check first.",
  stage: "portal",
  readMinutes: 5,
  icon: PanelsTopLeft,
  tone: "rose",
  takeaways: [
    "Invite the client as soon as the project starts.",
    "Share every deliverable and update through the portal.",
    "Clients only ever see their own work.",
  ],
  sections: [
    {
      id: "invite-early",
      heading: "Invite them on day one",
      body: [
        "Send the portal invitation when the project starts, not when the first file is ready. An empty portal with a clear plan is more reassuring than silence.",
        "Clients don't pay for anything and don't need to set up a workspace. They get secure access to their own portal from the invitation.",
      ],
    },
    {
      id: "what-they-see",
      heading: "Know what they can and can't see",
      body: [
        "Clients see their projects, milestones, progress, invoices, files, and messages. Your internal notes, leads, other clients, and settings stay private to you.",
      ],
      checklist: [
        "Projects, milestones, and progress",
        "Files you have shared with them",
        "Messages about their work",
        "Invoices and what is still due",
      ],
    },
    {
      id: "make-it-the-habit",
      heading: "Make it the habit",
      body: [
        "The portal works when it is the one place things happen. Share files there instead of attaching them to email, and answer questions in the project's messages so decisions sit next to the work.",
        "After a few weeks, clients stop asking for updates, because they already know where to look.",
      ],
    },
  ],
  product: { label: "See the client portal", href: "/product/client-portal" },
};

export const invoiceAndGetPaid: Guide = {
  slug: "invoice-and-get-paid",
  title: "Invoice on time and follow up without awkwardness",
  summary:
    "Send clear invoices, know what is outstanding at a glance, and follow up on late payments in a way that keeps the relationship intact.",
  stage: "invoices",
  readMinutes: 5,
  icon: Receipt,
  tone: "brand",
  takeaways: [
    "Invoice the day a milestone is delivered.",
    "Clear line items and a due date prevent most late payments.",
    "Record payments as they arrive so balances stay accurate.",
  ],
  sections: [
    {
      id: "invoice-promptly",
      heading: "Invoice while the work is fresh",
      body: [
        "The best time to invoice is the day the work is delivered, while the value is obvious. Link the invoice to the project so it sits alongside the milestones it pays for.",
      ],
    },
    {
      id: "clear-invoices",
      heading: "Make the invoice impossible to misread",
      body: [
        "Each invoice gets its own number, and the client can open it from a link. Clear line items answer questions before they are asked.",
      ],
      checklist: [
        "One line per deliverable or phase",
        "Currency, discount, and tax shown clearly",
        "A due date, not just an issue date",
        "Payment instructions in the notes",
      ],
    },
    {
      id: "track-and-record",
      heading: "Track what is outstanding",
      body: [
        "You will see when an invoice has been viewed and when it becomes overdue. When a payment arrives, record it against the invoice, including partial payments, so the remaining balance is always right.",
        "Clients can't pay online inside ClientVero yet, so include your usual payment details on every invoice.",
      ],
    },
    {
      id: "follow-up",
      heading: "Follow up like a professional",
      body: [
        "A late invoice is usually forgotten, not disputed. Send a short, friendly note on the due date, then again a week later, and keep each one factual: the invoice number, the amount, and the date it was due.",
      ],
    },
  ],
  product: { label: "See how invoices work", href: "/product/invoices" },
};
