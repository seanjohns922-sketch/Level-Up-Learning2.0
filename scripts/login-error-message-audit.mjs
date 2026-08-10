import fs from "node:fs";

const helper = fs.readFileSync("lib/supabase.ts", "utf8");
const login = fs.readFileSync("app/login/page.tsx", "utf8");

const checks = [
  ["empty object errors use a fallback", /message === "\{\}"/.test(helper)],
  ["object string errors use a fallback", /message === "\[object Object\]"/.test(helper)],
  ["invalid credentials are explained", /Email or password is incorrect\./.test(helper)],
  ["network failures are explained", /login service could not be reached/.test(helper)],
  [
    "auth requests do not depend on student session storage",
    /!requestUrl\.includes\("\/auth\/v1\/"\)/.test(helper),
  ],
  [
    "authenticated adult requests cannot inherit student credentials",
    /hasAuthenticatedUserToken/.test(helper) &&
      /!hasAuthenticatedUserToken/.test(helper),
  ],
  [
    "student session storage failures cannot abort requests",
    /localStorage\.getItem\(STUDENT_SESSION_TOKEN_KEY\)[\s\S]*?catch \{/.test(helper),
  ],
  [
    "opaque authentication failures trigger a clean retry",
    /recoverAuthSessionError\(signInErr\)/.test(login) &&
      /recoverAuthSessionError\(error\)/.test(login),
  ],
  [
    "teacher sign-in errors are normalized",
    /setTeacherError\(getAuthErrorMessage\(signInErr/.test(login),
  ],
  [
    "school-session errors are normalized",
    /setTeacherError\(getAuthErrorMessage\([\s\S]*?result\?\.error/.test(login),
  ],
  [
    "parent authentication errors are normalized",
    /setParentError\(getAuthErrorMessage\(error/.test(login),
  ],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length > 0) process.exitCode = 1;
