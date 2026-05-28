import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDestroy = vi.fn();
const mockGetIronSession = vi.hoisted(() => vi.fn());

vi.mock("iron-session", () => ({
  getIronSession: mockGetIronSession,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

import { getSession, clearSession } from "@/lib/session";

describe("lib/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("retourne null si aucun utilisateur en session", async () => {
      mockGetIronSession.mockResolvedValue({ user: undefined });
      const session = await getSession();
      expect(session).toBeNull();
    });

    it("retourne la session si un utilisateur ADMIN est présent", async () => {
      const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };
      mockGetIronSession.mockResolvedValue({ user });
      const session = await getSession();
      expect(session).toEqual(user);
    });

    it("retourne la session si un utilisateur STUDENT est présent", async () => {
      const user = { userId: "2", role: "STUDENT", email: "student@test.com" };
      mockGetIronSession.mockResolvedValue({ user });
      const session = await getSession();
      expect(session).toEqual(user);
    });
  });

  describe("clearSession", () => {
    it("appelle destroy sur la session", async () => {
      mockGetIronSession.mockResolvedValue({ user: undefined, destroy: mockDestroy });
      await clearSession();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });
});
