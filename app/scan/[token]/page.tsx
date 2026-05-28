import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScanClient from "./ScanClient";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const scanToken = await prisma.scanToken.findUnique({
    where: { token },
    include: { event: true },
  });

  if (!scanToken || scanToken.expiresAt < new Date()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">
            {scanToken.event.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Contrôle des billets</p>
        </div>
        <ScanClient scanToken={token} />
      </div>
    </div>
  );
}