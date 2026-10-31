FORJA PWA offline reopen correction, QA only. No remote deployment.
BASE: c7f15d592d35ba16abe1cf2e052100583f42dec1
HEAD: 655e6f3cd80954b144339968afff231d3d38f0c4
BRANCH: fix/rc3-iphone-offline-reopen-20261031
CHANGED: public/sw.js; tests/sw-offline-redirect-regression.cjs
ROOT CAUSE CLASS: redirected HTML cached/returned as a Service Worker navigation response can be rejected by iOS/WebKit on cold offline navigation. Real iPhone root cause remains to be proven.
FIX: install a direct nonredirected HTML shell into the versioned cache; normalize both online navigation and offline fallback responses; remove root redirection from precache; update cache version. Do not touch localStorage, IndexedDB, or app code.
RED: node tests/sw-offline-redirect-regression.cjs -> exit 1 / AssertionError redirected response true on '/'.
GREEN: same -> exit 0; '/' and '/index.html' nonredirected with HTML body.
ALSO: node tests/ios-pwa-assets-contract.mjs -> exit 0; node tests/qa-offline-session.mjs -> exit 0; node --check public/sw.js -> exit 0; git diff --check -> exit 0.
LIMIT: simulated Service Worker (Node VM) not physical WebKit browser. Physical iPhone offline cold-launch must be repeated only after QA version publication authorization.
HOW TO RESTORE: git clone -c core.autocrlf=false FORJA_C7_OFFLINE_REOPEN_FIX.bundle new-directory; git rev-parse HEAD ; expect full HEAD above.
DEPLOY: NOT AUTHORIZED; QA worker only after independent audit.
