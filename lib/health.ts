import type { Service, ServiceStatus } from "@/lib/types";

// TODO: Implement health check caching to reduce API calls
// TODO: Add configurable timeout based on service SLA
// TODO: Maybe add support for custom health check endpoints
// TODO: Track historical data for trend analysis

const REQUEST_TIMEOUT_MS = 5000;

// Health score calculation - might want to make this configurable
function scoreFromStatus(status: ServiceStatus, latencyMs: number | null): number {
  if (status === "DOWN") {
    return 0;
  }

  if (latencyMs === null) {
    // Request timed out but got through
    return status === "UP" ? 95 : 50;
  }

  if (status === "UP") {
    // Penalize for higher latency
    return Math.max(80, Math.min(100, 100 - Math.floor(latencyMs / 25)));
  }

  // Slow status gets lower score
  return Math.max(25, 70 - Math.floor(latencyMs / 80));
}

function classifyStatus(ok: boolean, latencyMs: number): ServiceStatus {
  if (!ok || latencyMs >= 2000) {
    return "DOWN";
  }

  if (latencyMs >= 500) {
    return "SLOW";
  }

  return "UP";
}

export async function checkServiceHealth(
  service: Pick<Service, "id" | "name" | "url">
): Promise<Service> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(service.url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "api-reliability-dashboard"
      }
    });

    const latencyMs = Date.now() - startedAt;
    const status = classifyStatus(response.ok, latencyMs);
    // console.debug(`Health check for ${service.name}: ${status} (${latencyMs}ms)`);

    return {
      ...service,
      status,
      latencyMs,
      lastCheckedAt: new Date().toISOString(),
      healthScore: scoreFromStatus(status, latencyMs)
    };
  } catch (error) {
    // Network error or timeout
    // console.error(`Failed to check ${service.name}:`, error);
    return {
      ...service,
      status: "DOWN",
      latencyMs: null,
      lastCheckedAt: new Date().toISOString(),
      healthScore: 0
    };
  } finally {
    clearTimeout(timeout);
  }
}
