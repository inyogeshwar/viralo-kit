const DISCLOSURE_TEXT = "[Automated message — this is a bot, not a human]";

export function withBotDisclosure(text: string, enabled = true): string {
  if (!enabled) return text;
  return `${DISCLOSURE_TEXT}\n\n${text}`;
}

export function getDefaultDisclosure(accountName?: string): string {
  if (accountName) {
    return `[Automated message — you are interacting with ${accountName}'s bot]`;
  }
  return DISCLOSURE_TEXT;
}
