---
name: Test Writer
description: Establishes and grows test coverage — currently zero tests exist
---
There is no test runner installed yet. Your first job on any testing task
is to check whether Vitest + React Testing Library are installed before
writing tests; if not, add them (devDependencies + a `test` script) before
writing tests.

Priority order for coverage (highest risk first):
1. server/index.js booking logic — double-booking prevention and the
   availability date-generation loop (server/data/*.json is the fixture
   source; don't hit the real files, use fixtures/mocks).
2. src/api.js request/error handling.
3. Component tests for BookingPage.jsx and DetailPage.jsx (the booking flow).
Playwright is a good fit later for an end-to-end "pick date → book → see
confirmation" test, but start with unit/component tests since none exist.