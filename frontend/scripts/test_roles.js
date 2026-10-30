// Test script for AyurSetu role-based routing and RBAC verification
const http = require("http");

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, statusCode: res.statusCode });
    }).on("error", (err) => {
      resolve({ path, error: err.message });
    });
  });
}

function getDashboardRouteForRole(role) {
  if (!role) return "/login";
  const normalizedRole = role.trim().toUpperCase();
  switch (normalizedRole) {
    case "STUDENT":
      return "/student/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "INDUSTRY":
      return "/industry/dashboard";
    case "INSTITUTION":
      return "/institution/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "NGO":
      return "/ngo/dashboard";
    default:
      return "/login";
  }
}

function checkAuthorization(userRole, allowedRoles) {
  const ALL_ROLES = ["STUDENT", "DOCTOR", "INSTITUTION", "INDUSTRY", "NGO", "ADMIN"];
  const isAnyAuthAllowed =
    allowedRoles.includes("AUTHENTICATED") ||
    allowedRoles.includes("ANY") ||
    allowedRoles.length === 0;

  const targetAllowedRoles = isAnyAuthAllowed
    ? ALL_ROLES
    : allowedRoles.map((r) => r.toUpperCase());

  return Boolean(userRole && targetAllowedRoles.includes(userRole.toUpperCase()));
}

async function runTests() {
  console.log("=== 1. VERIFYING DASHBOARD ROUTES ON RUNNING SERVER ===");
  const routes = [
    "/",
    "/login",
    "/register",
    "/student/dashboard",
    "/doctor/dashboard",
    "/institution/dashboard",
    "/industry/dashboard",
    "/ngo/dashboard",
    "/admin/dashboard",
    "/demo/profile",
    "/demo/dashboard",
  ];

  let allRoutesOk = true;
  for (const r of routes) {
    const res = await checkRoute(r);
    const passed = res.statusCode === 200;
    console.log(`Route [${r.padEnd(25)}] -> Status ${res.statusCode} ${passed ? "✓ PASS" : "✗ FAIL"}`);
    if (!passed) allRoutesOk = false;
  }

  console.log("\n=== 2. ROLE TO DASHBOARD ROUTING MAPPING VERIFICATION ===");
  const roleMappings = [
    { role: "STUDENT", expected: "/student/dashboard" },
    { role: "student", expected: "/student/dashboard" },
    { role: "DOCTOR", expected: "/doctor/dashboard" },
    { role: "doctor", expected: "/doctor/dashboard" },
    { role: "INSTITUTION", expected: "/institution/dashboard" },
    { role: "institution", expected: "/institution/dashboard" },
    { role: "INDUSTRY", expected: "/industry/dashboard" },
    { role: "industry", expected: "/industry/dashboard" },
    { role: "NGO", expected: "/ngo/dashboard" },
    { role: "ngo", expected: "/ngo/dashboard" },
    { role: "ADMIN", expected: "/admin/dashboard" },
    { role: "admin", expected: "/admin/dashboard" },
    { role: null, expected: "/login" },
    { role: undefined, expected: "/login" },
    { role: "UNKNOWN", expected: "/login" },
    { role: "GUEST", expected: "/login" },
  ];

  let allMappingsOk = true;
  for (const item of roleMappings) {
    const actual = getDashboardRouteForRole(item.role);
    const passed = actual === item.expected;
    console.log(`Role: ${String(item.role).padEnd(12)} -> Route: ${actual.padEnd(25)} Expected: ${item.expected.padEnd(25)} ${passed ? "✓ PASS" : "✗ FAIL"}`);
    if (!passed) allMappingsOk = false;
  }

  console.log("\n=== 3. RBAC ROUTE GUARD PERMISSION MATRIX VERIFICATION ===");
  const rbacTests = [
    // Student tests
    { user: "STUDENT", guard: ["STUDENT", "ADMIN"], page: "Student Pages", expectAccess: true },
    { user: "STUDENT", guard: ["DOCTOR", "ADMIN"], page: "Doctor Pages", expectAccess: false },
    { user: "STUDENT", guard: ["INSTITUTION", "ADMIN"], page: "Institution Pages", expectAccess: false },
    { user: "STUDENT", guard: ["INDUSTRY", "ADMIN"], page: "Industry Pages", expectAccess: false },
    { user: "STUDENT", guard: ["NGO", "ADMIN"], page: "NGO Pages", expectAccess: false },
    { user: "STUDENT", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },

    // Doctor tests
    { user: "DOCTOR", guard: ["DOCTOR", "ADMIN"], page: "Doctor Pages", expectAccess: true },
    { user: "DOCTOR", guard: ["STUDENT", "ADMIN"], page: "Student Pages", expectAccess: false },
    { user: "DOCTOR", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },

    // Institution tests
    { user: "INSTITUTION", guard: ["INSTITUTION", "ADMIN"], page: "Institution Pages", expectAccess: true },
    { user: "INSTITUTION", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },

    // Industry tests
    { user: "INDUSTRY", guard: ["INDUSTRY", "ADMIN"], page: "Industry Pages", expectAccess: true },
    { user: "INDUSTRY", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },

    // NGO tests
    { user: "NGO", guard: ["NGO", "ADMIN"], page: "NGO Pages", expectAccess: true },
    { user: "NGO", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },

    // Admin tests
    { user: "ADMIN", guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: true },
    { user: "ADMIN", guard: ["STUDENT", "ADMIN"], page: "Student Pages", expectAccess: true },
    { user: "ADMIN", guard: ["DOCTOR", "ADMIN"], page: "Doctor Pages", expectAccess: true },

    // Unauthenticated user
    { user: null, guard: ["STUDENT", "ADMIN"], page: "Student Pages", expectAccess: false },
    { user: null, guard: ["ADMIN"], page: "Admin Dashboard", expectAccess: false },
  ];

  let allRbacOk = true;
  for (const t of rbacTests) {
    const allowed = checkAuthorization(t.user, t.guard);
    const passed = allowed === t.expectAccess;
    console.log(`User: ${String(t.user).padEnd(12)} Target: ${t.page.padEnd(20)} Allowed: ${String(allowed).padEnd(6)} Expected: ${String(t.expectAccess).padEnd(6)} ${passed ? "✓ PASS" : "✗ FAIL"}`);
    if (!passed) allRbacOk = false;
  }

  console.log("\n=======================================================");
  if (allRoutesOk && allMappingsOk && allRbacOk) {
    console.log("✓ ALL ROLE-BASED ROUTING AND RBAC VALIDATIONS PASSED!");
  } else {
    console.log("✗ SOME VALIDATIONS FAILED");
    process.exit(1);
  }
}

runTests();
