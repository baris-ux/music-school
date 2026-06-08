import QRCode from "qrcode";
import { PDFDocument, PDFPage, StandardFonts, PDFFont, rgb } from "pdf-lib";

// ─── Shared page renderer ─────────────────────────────────────────────────────

type TicketPageOptions = {
  pdfDoc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  qrCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  buyerLine1: string;
  buyerLine2?: string;
};

async function drawTicketPage({
  pdfDoc, page, font, bold,
  qrCode, eventTitle, eventDate, eventLocation, buyerLine1, buyerLine2,
}: TicketPageOptions): Promise<void> {
  const { width, height } = page.getSize(); // 595 × 842

  // Palette
  const navy     = rgb(0.05, 0.10, 0.24);
  const navyDeep = rgb(0.03, 0.06, 0.15);
  const gold     = rgb(0.80, 0.61, 0.19);
  const white    = rgb(1, 1, 1);
  const offWhite = rgb(0.97, 0.97, 0.98);
  const silver   = rgb(0.86, 0.88, 0.93);
  const muted    = rgb(0.52, 0.56, 0.65);
  const dark     = rgb(0.10, 0.12, 0.20);

  // Card bounds
  const cx = 35, cy = 55;
  const cw = 525, ch = 732;
  const ctop = cy + ch; // 787

  // Section heights
  const headerH  = 270;
  const tearH    = 130;
  const headerY  = ctop - headerH; // 517 — bottom edge of header
  const tearTopY = cy + tearH;     // 185 — top edge of tear

  // ── Page background ────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: offWhite });

  // Card shadow
  page.drawRectangle({
    x: cx + 6, y: cy - 6, width: cw, height: ch,
    color: rgb(0.72, 0.74, 0.80), opacity: 0.28,
  });

  // Card base
  page.drawRectangle({
    x: cx, y: cy, width: cw, height: ch,
    color: white, borderColor: silver, borderWidth: 0.5,
  });

  // ── HEADER ─────────────────────────────────────────────────────────────────
  page.drawRectangle({ x: cx, y: headerY, width: cw, height: headerH, color: navy });

  // Thin dark strip at very top (depth)
  page.drawRectangle({ x: cx, y: ctop - 10, width: cw, height: 10, color: navyDeep });

  // Gold left accent
  page.drawRectangle({ x: cx, y: headerY, width: 7, height: headerH, color: gold });

  // Decorative circles (top-right, subtle white)
  page.drawCircle({ x: cx + cw + 5,  y: ctop + 5,  size: 130, color: white, opacity: 0.04 });
  page.drawCircle({ x: cx + cw - 20, y: ctop - 20, size: 80,  color: white, opacity: 0.04 });

  // School name
  page.drawText("ÉCOLE DE MUSIQUE", {
    x: cx + 24, y: ctop - 34,
    size: 9.5, font: bold,
    color: rgb(0.70, 0.76, 0.91),
  });

  // "BILLET OFFICIEL" badge
  const bW = 118, bH = 24;
  const bX = cx + cw - bW - 20;
  const bY = ctop - 42;
  page.drawRectangle({ x: bX, y: bY, width: bW, height: bH, color: gold });
  page.drawText("BILLET OFFICIEL", {
    x: bX + 13, y: bY + 7.5,
    size: 8.5, font: bold, color: navy,
  });

  // Event title
  const titleSize = eventTitle.length > 30 ? (eventTitle.length > 45 ? 20 : 24) : 28;
  page.drawText(eventTitle.toUpperCase(), {
    x: cx + 24, y: headerY + 162,
    size: titleSize, font: bold, color: white,
    maxWidth: cw - 50,
    lineHeight: titleSize * 1.3,
  });

  // Gold rule + faded extension
  page.drawRectangle({ x: cx + 24, y: headerY + 140, width: 58, height: 3, color: gold });
  page.drawRectangle({ x: cx + 88, y: headerY + 141, width: 190, height: 1, color: white, opacity: 0.15 });

  // Date in header
  page.drawText(eventDate, {
    x: cx + 24, y: headerY + 112,
    size: 11, font, color: rgb(0.74, 0.79, 0.92),
    maxWidth: cw - 50,
  });

  // Location in header
  page.drawText(eventLocation, {
    x: cx + 24, y: headerY + 89,
    size: 10.5, font, color: rgb(0.58, 0.64, 0.80),
    maxWidth: cw - 50,
  });

  // ── BODY ───────────────────────────────────────────────────────────────────
  const infoX    = cx + 24;
  const infoTopY = headerY - 50;

  // DATE
  page.drawText("DATE", {
    x: infoX, y: infoTopY,
    size: 8, font: bold, color: muted,
  });
  page.drawText(eventDate, {
    x: infoX, y: infoTopY - 17,
    size: 12, font: bold, color: dark, maxWidth: 265,
  });
  page.drawLine({
    start: { x: infoX, y: infoTopY - 40 },
    end:   { x: infoX + 258, y: infoTopY - 40 },
    thickness: 0.5, color: silver,
  });

  // LIEU
  page.drawText("LIEU", {
    x: infoX, y: infoTopY - 58,
    size: 8, font: bold, color: muted,
  });
  page.drawText(eventLocation, {
    x: infoX, y: infoTopY - 75,
    size: 12, font: bold, color: dark, maxWidth: 265,
  });
  page.drawLine({
    start: { x: infoX, y: infoTopY - 98 },
    end:   { x: infoX + 258, y: infoTopY - 98 },
    thickness: 0.5, color: silver,
  });

  // ACHETEUR / BILLET PAPIER
  const buyerLabel = buyerLine2 ? "BILLET PAPIER" : "ACHETEUR";
  page.drawText(buyerLabel, {
    x: infoX, y: infoTopY - 116,
    size: 8, font: bold, color: muted,
  });
  page.drawText(buyerLine1, {
    x: infoX, y: infoTopY - 133,
    size: 11, font: buyerLine2 ? bold : font, color: dark, maxWidth: 265,
  });
  if (buyerLine2) {
    page.drawText(buyerLine2, {
      x: infoX, y: infoTopY - 150,
      size: 11, font, color: muted, maxWidth: 265,
    });
  }

  // ── QR CODE BOX ────────────────────────────────────────────────────────────
  const qrSize = 160;
  const qrPad  = 14;
  const qrBW   = qrSize + qrPad * 2;
  const qrBH   = qrSize + qrPad * 2 + 28;
  const qrBX   = cx + cw - qrBW - 22;
  const bodyMid = tearTopY + (headerY - tearTopY) / 2;
  const qrBY   = bodyMid - qrBH / 2;

  // Box shadow
  page.drawRectangle({
    x: qrBX + 4, y: qrBY - 4, width: qrBW, height: qrBH,
    color: rgb(0.78, 0.80, 0.87), opacity: 0.28,
  });

  // Box
  page.drawRectangle({
    x: qrBX, y: qrBY, width: qrBW, height: qrBH,
    color: white, borderColor: silver, borderWidth: 1,
  });

  // Gold top accent on box
  page.drawRectangle({ x: qrBX, y: qrBY + qrBH - 4, width: qrBW, height: 4, color: gold });

  // Label
  page.drawText("SCAN D'ACCÈS", {
    x: qrBX + qrPad, y: qrBY + qrBH - 20,
    size: 8.5, font: bold, color: navy,
  });

  // QR image
  const qrDataUrl = await QRCode.toDataURL(qrCode, {
    width: 500, margin: 1,
    color: { dark: "#0D1A3C", light: "#FFFFFF" },
  });
  const qrBytes = Uint8Array.from(Buffer.from(qrDataUrl.split(",")[1], "base64"));
  const qrImage = await pdfDoc.embedPng(qrBytes);
  page.drawImage(qrImage, { x: qrBX + qrPad, y: qrBY + qrPad, width: qrSize, height: qrSize });

  // ── TEAR / FOOTER ──────────────────────────────────────────────────────────
  page.drawRectangle({
    x: cx, y: cy, width: cw, height: tearH,
    color: rgb(0.95, 0.96, 0.97),
  });

  // Perforated line
  for (let i = 0; i < 50; i++) {
    page.drawLine({
      start: { x: cx + 14 + i * 10, y: tearTopY },
      end:   { x: cx + 20 + i * 10, y: tearTopY },
      thickness: 1.2, color: silver,
    });
  }
  page.drawCircle({ x: cx,      y: tearTopY, size: 9, color: offWhite, borderColor: silver, borderWidth: 0.8 });
  page.drawCircle({ x: cx + cw, y: tearTopY, size: 9, color: offWhite, borderColor: silver, borderWidth: 0.8 });

  // Code label
  page.drawText("CODE DE SÉCURITÉ", {
    x: cx + 24, y: tearTopY - 28,
    size: 8, font: bold, color: muted,
  });

  // Code value
  page.drawRectangle({
    x: cx + 24, y: tearTopY - 54, width: cw - 48, height: 22,
    color: rgb(0.91, 0.92, 0.96),
  });
  page.drawText(qrCode, {
    x: cx + 32, y: tearTopY - 45,
    size: 8.5, font: bold, color: navy,
  });

  // Fine print
  page.drawText(
    "Ce billet est personnel, unique et valable une seule fois. Conservez-le jusqu'à votre entrée.",
    {
      x: cx + 24, y: tearTopY - 74,
      size: 8, font, color: muted,
      maxWidth: cw - 48, lineHeight: 12,
    }
  );

  // Footer rule
  page.drawLine({
    start: { x: cx + 24, y: cy + 24 },
    end:   { x: cx + cw - 24, y: cy + 24 },
    thickness: 0.5, color: silver,
  });
  page.drawText("École de Musique", {
    x: cx + 24, y: cy + 10,
    size: 8.5, font: bold, color: navy,
  });
  page.drawText("Billet numérique sécurisé", {
    x: cx + cw - 148, y: cy + 10,
    size: 8.5, font, color: muted,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

type GenerateTicketPdfParams = {
  qrCode: string;
  eventTitle?: string;
  buyerEmail: string;
  eventDate?: string;
  eventLocation?: string;
};

export async function generateTicketPdf({
  qrCode,
  eventTitle = "Concert de l'école",
  buyerEmail,
  eventDate = "Samedi 15 juin 2026 · 20:00",
  eventLocation = "Salle de spectacle",
}: GenerateTicketPdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595, 842]);
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  await drawTicketPage({
    pdfDoc, page, font, bold,
    qrCode, eventTitle, eventDate, eventLocation,
    buyerLine1: buyerEmail,
  });

  return await pdfDoc.save();
}

type PaperTicketsBatchParams = {
  qrCodes: string[];
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventPrice: number;
};

export async function generatePaperTicketsBatchPdf({
  qrCodes,
  eventTitle,
  eventDate,
  eventLocation,
  eventPrice,
}: PaperTicketsBatchParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < qrCodes.length; i++) {
    const page = pdfDoc.addPage([595, 842]);
    await drawTicketPage({
      pdfDoc, page, font, bold,
      qrCode: qrCodes[i],
      eventTitle, eventDate, eventLocation,
      buyerLine1: `Billet papier n° ${i + 1} / ${qrCodes.length}`,
      buyerLine2: `${(eventPrice / 100).toFixed(2)} €`,
    });
  }

  return await pdfDoc.save();
}
