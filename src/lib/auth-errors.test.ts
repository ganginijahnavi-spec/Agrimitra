import { describe, expect, it } from "vitest";
import { mapAuthErrorToKey } from "./auth-errors";

describe("mapAuthErrorToKey", () => {
  it("maps invalid login credentials", () => {
    expect(mapAuthErrorToKey("Invalid login credentials")).toBe("invalidCredentials");
  });

  it("maps unconfirmed email, case-insensitively", () => {
    expect(mapAuthErrorToKey("Email Not Confirmed")).toBe("emailNotConfirmed");
  });

  it("maps an already-registered email", () => {
    expect(mapAuthErrorToKey("User already registered")).toBe("emailInUse");
  });

  it("maps an already-exists email", () => {
    expect(mapAuthErrorToKey("A user with this email address has already exists")).toBe(
      "emailInUse",
    );
  });

  it("maps a weak password message requiring both keywords", () => {
    expect(mapAuthErrorToKey("Password should be at least 6 characters")).toBe("weakPassword");
  });

  it("does not map a password-related message missing the 6-characters phrase", () => {
    expect(mapAuthErrorToKey("Password is required")).toBe("generic");
  });

  it("falls back to generic for an unrecognized message", () => {
    expect(mapAuthErrorToKey("Something completely unexpected happened")).toBe("generic");
  });
});
