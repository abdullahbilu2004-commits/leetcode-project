# LeetCode-style practice platform

Next.js (App Router, JavaScript), Tailwind CSS v4, MongoDB/Mongoose, Monaco editor, Judge0.

## 1. Install
```bash
npm install
```
`package.json` uses "latest" for every dependency. After the first successful install, pin the resolved
versions (`npm ls --depth=0`) so builds are reproducible. Requires Node 20+.

## 2. Configure (.env.local, never commit it)
Copy `.env.example` to `.env.local` and fill in:
- `MONGODB_URI`: MongoDB Atlas (free M0): create cluster, Database Access user, Network Access (add your IP, or 0.0.0.0/0 for Vercel), then Connect > Drivers > copy the string and add a database name, e.g. `/leetcode_practice`.
- `AUTH_SECRET`: `openssl rand -base64 32`
- `SYNC_ADMIN_TOKEN`: any long random string (protects import and test-case routes)
- `JUDGE0_URL` (+ `JUDGE0_API_KEY`): required for Run/Submit. Options: RapidAPI Judge0 CE (set `JUDGE0_API_HOST` too) or a self-hosted instance. Without it everything else works and Run/Submit say the judge is not configured.

## 3. Run
```bash
npm run dev
curl -X POST -H "x-sync-token: YOUR_SYNC_ADMIN_TOKEN" http://localhost:3000/api/problems/sync
```
The sync imports the problem list from LeetCode's unofficial GraphQL endpoint (about 3,000+ rows, may take a minute).
Statements, hints and starter code are fetched lazily the first time a problem is opened, then cached for 30 days.
Premium statements are never stored.

## 4. Enable real grading (important)
LeetCode does not provide hidden tests or expected outputs, and none are invented here.
- **Run** executes your program with the stdin you type. Never graded.
- **Submit** grades only against cases you add per problem:
```bash
curl -X POST http://localhost:3000/api/admin/testcases \
  -H "x-sync-token: YOUR_SYNC_ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"slug":"PROBLEM-SLUG","compareMode":"tokens","cases":[{"input":"1 2\n","expected":"3\n","isSample":true},{"input":"5 7\n","expected":"12\n","isSample":false}]}'
```
Your solution must read stdin and print stdout (LeetCode starter code is a function only, so add a driver).
Statuses: Accepted needs all cases passed AND at least one hidden (isSample:false) case. Only samples passing gives
"Samples Passed". No cases gives "Not graded". A problem counts as solved only after Accepted.
`compareMode`: tokens (whitespace-insensitive), exact (trailing whitespace trimmed), float (relative tolerance 1e-6).
Test cases are stored with `select: false` and no public route returns them; hidden cases are reported as pass/fail only.

## 5. Routes
Pages: / , /problems , /problems/[slug] , /login , /signup , /profile , /bookmarks , /submissions , /submissions/[id] , /settings
API: auth (signup, login, logout, me), problems (list, [slug], [slug]/navigate, random, daily, sync),
bookmarks, execute, submissions (+[id]), progress/[slug] (drafts), settings (+password), admin/testcases.

## 6. Deploy to Vercel
Add the same env vars in the project settings, deploy. Notes:
- The rate limiter is in-memory per instance; use Redis/Upstash for strict limits at scale.
- Run/Submit/sync routes set `maxDuration = 60`; check your Vercel plan allows it.
- Monaco loads from the jsDelivr CDN in the browser.
- Do not expose Judge0 publicly without an auth token.

## 7. Known limitations
- The LeetCode GraphQL endpoint is unofficial and may change, rate-limit, or block server IPs. Failures show clear messages and cached data keeps working. Check LeetCode's terms before running this publicly or at scale.
- This code was written without the ability to run `npm install`, build, or browser-test it. Expect to fix small issues on first run (version drift in "latest" packages is the most likely cause).
- Formatting in the browser editor works for JavaScript only.
- Daily challenge uses LeetCode's daily problem, with a clearly labelled local fallback if unavailable.
