"use client";

import Header from "@/app/components/headers/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SessionHeader() {
  const right = (
    <div className="flex items-center gap-3">
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Leave
        </Button>
      </Link>
    </div>
  );

  return (
    <Header
      variant="lobby"
      subtitle={<span className="text-muted-foreground font-medium text-base">Session</span>}
      right={right}
    >
    </Header>
  );
}
