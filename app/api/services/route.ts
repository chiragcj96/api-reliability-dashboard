import { NextResponse } from "next/server";
import { addService, getServices } from "@/lib/storage";

// TODO: Add rate limiting - max 100 requests per minute
// TODO: Implement pagination for GET endpoint
// TODO: Add authentication for write operations
// TODO: Log API usage for monitoring

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; url?: string };
  const name = body.name?.trim() ?? "";
  const url = body.url?.trim() ?? "";

  // Basic validation
  if (!name || !url) {
    return NextResponse.json(
      { error: "Name and URL are required." },
      { status: 400 }
    );
  }

  if (!isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: "Please enter a valid HTTP or HTTPS URL." },
      { status: 400 }
    );
  }

  const service = await addService({ name, url });
  return NextResponse.json(service, { status: 201 });
}
