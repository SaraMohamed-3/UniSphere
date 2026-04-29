const path = require("path");
const { performance } = require("perf_hooks");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const baseUrl = (process.env.BENCHMARK_BASE_URL || "http://localhost:5050/api").replace(/\/+$/, "");
const professorEmail = process.env.BENCHMARK_PROFESSOR_EMAIL || "professor.test@unisphere.local";
const professorPassword = process.env.BENCHMARK_PROFESSOR_PASSWORD || "Test@123";
const repeatCount = Math.max(Number(process.env.BENCHMARK_REPEAT_COUNT || 5), 1);
const resultsDir = path.resolve(__dirname, "..", "benchmark-results");

function formatMs(value) {
  return `${value.toFixed(2)} ms`;
}

async function timedFetch(url, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(url, options);
  const endedAt = performance.now();
  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    durationMs: endedAt - startedAt,
    data,
  };
}

function summarizeRuns(label, runs) {
  const durations = runs.map((run) => run.durationMs);
  const total = durations.reduce((sum, value) => sum + value, 0);
  const avg = total / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);

  return {
    label,
    count: runs.length,
    avg,
    min,
    max,
    statuses: [...new Set(runs.map((run) => run.status))].join(", "),
  };
}

async function benchmarkEndpoint(label, url, headers) {
  const runs = [];
  for (let index = 0; index < repeatCount; index += 1) {
    const result = await timedFetch(url, { headers });
    if (!result.ok) {
      const message =
        typeof result.data === "object" && result.data?.message
          ? result.data.message
          : JSON.stringify(result.data);
      throw new Error(`${label} failed with HTTP ${result.status}: ${message}`);
    }
    runs.push(result);
  }
  return summarizeRuns(label, runs);
}

function printSummary(summary) {
  process.stdout.write(
    `${summary.label.padEnd(28)} avg=${formatMs(summary.avg)} min=${formatMs(summary.min)} max=${formatMs(summary.max)} status=${summary.statuses}\n`,
  );
}

function createTimestamp() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ];
  return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`;
}

function writeResultsFile(payload) {
  fs.mkdirSync(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `professor-benchmark-${createTimestamp()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

async function getProfessorToken() {
  if (process.env.BENCHMARK_JWT_TOKEN) {
    return process.env.BENCHMARK_JWT_TOKEN;
  }

  const loginResult = await timedFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: professorEmail,
      password: professorPassword,
      role: "professor",
    }),
  });

  if (!loginResult.ok || !loginResult.data?.token) {
    const message =
      typeof loginResult.data === "object" && loginResult.data?.message
        ? loginResult.data.message
        : JSON.stringify(loginResult.data);
    throw new Error(`Login failed with HTTP ${loginResult.status}: ${message}`);
  }

  process.stdout.write(`login                       ${formatMs(loginResult.durationMs)}\n`);
  return loginResult.data.token;
}

async function main() {
  process.stdout.write(`Base URL: ${baseUrl}\n`);
  process.stdout.write(`Repeats: ${repeatCount}\n`);

  const token = await getProfessorToken();
  const headers = { Authorization: `Bearer ${token}` };

  const classesResult = await timedFetch(`${baseUrl}/professor/classes`, { headers });
  if (!classesResult.ok) {
    throw new Error(`Professor classes bootstrap failed with HTTP ${classesResult.status}`);
  }

  const classes = Array.isArray(classesResult.data) ? classesResult.data : [];
  const firstClassId = classes[0]?.class_id;

  const summaries = [];
  summaries.push(await benchmarkEndpoint("professor/dashboard", `${baseUrl}/professor/dashboard`, headers));
  summaries.push(await benchmarkEndpoint("professor/classes", `${baseUrl}/professor/classes`, headers));

  if (firstClassId) {
    summaries.push(
      await benchmarkEndpoint(
        "professor/class/students",
        `${baseUrl}/professor/classes/${firstClassId}/students`,
        headers,
      ),
    );
    summaries.push(
      await benchmarkEndpoint(
        "professor/class/grades",
        `${baseUrl}/professor/classes/${firstClassId}/grades`,
        headers,
      ),
    );
    summaries.push(
      await benchmarkEndpoint(
        "professor/class/attendance",
        `${baseUrl}/professor/classes/${firstClassId}/attendance`,
        headers,
      ),
    );
    summaries.push(
      await benchmarkEndpoint(
        "professor/class/announcements",
        `${baseUrl}/professor/classes/${firstClassId}/announcements`,
        headers,
      ),
    );

    const assignmentsResult = await timedFetch(
      `${baseUrl}/professor/classes/${firstClassId}/assignments`,
      { headers },
    );

    if (assignmentsResult.ok) {
      const assignments = Array.isArray(assignmentsResult.data) ? assignmentsResult.data : [];
      summaries.push(
        await benchmarkEndpoint(
          "professor/class/assignments",
          `${baseUrl}/professor/classes/${firstClassId}/assignments`,
          headers,
        ),
      );

      const firstAssignmentId = assignments[0]?.assignment_id;
      if (firstAssignmentId) {
        summaries.push(
          await benchmarkEndpoint(
            "professor/assignment/subs",
            `${baseUrl}/professor/assignments/${firstAssignmentId}/submissions`,
            headers,
          ),
        );
      }
    } else if (assignmentsResult.status !== 500) {
      throw new Error(
        `Assignments bootstrap failed with HTTP ${assignmentsResult.status}: ${JSON.stringify(assignmentsResult.data)}`,
      );
    }
  } else {
    process.stdout.write("No professor classes found, so class-specific benchmarks were skipped.\n");
  }

  process.stdout.write("\nLatency summary\n");
  for (const summary of summaries) {
    printSummary(summary);
  }

  const outputPath = writeResultsFile({
    generatedAt: new Date().toISOString(),
    baseUrl,
    repeatCount,
    professorEmail: process.env.BENCHMARK_JWT_TOKEN ? null : professorEmail,
    summaries,
  });
  process.stdout.write(`\nSaved results to ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
