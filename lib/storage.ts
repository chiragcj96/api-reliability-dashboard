import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultServices } from "@/lib/default-services";
import { checkServiceHealth } from "@/lib/health";
import type { CreateServiceInput, Service } from "@/lib/types";

// TODO: Migrate to a real database (Postgres, MongoDB, etc)
// TODO: Add caching layer for hot data
// TODO: Implement pagination for large datasets
// TODO: Add data backup/recovery system

const dataDirectory = path.join(process.cwd(), "data");
const servicesFile = path.join(dataDirectory, "services.json");

function createId() {
  return `svc_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true });
}

async function writeServices(services: Service[]) {
  await ensureDataDirectory();
  await writeFile(servicesFile, JSON.stringify(services, null, 2), "utf8");
}

async function buildSeedServices(): Promise<Service[]> {
  // Initialize with default services and run initial health checks
  const seeded = defaultServices.map((service) => ({
    id: createId(),
    ...service
  }));

  // This is a bit slow on first load - might want to parallelize or cache
  const checked = await Promise.all(
    seeded.map((service) => checkServiceHealth(service))
  );

  await writeServices(checked);
  return checked;
}

export async function getServices(): Promise<Service[]> {
  try {
    const raw = await readFile(servicesFile, "utf8");
    const parsed = JSON.parse(raw) as Service[];
    return parsed.sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    // File doesn't exist or is corrupted, initialize with defaults
    // console.log("No existing services file, creating defaults");
    return buildSeedServices();
  }
}

export async function saveServices(services: Service[]) {
  const sorted = [...services].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  await writeServices(sorted);
  return sorted;
}

export async function addService(input: CreateServiceInput): Promise<Service> {
  const services = await getServices();
  const checked = await checkServiceHealth({
    id: createId(),
    name: input.name.trim(),
    url: input.url.trim()
  });
  await saveServices([...services, checked]);
  return checked;
}

export async function deleteService(id: string) {
  const services = await getServices();
  const nextServices = services.filter((service) => service.id !== id);
  await saveServices(nextServices);
}

export async function refreshService(id: string): Promise<Service | null> {
  const services = await getServices();
  const current = services.find((service) => service.id === id);

  if (!current) {
    return null;
  }

  const refreshed = await checkServiceHealth(current);
  const nextServices = services.map((service) =>
    service.id === id ? refreshed : service
  );
  await saveServices(nextServices);
  return refreshed;
}
