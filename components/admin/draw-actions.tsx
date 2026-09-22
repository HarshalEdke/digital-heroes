"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dices, Send, CheckCircle2, Trash2 } from "lucide-react";
import {
  completeDraw,
  deleteDraw,
  publishDraw,
  simulateDraw,
} from "@/lib/actions/draws";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { Draw } from "@/lib/database.types";

/** Lifecycle actions for one draw row (admin-only, server-enforced). */
export function DrawActions({ draw }: { draw: Draw }) {
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

  const status = draw.status;
  const canSimulate = status === "draft" || status === "simulated";
  const canPublish = status === "simulated";
  const canComplete = status === "published";
  const canDelete = status === "draft" || status === "simulated";

  return (
    <div className="space-y-2">
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canSimulate ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => run(() => simulateDraw(draw.id))}
          >
            <Dices className="size-4" aria-hidden />
            {status === "simulated" ? "Re-simulate" : "Simulate"}
          </Button>
        ) : null}
        {canPublish ? (
          <Button size="sm" loading={pending} onClick={() => run(() => publishDraw(draw.id))}>
            <Send className="size-4" aria-hidden />
            Publish
          </Button>
        ) : null}
        {canComplete ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => run(() => completeDraw(draw.id))}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Mark completed
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            size="sm"
            variant="ghost"
            loading={pending}
            className="text-red-600 hover:bg-red-50"
            onClick={() => run(() => deleteDraw(draw.id))}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
