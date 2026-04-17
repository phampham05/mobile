# Session Note

## Project overview

- Repo root: `D:\Mobile`
- Current Git remote for the monorepo: `https://github.com/duynam05/Moblie-Project.git`
- Structure:
  - `backend/project-web`: Spring Boot backend reused from the web project
  - `mobile`: Expo + React Native + Expo Router mobile app

## Current Git structure

- The root `D:\Mobile` is now the main Git repo used for collaboration.
- `mobile` is no longer tracked as a nested gitlink/submodule in the root repo.
- A backup of the old nested mobile repo metadata was kept locally at `.mobile-git-backup/` and is ignored by Git.

## Backend status

- Backend logic/API was not changed from the web backend.
- Only non-source files were cleaned up:
  - removed `backend/project-web/target/`
  - removed `backend/project-web/.DS_Store`
  - removed `backend/project-web/src/files.txt`
- Backend remains a Spring Boot app with MySQL and JWT auth.
- Recommended run mode is Docker via `backend/project-web/docker-compose.yml`.

## Backend auth contract in use

Mobile is now aligned to the existing backend endpoints:

- `POST /auth/token`
- `POST /auth/register`
- `GET /users/my-info`
- `POST /auth/logout`
- `POST /auth/change-password`

Important detail:

- `POST /auth/register` does not return a token.
- Mobile handles this by registering first, then logging in immediately with the same credentials.

## Mobile auth status

- `mobile/context/UserContext.js` was rewritten to use real backend auth.
- `mobile/services/authService.js` was added to isolate auth API calls.
- Token storage:
  - web: `localStorage`
  - native: `AsyncStorage`
- Auth behavior now includes:
  - login with `/auth/token`
  - register with `/auth/register`
  - auto-login after successful registration
  - restore session on app start by reading stored token and calling `/users/my-info`
  - logout by calling `/auth/logout` and clearing local token
  - change password via `/auth/change-password`

## Mobile UI work completed

- `mobile/app/login.js`
  - redesigned login screen
  - connected to real auth API
- `mobile/app/register.js`
  - registration screen added
  - connected to real auth API
- `mobile/app/_layout.tsx`
  - routes registered for `/login` and `/register`
- `mobile/app/(tabs)/profile.js`
  - logged-out state now shows buttons for both login and register

## Known backend/mobile mismatch

- `mobile/context/UserContext.js` update profile flow was adjusted to better match backend, but backend `/users/me` still only accepts:
  - `fullName`
  - `phone`
  - `address`
  - optional `password`
- Backend does not currently support the previous mobile assumptions around `avatar` or editable `email` in `/users/me`.

## Environment setup

- Root documentation now exists in `README.md`.
- Required env files:
  - `backend/project-web/.env`
  - `mobile/.env`
- Example files:
  - `backend/project-web/.env.example`
  - `mobile/.env.example`
- Mobile must use `EXPO_PUBLIC_API_URL` pointing to the backend host.
- For emulator/physical device testing, use the machine's LAN IP instead of `localhost`.

## Common run flow

1. Start backend from `backend/project-web` with `docker compose up --build`
2. Confirm backend is reachable on `http://<LAN-IP>:8080`
3. In `mobile`, set `EXPO_PUBLIC_API_URL=http://<LAN-IP>:8080`
4. Run mobile with `npm install` then `npm run start`

## Important caveats

- If Expo was already running before `.env` changed, restart Expo to reload `EXPO_PUBLIC_API_URL`.
- If backend throws `Unable to determine Dialect without JDBC metadata`, the app is not connecting to MySQL correctly.
- `npm run lint` for the whole mobile repo still has pre-existing errors in unrelated files outside the auth work.
- Focused lint for auth-related files passed:
  - `context/UserContext.js`
  - `services/authService.js`
  - `app/login.js`
  - `app/register.js`

## Files added/updated recently

- Added:
  - `README.md`
  - `SESSION_NOTE.md`
  - `mobile/services/authService.js`
  - `mobile/.env.example`
  - root `.gitignore`
- Updated:
  - `mobile/context/UserContext.js`
  - `mobile/app/login.js`
  - `mobile/app/register.js`
  - `mobile/app/_layout.tsx`
  - `mobile/app/(tabs)/profile.js`

## Suggested next steps

1. Verify backend and mobile auth end-to-end on a real device or emulator.
2. Fix existing unrelated lint errors in mobile screens outside auth.
3. Reconcile profile edit/change-password screens with the exact backend payload contract.
4. Decide whether to add refresh-token handling on mobile.
5. Add automated tests if the project is moving beyond manual verification.
