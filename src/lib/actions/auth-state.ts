export type AuthActionState = {
  status: "idle" | "error" | "success";
  errorKey?: string;
  email?: string;
};

export const initialAuthActionState: AuthActionState = { status: "idle" };
