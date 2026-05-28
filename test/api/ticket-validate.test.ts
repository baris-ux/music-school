import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ticket/validate/[qrCode]/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    scanToken: {
      findUnique: vi.fn(),
    },
    ticket: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockFindScanToken = vi.mocked(prisma.scanToken.findUnique);
const mockFindTicket = vi.mocked(prisma.ticket.findUnique);
const mockUpdate = vi.mocked(prisma.ticket.update);

const VALID_SCAN_TOKEN = "valid-scan-token";
const EVENT_ID = "event-1";

const mockScanToken = {
  id: "st-1",
  token: VALID_SCAN_TOKEN,
  eventId: EVENT_ID,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  createdAt: new Date(),
};

const mockTicket = {
  id: "t-1",
  qrCode: "ABC123",
  usedAt: null,
  eventId: EVENT_ID,
  event: { id: EVENT_ID, title: "Concert de printemps" },
  order: { email: "client@test.com" },
};

function makeRequest(qrCode: string, scanToken?: string) {
  const url = scanToken
    ? `http://localhost/api/ticket/validate/${qrCode}?scanToken=${scanToken}`
    : `http://localhost/api/ticket/validate/${qrCode}`;
  return {
    request: new Request(url),
    context: { params: Promise.resolve({ qrCode }) },
  };
}

describe("GET /api/ticket/validate/[qrCode]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 401 si le scanToken est absent", async () => {
    const { request, context } = makeRequest("ABC123");
    const res = await GET(request, context);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.status).toBe("UNAUTHORIZED");
  });

  it("retourne 401 si le scanToken est invalide", async () => {
    mockFindScanToken.mockResolvedValue(null);
    const { request, context } = makeRequest("ABC123", "mauvais-token");
    const res = await GET(request, context);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.status).toBe("UNAUTHORIZED");
  });

  it("retourne 401 si le scanToken est expiré", async () => {
    mockFindScanToken.mockResolvedValue({
      ...mockScanToken,
      expiresAt: new Date(Date.now() - 1000),
    });
    const { request, context } = makeRequest("ABC123", VALID_SCAN_TOKEN);
    const res = await GET(request, context);
    expect(res.status).toBe(401);
  });

  it("retourne 404 si le billet est introuvable", async () => {
    mockFindScanToken.mockResolvedValue(mockScanToken);
    mockFindTicket.mockResolvedValue(null);
    const { request, context } = makeRequest("INCONNU", VALID_SCAN_TOKEN);
    const res = await GET(request, context);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe("INVALID");
  });

  it("retourne 409 si le billet a déjà été utilisé", async () => {
    mockFindScanToken.mockResolvedValue(mockScanToken);
    mockFindTicket.mockResolvedValue({
      ...mockTicket,
      usedAt: new Date("2025-01-01T10:00:00Z"),
    } as any);
    const { request, context } = makeRequest("ABC123", VALID_SCAN_TOKEN);
    const res = await GET(request, context);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.status).toBe("ALREADY_USED");
  });

  it("retourne 200 et marque le billet comme utilisé si valide", async () => {
    mockFindScanToken.mockResolvedValue(mockScanToken);
    mockFindTicket.mockResolvedValue(mockTicket as any);
    mockUpdate.mockResolvedValue({
      ...mockTicket,
      usedAt: new Date(),
    } as any);
    const { request, context } = makeRequest("ABC123", VALID_SCAN_TOKEN);
    const res = await GET(request, context);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("VALID");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { qrCode: "ABC123" } })
    );
  });

  it("retourne 500 en cas d'erreur inattendue", async () => {
    mockFindScanToken.mockRejectedValue(new Error("DB crash"));
    const { request, context } = makeRequest("ABC123", VALID_SCAN_TOKEN);
    const res = await GET(request, context);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.status).toBe("ERROR");
  });
});
