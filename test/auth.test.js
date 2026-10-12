import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/users.model.js";

dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 8080}/api/v1`;
const stamp = Date.now();
const user = {
  name: "Test User",
  email: `user${stamp}@test.com`,
  password: "123456",
};
const admin = {
  name: "Test Admin",
  email: `admin${stamp}@test.com`,
  password: "123456",
};

let userCookie;
let adminCookie;

const cookieFrom = (res) => {
  const c = res.headers.getSetCookie().find((c) => c.startsWith("authToken="));
  return c ? c.split(";")[0] : null;
};

const request = (method, path, { body, cookie } = {}) =>
  fetch(BASE + path, {
    method,
    headers: {
      ...(body && { "Content-Type": "application/json" }),
      ...(cookie && { Cookie: cookie }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

before(async () => {
  await mongoose.connect(process.env.URI_MONGODB);
});

after(async () => {
  await User.deleteMany({ email: { $in: [user.email, admin.email] } });
  await mongoose.disconnect();
});

test("register: crea usuario con role user (201)", async () => {
  const res = await request("POST", "/auth/register", { body: user });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.payload.role, "user");
  assert.equal(data.payload.password, undefined);
});

test("register: campos faltantes (400)", async () => {
  const res = await request("POST", "/auth/register", {
    body: { email: "x@test.com" },
  });
  assert.equal(res.status, 400);
});

test("register: email duplicado (400)", async () => {
  const res = await request("POST", "/auth/register", { body: user });
  assert.equal(res.status, 400);
});

test("login: contraseña incorrecta (401)", async () => {
  const res = await request("POST", "/auth/login", {
    body: { email: user.email, password: "mal" },
  });
  assert.equal(res.status, 401);
});

test("login: credenciales correctas devuelven token y cookie httpOnly", async () => {
  const res = await request("POST", "/auth/login", {
    body: { email: user.email, password: user.password },
  });
  const data = await res.json();
  userCookie = cookieFrom(res);
  assert.equal(res.status, 200);
  assert.ok(data.token, "debe devolver token en el body");
  assert.ok(userCookie, "debe enviar cookie authToken");
  const setCookie = res.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
});

test("profile: sin cookie (401)", async () => {
  const res = await request("GET", "/profile");
  assert.equal(res.status, 401);
});

test("profile: con cookie válida (200)", async () => {
  const res = await request("GET", "/profile", { cookie: userCookie });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.payload.email, user.email);
});

test("admin: usuario normal (403)", async () => {
  const res = await request("GET", "/admin", { cookie: userCookie });
  assert.equal(res.status, 403);
});

test("admin: registrar, promover en DB y loguear", async () => {
  const reg = await request("POST", "/auth/register", { body: admin });
  assert.equal(reg.status, 201);

  await User.updateOne({ email: admin.email }, { role: "admin" });

  const login = await request("POST", "/auth/login", {
    body: { email: admin.email, password: admin.password },
  });
  adminCookie = cookieFrom(login);
  assert.equal(login.status, 200);
});

test("admin: usuario con rol admin (200)", async () => {
  const res = await request("GET", "/admin", { cookie: adminCookie });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.payload.role, "admin");
});

test("session: sin sesión activa (200, session null)", async () => {
  const res = await request("GET", "/session");
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.session, null);
});

test("logout: responde 200 y limpia la cookie", async () => {
  const res = await request("POST", "/auth/logout", { cookie: userCookie });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("set-cookie") ?? "", /authToken=;/);
});

test("profile: sin cookie después de logout (401)", async () => {
  const res = await request("GET", "/profile");
  assert.equal(res.status, 401);
});
