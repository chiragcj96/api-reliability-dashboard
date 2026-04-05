import { NextResponse } from "next/server";
import { deleteService, getServices } from "@/lib/storage";

// TODO: Add soft deletes for audit trail
// TODO: Add confirmation prompt for CLI/API clients

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = await getServices();
  // Check if service exists
  const exists = services.some((service) => service.id === id);

  if (!exists) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  await deleteService(id);
  return new NextResponse(null, { status: 204 });
}
