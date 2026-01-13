"use client"

import { Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ThemeSwitch from "@/app/components/landing/themeSwitch";

interface HeaderProps {
  variant?: 'landing' | 'lobby';
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  right?: React.ReactNode;
}

export default function Header({ variant = 'landing', subtitle, children, right }: HeaderProps) {
  const headerClass = 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60';

  return (
    <header className={headerClass}>
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="tracking-tight">Multiplayer Leetcode</span>
          {subtitle && (
            <>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <span className="text-muted-foreground font-medium text-base">{subtitle}</span>
            </>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">{children}</div>

        <div className="flex items-center gap-4">
          {right}
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
