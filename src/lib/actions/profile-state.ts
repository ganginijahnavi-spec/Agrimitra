export type ProfileActionState = {
  status: "idle" | "error" | "success";
  errorKey?: "unauthorized" | "generic";
};

export const initialProfileActionState: ProfileActionState = { status: "idle" };
