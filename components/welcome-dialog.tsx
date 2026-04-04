"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Markdown } from "@/components/markdown";

const STORAGE_KEY_PREFIX = "media-mapper-welcome-dismissed";

interface WelcomeDialogProps {
  title: string;
  body: string;
  version: string;
}

function useLocalStorage(key: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key]
  );
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const getServerSnapshot = useCallback(() => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function WelcomeDialog({
  title,
  body,
  version,
}: WelcomeDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}-${version}`;
  const dismissed = useLocalStorage(storageKey);
  const [closedThisSession, setClosedThisSession] = useState(false);
  const open = dismissed !== "true" && !closedThisSession;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, "true");
    }
    setClosedThisSession(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[550px] max-h-[85vh] flex flex-col gap-2 p-5"
        aria-describedby="welcome-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription
            id="welcome-dialog-description"
            className="sr-only"
          >
            Getting started information for this application
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex={0}
          role="region"
          aria-label="Getting started content"
        >
          <Markdown className="prose-headings:text-base prose-headings:mt-5 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1">
            {body}
          </Markdown>
        </div>

        <DialogFooter className="flex flex-row items-center sm:justify-between gap-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id="welcome-dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="welcome-dont-show"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Don&apos;t show this again
            </label>
          </div>
          <Button onClick={handleClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
