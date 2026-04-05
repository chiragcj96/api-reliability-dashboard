export type ServiceStatus = "UP" | "SLOW" | "DOWN";

export type Service = {
  id: string;
  name: string;
  url: string;
  status: ServiceStatus;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  healthScore: number;
};

export type CreateServiceInput = {
  name: string;
  url: string;
};
