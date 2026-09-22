"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createDraw } from "@/lib/actions/draws";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/** Admin form for creating a draft draw. Jackpot defaults to the carried rollover. */
export function DrawCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [drawDate, setDrawDate] = useState("");
  const [drawType, setDrawType] = useState("monthly");
  const [pool, setPool] = useState("");
  const [jackpot, setJackpot] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const poolNum = Number(pool);
    if (!Number.isInteger(poolNum) || poolNum < 0) {
      setMessage({ kind: "error", text: "Enter the prize pool in whole rupees." });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(drawDate)) {
      setMessage({ kind: "error", text: "Choose the draw date." });
      return;
    }

    startTransition(async () => {
      const result = await createDraw({
        draw_date: drawDate,
        draw_type: drawType,
        total_prize_pool: poolNum,
        ...(jackpot !== "" ? { jackpot_amount: Number(jackpot) } : {}),
      });
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Draw created." });
        setDrawDate("");
        setPool("");
        setJackpot("");
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Draw date" htmlFor="draw-date">
          <Input
            id="draw-date"
            type="date"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            required
          />
        </Field>
        <Field label="Type" htmlFor="draw-type">
          <select
            id="draw-type"
            value={drawType}
            onChange={(e) => setDrawType(e.target.value)}
            className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:border-brand-500"
          >
            <option value="monthly">Monthly</option>
            <option value="special">Special</option>
          </select>
        </Field>
        <Field label="Prize pool (₹)" htmlFor="draw-pool">
          <Input
            id="draw-pool"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="e.g. 10000"
            value={pool}
            onChange={(e) => setPool(e.target.value)}
            required
          />
        </Field>
        <Field
          label="Jackpot (₹)"
          htmlFor="draw-jackpot"
          hint="Leave blank to carry over"
        >
          <Input
            id="draw-jackpot"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="Auto"
            value={jackpot}
            onChange={(e) => setJackpot(e.target.value)}
          />
        </Field>
      </div>

      <Button type="submit" loading={pending}>
        <Plus className="size-4" aria-hidden />
        Create draft draw
      </Button>
    </form>
  );
}
