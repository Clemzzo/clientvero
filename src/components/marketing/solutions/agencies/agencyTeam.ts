import type { StaticImageData } from "next/image";

import deeAvatar from "@/assets/images/dk.png";
import oliviaAvatar from "@/assets/images/olivia.png";
import sarahAvatar from "@/assets/images/sarah.png";
import tomAvatar from "@/assets/images/tom.png";

export type TeamMember = {
  id: "olivia" | "tom" | "sarah" | "dee";
  name: string;
  title: string;
  role: "Owner" | "Admin" | "Member";
  avatar: StaticImageData;
};

export const agencyTeam: TeamMember[] = [
  { id: "olivia", name: "Olivia Grant", title: "Creative director", role: "Owner", avatar: oliviaAvatar },
  { id: "dee", name: "Dee Kim", title: "Account manager", role: "Admin", avatar: deeAvatar },
  { id: "tom", name: "Tom Reyes", title: "Designer", role: "Member", avatar: tomAvatar },
  { id: "sarah", name: "Sarah Lin", title: "Developer", role: "Member", avatar: sarahAvatar },
];

export function teamMember(id: TeamMember["id"]): TeamMember {
  const member = agencyTeam.find((person) => person.id === id);

  if (!member) {
    throw new Error(`Unknown team member: ${id}`);
  }

  return member;
}
