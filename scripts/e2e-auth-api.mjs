const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function cookieFrom(response) {
  const setCookie = response.headers.get("set-cookie");

  if (!setCookie) return "";

  return setCookie.split(";")[0];
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  const expectedStatus = options.status ?? 200;

  if (response.status !== expectedStatus) {
    throw new Error(
      `${options.method ?? "GET"} ${path} expected ${expectedStatus}, got ${response.status}: ${text}`
    );
  }

  return { response, payload, cookie: cookieFrom(response) };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const emailA = `e2e-a-${runId}@example.com`;
const emailB = `e2e-b-${runId}@example.com`;
const password = "StrongPass123!";

let userA;
let userB;
let cookieA = "";
let cookieB = "";
let couple;

try {
  await request("/api/auth/me", { status: 401 });

  const registeredA = await request("/api/auth/register", {
    method: "POST",
    status: 201,
    body: {
      email: emailA,
      name: "E2E A",
      password
    }
  });
  userA = registeredA.payload.data.user;
  cookieA = registeredA.cookie;
  assert(cookieA, "register should set auth cookie");
  assert(!("passwordHash" in userA), "register response must not expose passwordHash");

  const meA = await request("/api/auth/me", { cookie: cookieA });
  assert(meA.payload.data.email === emailA, "me should return registered user");

  const registeredB = await request("/api/auth/register", {
    method: "POST",
    status: 201,
    body: {
      email: emailB,
      name: "E2E B",
      password
    }
  });
  userB = registeredB.payload.data.user;
  cookieB = registeredB.cookie;

  const createdCouple = await request("/api/couples", {
    method: "POST",
    cookie: cookieA,
    status: 201,
    body: {
      title: "E2E Couple",
      startedAt: "2024-08-03"
    }
  });
  couple = createdCouple.payload.data;
  assert(couple.members.length === 1, "created couple should have owner member");

  await request("/api/couples/join", {
    method: "POST",
    cookie: cookieB,
    status: 201,
    body: {
      inviteCode: couple.inviteCode
    }
  });

  await request(`/api/couples/${couple.id}/diaries`, {
    method: "POST",
    cookie: cookieA,
    status: 201,
    body: {
      title: "E2E Diary",
      content: "Auth-backed diary creation works.",
      visibility: "SHARED"
    }
  });

  await request(`/api/couples/${couple.id}/diaries`, {
    method: "POST",
    cookie: cookieA,
    status: 403,
    body: {
      authorId: userB.id,
      title: "Spoofed Diary",
      content: "This should be blocked.",
      visibility: "SHARED"
    }
  });

  const dashboard = await request(`/api/couples/${couple.id}/dashboard`, {
    cookie: cookieA
  });
  assert(dashboard.payload.data.couple.members.length === 2, "dashboard should include both members");
  assert(dashboard.payload.data.diaryEntries.length === 1, "dashboard should include created diary");

  await request("/api/auth/logout", {
    method: "POST",
    cookie: cookieB
  });
  await request("/api/auth/me", {
    cookie: cookieB,
    status: 401
  });

  const loggedInB = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: emailB,
      password
    }
  });
  cookieB = loggedInB.cookie;
  assert(cookieB, "login should set auth cookie");

  await request(`/api/couples/${couple.id}`, {
    method: "DELETE",
    cookie: cookieA,
    status: 204
  });
  await request(`/api/users/${userB.id}`, {
    method: "DELETE",
    cookie: cookieB,
    status: 204
  });
  await request(`/api/users/${userA.id}`, {
    method: "DELETE",
    cookie: cookieA,
    status: 204
  });

  console.log("Auth API E2E passed");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
