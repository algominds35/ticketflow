import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-tight">
          TicketFlow
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Modern IT helpdesk built natively for Slack. 
          <br />
          Manage tickets, collaborate with your team, and never leave Slack.
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">View Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

