import { sql } from 'drizzle-orm';
import Elysia from 'elysia';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { db, schema } from '../../db/index.ts';

// ─── Prometheus registry ──────────────────────────────────────────────────────
export const registry = new Registry();

// Collect default Node.js / process metrics (memory, CPU, event loop lag, etc.)
collectDefaultMetrics({ register: registry });

// ─── Custom application metrics ───────────────────────────────────────────────

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const activeUsers = new Gauge({
  name: 'app_active_users_total',
  help: 'Total number of registered users',
  registers: [registry],
});

export const xpAwarded = new Counter({
  name: 'app_xp_awarded_total',
  help: 'Total XP awarded across all users',
  labelNames: ['action_type'] as const,
  registers: [registry],
});

export const scenariosRun = new Counter({
  name: 'app_scenarios_run_total',
  help: 'Total number of demo scenarios started',
  labelNames: ['scenario_id'] as const,
  registers: [registry],
});

// ─── Instrumentation helper (called from root app onAfterHandle) ──────────────
export function recordRequest(method: string, pathname: string, status: string): void {
  const route = pathname.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '/:id',
  );
  httpRequestsTotal.inc({ method, route, status });
  httpRequestDuration.observe({ method, route }, 0);
}

// ─── Metrics endpoint ──────────────────────────────────────────────────────────
export const metricsModule = new Elysia({ prefix: '/metrics' })
  .get(
    '/',
    async ({ set }) => {
      // Refresh slow gauges from DB on each scrape (Prometheus scrapes every 15s)
      try {
        const [row] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(schema.users);
        if (row) activeUsers.set(row.count);
      } catch {
        // non-fatal — metric will retain last value
      }

      set.headers['Content-Type'] = registry.contentType;
      return registry.metrics();
    },
  );
