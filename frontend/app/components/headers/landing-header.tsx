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

export default function LandingHeader() {
  const right = (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
        Log in
      </Button>
      <Link href="/lobby">
        <Button size="sm">Get Started</Button>
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
