"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MapPin } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/profile";
import { initialProfileActionState } from "@/lib/actions/profile-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationSearch } from "./location-search";
import type { GeocodingResult } from "@/lib/geocoding";

export type ProfileFormData = {
  fullName: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  farmSizeAcres: string;
  preferredLanguage: "en" | "te";
};

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export function ProfileForm({ initial }: { initial: ProfileFormData }) {
  const t = useTranslations("Profile");
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialProfileActionState,
  );
  const [location, setLocation] = useState({
    village: initial.village,
    district: initial.district,
    state: initial.state,
    latitude: initial.latitude,
    longitude: initial.longitude,
  });

  function handleLocationSelect(result: GeocodingResult) {
    setLocation({
      village: result.name,
      district: result.admin2 ?? "",
      state: result.admin1 ?? "",
      latitude: result.latitude,
      longitude: result.longitude,
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "success" && (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{t("saved")}</AlertDescription>
        </Alert>
      )}
      {state.status === "error" && state.errorKey && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.errorKey}`)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone}
          placeholder={t("phonePlaceholder")}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-border p-4">
        <Label>{t("locationSearchLabel")}</Label>
        <LocationSearch onSelect={handleLocationSelect} />
        <p className="text-xs text-muted-foreground">{t("locationSearchHelp")}</p>

        {location.village ? (
          <p className="flex items-center gap-1.5 text-sm">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {[location.village, location.district, location.state].filter(Boolean).join(", ")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noLocationSet")}</p>
        )}

        <input type="hidden" name="village" value={location.village} />
        <input type="hidden" name="district" value={location.district} />
        <input type="hidden" name="state" value={location.state} />
        <input type="hidden" name="latitude" value={location.latitude ?? ""} />
        <input type="hidden" name="longitude" value={location.longitude ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="farmSizeAcres">{t("farmSize")}</Label>
        <Input
          id="farmSizeAcres"
          name="farmSizeAcres"
          type="number"
          min="0"
          step="0.1"
          defaultValue={initial.farmSizeAcres}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredLanguage">{t("preferredLanguage")}</Label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          defaultValue={initial.preferredLanguage}
          className={selectClassName}
        >
          <option value="en">English</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
