type AuthApiError = {
  code?: string;
  status?: number;
};

const messages = {
  network: "We couldn't reach the sign-in service. Please try again in a moment.",
  invalidCredentials: "Email or password is incorrect.",
  accountExists: "An account with this email already exists.",
  emailNotVerified: "Verify your email address before signing in.",
  passwordLength: "Use a password between 8 and 128 characters.",
  invalidCode: "That code isn't right. Check your email and try again.",
  expiredCode: "That code has expired. Request a new one.",
  tooManyAttempts: "Too many incorrect attempts. Request a new code.",
  rateLimited: "Too many attempts. Wait a moment and try again.",
  invalidResetLink: "This reset link is invalid or has expired. Request a new one.",
  fallback: "Something went wrong. Please try again.",
} as const;

export function authErrorMessage(error: AuthApiError): string {
  const code = error.code ?? "";

  if (code.startsWith("NETWORK_")) return messages.network;
  if (code === "INVALID_EMAIL_OR_PASSWORD") return messages.invalidCredentials;
  if (code.startsWith("USER_ALREADY_EXISTS")) return messages.accountExists;
  if (code.startsWith("EMAIL_NOT_VERIFIED")) return messages.emailNotVerified;
  if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") return messages.passwordLength;
  if (code === "INVALID_OTP") return messages.invalidCode;
  if (code === "OTP_EXPIRED" || code === "OTP_NOT_FOUND") return messages.expiredCode;
  if (code === "TOO_MANY_ATTEMPTS") return messages.tooManyAttempts;
  if (code === "INVALID_TOKEN" || code.includes("EXPIRED_TOKEN")) return messages.invalidResetLink;
  if (error.status === 429) return messages.rateLimited;

  return messages.fallback;
}
