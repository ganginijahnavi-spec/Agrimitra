export type CropActionState = {
  status: "idle" | "error";
  fieldErrors?: Record<string, string[] | undefined>;
  errorMessage?: "unauthorized" | "generic";
};

export const initialCropActionState: CropActionState = { status: "idle" };
