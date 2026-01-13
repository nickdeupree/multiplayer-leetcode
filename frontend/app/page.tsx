import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Code2, Users2, Zap, MessageSquare, Trophy, Layout, ChevronRight, Github } from "lucide-react";
import Link from "next/link";
import LandingHeader from "@/app/components/headers/landing-header";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32 px-4">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            Alpha Release - Now Open!
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Master Leetcode <span className="text-primary italic">Together</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Stop struggling alone. Collaborate on coding problems in real-time, share insights, and accelerate your path to a top-tier tech career.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/lobby" className="inline-block">
              <Button size="lg" className="px-8 flex gap-2">
                Start a Session <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Browse Problems
            </Button>
          </div>
          <div className="w-full max-w-5xl rounded-xl border bg-card p-2 shadow-2xl">
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-2">
                <Code2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">Interactive Coding Environment Preview</p>
              </div>
            </AspectRatio>
          </div>
        </section>

        <Separator className="w-full opacity-50" />

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="w-full px-4">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
                Built for Collaborative Learning
              </h2>
              <Separator className="w-20 h-1 bg-primary rounded-full mx-auto" />
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to tackle complex algorithms with your peers in one unified platform.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-time Sync</CardTitle>
                  <CardDescription>
                    See your teammates' cursors and code changes instantly. It's like Google Docs, but for code.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Integrated Chat</CardTitle>
                  <CardDescription>
                    Discuss strategies, explain complex logic, and debug together with built-in text and voice tools.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Layout className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Shared Runner</CardTitle>
                  <CardDescription>
                    Submit code together. Everyone sees the execution results and test case outcomes in real-time.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Fast Execution</CardTitle>
                  <CardDescription>
                    Our high-performance executor ensures your code runs lightning fast across 20+ languages.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Group Progress</CardTitle>
                  <CardDescription>
                    Track your collective success, earn shared badges, and rise through the global rankings together.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col border-2 transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart IDE</CardTitle>
                  <CardDescription>
                    Enjoy autocomplete, linting, and multi-language support designed specifically for Leetcode challenges.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-50 dark:bg-slate-900/40 border-y">
          <div className="w-full py-24 md:py-32 text-center px-4">
            <div className="mx-auto max-w-[58rem] space-y-6">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                Level up your coding interviews
              </h2>
              <p className="text-muted-foreground sm:text-xl">
                Ready to stop practicing in isolation? Join the collaborative coding revolution today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button size="lg" className="px-12 h-12 text-lg">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" className="px-12 h-12 text-lg border-2">
                  <Github className="mr-2 h-5 w-5" /> GitHub
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4">
        <div className="w-full flex flex-col items-center justify-between gap-6 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Code2 className="h-5 w-5 text-primary" />
            <span>Multiplayer Leetcode</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Built with ❤️ using Next.js and Shadcn UI. © 2026.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


