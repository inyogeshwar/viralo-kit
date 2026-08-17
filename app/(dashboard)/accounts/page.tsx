import { CheckCircle2, Shield, XCircle } from "lucide-react";

import { AddAccountForm } from "@/components/add-account-form";
import { RemoveAccountButton } from "@/components/remove-account-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardContext } from "@/lib/context";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const permissions = [
  { scope: "instagram_business_basic", label: "View profile and access media", required: true },
  { scope: "instagram_content_publish", label: "Create and publish posts", required: true },
  { scope: "instagram_manage_insights", label: "Access analytics and insights", required: true },
];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const ctx = await getDashboardContext();
  const { accounts } = ctx;
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Connect and manage your Instagram accounts. Tokens are encrypted and stored server-side.
        </p>
      </div>

      {params.connected ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" /> Account connected successfully.
        </div>
      ) : null}
      {params.error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <XCircle className="size-4 shrink-0" /> {params.error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>Switch the active account from the top bar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No accounts yet. Connect one below.
              </p>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {account.profilePictureUrl ? (
                        <AvatarImage src={account.profilePictureUrl} alt={account.username ?? ""} />
                      ) : null}
                      <AvatarFallback>@</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        @{account.username ?? account.igUserId}
                        {account.isActive ? (
                          <Badge variant="success" className="ml-2">
                            active
                          </Badge>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID {account.igUserId} · {account.tokenType} · since {formatDate(account.createdAt.toISOString())}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Instagram</Badge>
                    <RemoveAccountButton accountId={account.id} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Permissions requested
            </CardTitle>
            <CardDescription>
              ViraloKit will request the following access when you connect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {permissions.map((perm) => (
              <div key={perm.scope} className="flex items-start gap-3 rounded-lg border p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">{perm.label}</p>
                  <p className="text-xs text-muted-foreground">{perm.scope}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Instagram will show a consent screen before granting access. You can revoke access anytime from your Instagram settings.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add an account</CardTitle>
          <CardDescription>
            Use OAuth for the proper flow, or paste a dev token for quick testing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
