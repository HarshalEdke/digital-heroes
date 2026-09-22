"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Ban } from "lucide-react";
import { cancelSubscription, startSubscription } from "@/lib/actions/subscription";
import type { PlanId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/** Subscribe / cancel buttons wired to server actions. */
export function PlanActions({
  plan,
  hasActive,
}: {
  plan: PlanId;
  hasActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function subscribe() {
    setMessage(null);
    startTransition(async () => {
      const result = await startSubscription(plan);
      if (result.ok) {
        if (result.data?.redirectUrl) {
          window.location.href = result.data.redirectUrl;
          return;
        }
        setMessage({ kind: "success", text: result.message ?? "Subscribed." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function cancel() {
    setMessage(null);
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Cancelled." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-3">
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      {hasActive ? (
        <Button variant="secondary" onClick={cancel} loading={pending} type="button">
          <Ban className="size-4" aria-hidden />
          Cancel subscription
        </Button>
      ) : (
        <Button onClick={subscribe} loading={pending} type="button">
          <CreditCard className="size-4" aria-hidden />
          Choose {plan === "monthly" ? "monthly" : "yearly"} plan
        </Button>
      )}
    </div>
  );
}
