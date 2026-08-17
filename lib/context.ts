import { auth, currentUser } from "@clerk/nextjs/server";

import { ensureWorkspace, getActiveAccount, listAccounts, type AccountRow, type Workspace } from "@/lib/workspace";

export interface DashboardContext {
  userId: string;
  workspace: Workspace;
  accounts: AccountRow[];
  activeAccount: AccountRow | null;
}

export async function getDashboardContext(): Promise<DashboardContext> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  const workspace = await ensureWorkspace(userId, {
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? user?.username ?? null,
    imageUrl: user?.imageUrl ?? null,
  });
  const accounts = await listAccounts(workspace.id);
  const activeAccount = await getActiveAccount(workspace.id);
  return { userId, workspace, accounts, activeAccount };
}
