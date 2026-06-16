import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    login_10k: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "5m", target: 10000 },
        { duration: "10m", target: 10000 },
        { duration: "5m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
  discardResponseBodies: true,
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5050/api";
const EMAIL = __ENV.EMAIL || "test@student.com";
const PASSWORD = __ENV.PASSWORD || "password123";
const ROLE = __ENV.ROLE || "student";

export default function () {
  const response = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      role: ROLE,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  check(response, {
    "status is 200 or 401": (res) => res.status === 200 || res.status === 401,
  });

  sleep(1);
}
