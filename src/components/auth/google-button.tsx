"use client";

import { signInWithGoogleAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";

export function GoogleButton({ label }: { label: string }) {
  return (
    <form action={signInWithGoogleAction}>
      <Button type="submit" variant="outline" className="w-full gap-2">
        <GoogleIcon className="size-4" />
        {label}
      </Button>
    </form>
  );
}
