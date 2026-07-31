import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button asChild variant="gradient" className="mt-6">
        <Link href="/">
          <Home className="size-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}
