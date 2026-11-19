"use client";

import { useState } from "react";
import { Settings, Globe, Map as MapIcon, Eye, EyeOff, Check, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MapSettings {
  useGoogleMaps: boolean;
  googleApiKey: string;
}

interface Props {
  value: MapSettings;
  onSave: (next: MapSettings) => void;
}

const PROVIDERS = [
  {
    id: "esri",
    google: false,
    icon: Globe,
    title: "Esri World Imagery",
    desc: "Free satellite imagery. No setup needed.",
  },
  {
    id: "google",
    google: true,
    icon: MapIcon,
    title: "Google Maps",
    desc: "High-resolution imagery. Requires an API key.",
  },
] as const;

export default function SettingsDialog({ value, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MapSettings>(value);
  const [showKey, setShowKey] = useState(false);

  const handleOpenChange = (next: boolean) => {
    // Start from the saved values every time the dialog opens; discard edits on cancel.
    if (next) {
      setDraft(value);
      setShowKey(false);
    }
    setOpen(next);
  };

  const keyMissing = draft.useGoogleMaps && draft.googleApiKey.trim() === "";
  const dirty =
    draft.useGoogleMaps !== value.useGoogleMaps || draft.googleApiKey !== value.googleApiKey;

  const handleSave = () => {
    onSave({ ...draft, googleApiKey: draft.googleApiKey.trim() });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon" title="Settings" />}>
        <Settings />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Choose the map provider used in the Flight Map view.</DialogDescription>
        </DialogHeader>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Map Provider
          </legend>
          <div role="radiogroup" className="grid gap-2">
            {PROVIDERS.map((p) => {
              const selected = draft.useGoogleMaps === p.google;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDraft((d) => ({ ...d, useGoogleMaps: p.google }))}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md",
                      selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    )}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {draft.useGoogleMaps && (
          <div className="grid gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
            <label htmlFor="api-key" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Google Maps API Key
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={draft.googleApiKey}
                onChange={(e) => setDraft((d) => ({ ...d, googleApiKey: e.target.value }))}
                placeholder="AIzaSy..."
                autoComplete="off"
                spellCheck={false}
                autoFocus
                aria-invalid={keyMissing || undefined}
                className="h-9 pl-8 pr-9 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowKey((s) => !s)}
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <p className={cn("text-xs", keyMissing ? "text-red-500 dark:text-red-400" : "text-muted-foreground")}>
              {keyMissing
                ? "An API key is required to use Google Maps."
                : "Stored locally on this device. Requires the Maps JavaScript API to be enabled."}
            </p>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave} disabled={keyMissing || !dirty}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
