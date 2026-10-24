function version(key: string) {
  return key.slice(key.lastIndexOf("/") + 1);
}

export function avatarSrc(userId: string, avatarKey: string | null): string | null {
  return avatarKey ? `/dashboard/team/${userId}/avatar?v=${version(avatarKey)}` : null;
}

export function logoSrc(slug: string, logoKey: string | null): string | null {
  return logoKey ? `/brand/${slug}/logo?v=${version(logoKey)}` : null;
}
