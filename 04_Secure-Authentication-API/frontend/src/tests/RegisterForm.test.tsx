import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/features/auth/RegisterForm";

describe("RegisterForm", () => {
  it("calls onSubmit with the entered email and password", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password/i), "a-valid-password");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith("alice@example.com", "a-valid-password"),
    );
  });

  it("shows a validation error and does not submit when the password is too short", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password/i), "short");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8 characters/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the server error message when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Email already registered"));
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password/i), "a-valid-password");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email already registered");
  });
});
