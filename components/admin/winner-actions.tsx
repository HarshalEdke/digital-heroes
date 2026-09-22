"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  approveWinner,
  markWinnerPaid,
  rejectWinner,
} from "@/lib/actions/winners";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/** Review actions for one winner row (admin-only, server-enforced). */
export function WinnerActions({
  winnerId,
  verificationStatus,
  payoutStatus,
}: {
  winnerId: string;
  verificationStatus: string | null;
  payoutStatus: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Done." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Something went wrong." });
      }
    });
  }

  const verification = verificationStatus ?? "pending";
  const payout = payoutStatus ?? "pending";
  const notPaid = payout !== "paid";

  return (
    <div className="space-y-2">
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {verification !== "approved" ? (
          <Button
            size="sm"
            loading={pending}
            onClick={() => run(() => approveWinner(winnerId))}
          >
            <Check className="size-4" aria-hidden />
            Approve
          </Button>
        ) : null}
        {verification !== "rejected" ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => run(() => rejectWinner(winnerId))}
          >
            <X className="size-4" aria-hidden />
            Reject
          </Button>
        ) : null}
        {verification === "approved" && notPaid ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => run(() => markWinnerPaid(winnerId))}
          >
            Mark paid
          </Button>
        ) : null}
      </div>
    </div>
  );
}
