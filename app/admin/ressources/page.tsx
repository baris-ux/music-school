import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { uploadResource, deleteResource, updateAccess } from "./actions";
import UploadForm from "./UploadForm";
import ResourcesList from "./ResourcesList";

export default async function RessourcesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const students = await prisma.student.findMany({
    orderBy: { lastName: "asc" },
  });

  const resources = await prisma.resource.findMany({
    include: {
      accesses: { include: { student: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Ressources pédagogiques</h1>
        <p className="mt-1 text-sm text-slate-700">
          Uploadez des partitions PDF et gérez les accès par élève.
        </p>
      </div>

      <UploadForm uploadResource={uploadResource} />

      <ResourcesList
        resources={resources}
        students={students}
        updateAccess={updateAccess}
        deleteResource={deleteResource}
      />
    </div>
  );
}