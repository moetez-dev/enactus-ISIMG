"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export function MemberCardPrintButton() {
  return (
    <Button
      variant="dark"
      className="w-full max-w-md py-4 print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print card
    </Button>
  );
}