import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await params;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
  }

  // Les admins ont accès à toutes les ressources
  if (session.role !== "ADMIN") {
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const access = await prisma.resourceAccess.findUnique({
      where: {
        resourceId_studentId: { resourceId: id, studentId: student.id },
      },
    });

    if (!access) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }
  }

  // Récupère le fichier depuis Vercel Blob côté serveur
  const response = await fetch(resource.fileUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resource.fileName}"`,
    },
  });
}
