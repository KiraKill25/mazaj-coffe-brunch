import { describe, expect, it } from "vitest";
import { clockRegister, resetToFactory, setPos, usePos } from "@/lib/pos";
void usePos;

describe("factory reset", () => {
  it("erases past days, sales, expenses and attendance", async () => {
    setPos((s) => ({ ...s, sessions: [{ id: "x", openedAt: 1, float: 0, closedAt: 2 }], sales: [{ num: 1, at: 1, type: "takeaway", method: "cash", total: 5, lines: [] }], expenses: [{ id: "e", at: 1, category: "x", label: "l", amount: 3 }], staff: ["Amina"], attendance: [{ id: "a", name: "Amina", in: 1, out: 2 }] }));
    resetToFactory();
    const s = JSON.parse(localStorage.getItem("pos-state-v2")!);
    expect(s.sessions).toEqual([]);
    expect(s.sales).toEqual([]);
    expect(s.expenses).toEqual([]);
    expect(s.attendance).toEqual([]);
    expect(s.staff).toEqual([]);
  });
});

describe("entry & exit register", () => {
  it("lists one entry and one exit per finished shift, newest first", () => {
    const r = clockRegister([{ id: "a", name: "Amina", in: 1000, out: 5000 }, { id: "b", name: "Sami", in: 3000 }]);
    expect(r.map((e) => `${e.name}:${e.kind}`)).toEqual(["Amina:out", "Sami:in", "Amina:in"]);
  });
});
