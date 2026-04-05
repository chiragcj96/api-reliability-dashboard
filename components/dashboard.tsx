"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Service } from "@/lib/types";

// TODO: Add alert thresholds - notify when services go down
// TODO: Implement webhook notifications for critical failures
// TODO: Add dark mode support
// TODO: Export dashboard data as CSV

type FetchState = "idle" | "loading" | "error";

const emptyForm = {
  name: "",
  url: ""
};

function statusClassName(status: Service["status"]) {
  if (status === "UP") {
    return "badge badgeUp";
  }

  if (status === "SLOW") {
    return "badge badgeSlow";
  }

  return "badge badgeDown";
}

function statusLabel(status: Service["status"]) {
  if (status === "UP") {
    return "🟢 UP";
  }

  if (status === "SLOW") {
    return "🟡 SLOW";
  }

  return "🔴 DOWN";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not checked yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatLatency(value: number | null) {
  return value === null ? "Timed out / failed" : `${value} ms`;
}

export function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  async function loadServices() {
    setFetchState("loading");
    setError("");

    try {
      const response = await fetch("/api/services", { cache: "no-store" });
      const payload = (await response.json()) as Service[];
      setServices(payload);
      setFetchState("idle");
      // console.log("Services loaded:", payload);
    } catch (err) {
      // TODO: Implement retry logic with exponential backoff
      setFetchState("error");
      setError("Unable to load services right now.");
      console.error("Failed to load services", err);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        // payload.error should be set by the API
        setError(payload.error || "Failed to add service.");
        return;
      }

      // Sort services by name
      setServices((current) =>
        [...current, payload as Service].sort((left, right) =>
          left.name.localeCompare(right.name)
        )
      );
      setForm(emptyForm);
      setMessage("Service added and checked successfully.");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to add service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setActiveServiceId(id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setError("Failed to delete service.");
        return;
      }

      setServices((current) => current.filter((service) => service.id !== id));
      setMessage("Service deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Something went wrong.");
    } finally {
      setActiveServiceId(null);
    }
  }

  async function handleRefresh(id: string) {
    setActiveServiceId(id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/services/${id}/refresh`, {
        method: "POST"
      });
      const payload = (await response.json()) as Service;

      if (!response.ok) {
        setError("Failed to refresh service.");
        return;
      }

      // TODO: Add optimistic updates instead of refetching
      setServices((current) =>
        current
          .map((service) => (service.id === payload.id ? payload : service))
          .sort((left, right) => left.name.localeCompare(right.name))
      );
      setMessage(`Refreshed ${payload.name}.`);
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Failed to refresh.");
    } finally {
      setActiveServiceId(null);
    }
  }

  return (
    <main className="shell">
      <h1>API Reliability Dashboard</h1>

      <section className="grid">
        <aside className="panel">
          <h2>Add a service</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Service name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Example: JSON Placeholder API"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="url">Service URL</label>
              <input
                id="url"
                type="url"
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, url: event.target.value }))
                }
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
                required
              />
            </div>

            <div className="buttonRow">
              <button
                className="button buttonPrimary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Adding..." : "Add Service"}
              </button>
            </div>
          </form>

          <div
            className={`message ${
              error ? "messageError" : message ? "messageSuccess" : ""
            }`}
          >
            {error || message}
          </div>
        </aside>

        <section className="servicesSection">
          <div className="servicesHeader">
            <div>
              <h2>Monitored services</h2>
            </div>

            <div className="servicesActions">
              <button
                className="button buttonSecondary"
                onClick={() => void loadServices()}
                disabled={fetchState === "loading"}
                type="button"
              >
                Reload
              </button>
            </div>
          </div>

          {fetchState === "error" ? (
            <div className="emptyState">
              <p>{error}</p>
            </div>
          ) : fetchState === "loading" && services.length === 0 ? (
            <div className="emptyState">
              <p>Loading services and running health checks...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="emptyState">
              <p>No services added yet. Use the form to start monitoring one.</p>
            </div>
          ) : (
            <div className="servicesList">
              {services.map((service) => (
                <article className="serviceCard" key={service.id}>
                  <div className="serviceTop">
                    <div>
                      <h3 className="serviceTitle">{service.name}</h3>
                      <a
                        className="serviceUrl"
                        href={service.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {service.url}
                      </a>
                    </div>

                    <span className={statusClassName(service.status)}>
                      {statusLabel(service.status)}
                    </span>
                  </div>

                  <div className="serviceMeta">
                    <div className="metaPill">
                      <span className="metaLabel">Latency</span>
                      <span className="metaValue">
                        {formatLatency(service.latencyMs)}
                      </span>
                    </div>
                    <div className="metaPill">
                      <span className="metaLabel">Health score</span>
                      <span className="metaValue">{service.healthScore}</span>
                    </div>
                    <div className="metaPill">
                      <span className="metaLabel">Last checked</span>
                      <span className="metaValue">
                        {formatDate(service.lastCheckedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="cardActions">
                    <button
                      className="button buttonSecondary"
                      disabled={activeServiceId === service.id}
                      onClick={() => void handleRefresh(service.id)}
                      type="button"
                    >
                      {activeServiceId === service.id ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      className="button buttonDanger"
                      disabled={activeServiceId === service.id}
                      onClick={() => void handleDelete(service.id)}
                      type="button"
                    >
                      {activeServiceId === service.id ? "Working..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
