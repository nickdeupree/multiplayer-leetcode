import Header from "./header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Github } from "lucide-react";

export default function LandingHeader() {
  const right = (
    <div className="flex items-center gap-4">
      <Link href="https://github.com/nickdeupree/multiplayer-leetcode" target="_blank">
        <Button variant="ghost" size="icon">
          <Github className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );

  return (
    <Header variant="landing" right={right}>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="#features">Features</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#"
              className={navigationMenuTriggerStyle()}
            >
              Problems
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Header>
  );
}
