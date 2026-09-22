"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteCropAction } from "@/lib/actions/crops";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteCropButton({ cropId, cropName }: { cropId: string; cropName: string }) {
  const t = useTranslations("Crops.detail");
  const deleteWithId = deleteCropAction.bind(null, cropId);

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="size-4" aria-hidden="true" />
        {t("delete")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteConfirmDescription", { name: cropName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <form action={deleteWithId}>
            <AlertDialogAction type="submit" variant="destructive" className="w-full">
              {t("confirmDelete")}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
