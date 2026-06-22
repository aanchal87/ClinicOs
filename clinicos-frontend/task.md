# ClinicOS Aadhaar & Advanced Queue Upgrade Task List

## 1. Database Schema & Migration
- [ ] Update `prisma/schema.prisma` with `Visit`, `TokenHistory`, `QueueEvent` and updates to `Patient`, `QueueToken`, and `MedicalRecord`.
- [ ] Run `npx prisma db push` to synchronize SQLite schema.
- [ ] Update `prisma/seed.ts` with custom IDs, encrypted Aadhaar ciphers, emergency contacts, visits, and event logs.
- [ ] Run `npx prisma db seed` to seed the database.

## 2. Backend Logic & Cryptography
- [ ] Create `CryptoService` in backend for AES-256-GCM encryption and SHA-256 hashing.
- [ ] Extend `PatientService` & `PatientController`:
  - Add Aadhaar check duplicate registration check endpoint (`POST /patients/aadhaar-check`).
  - Add Patient Custom ID generation logic (`PAT-YYYY-XXXXXX`) using transaction count.
  - Map encrypted Aadhaar to masked value in query returns unless requested by admin.
- [ ] Create `Visit` Module (`VisitService`, `VisitController` for visit logging).
- [ ] Enhance `QueueService` & `QueueGateway`:
  - Implement 8 status transitions: waiting, called, started, completed, missed, cancelled, skipped, recalled.
  - Implement priority override sorting (`emergency` -> `urgent` -> `normal` -> date).
  - Save status logs to `TokenHistory` and `QueueEvent` tables.
- [ ] Update `AppointmentService`:
  - Add Check-In endpoint (`POST /appointments/:id/checkin`) that updates status to `CHECKED_IN`, creates a `Visit`, generates a `QueueToken`, and broadcasts `token_created`.

## 3. Frontend Hooks Refactor (`useClinicApi.ts`)
- [ ] Add `useAadhaarCheck` mutation.
- [ ] Add `useCheckInAppointment` mutation.
- [ ] Add `useVisits` query.
- [ ] Add custom queue token mutation status updates (cancel, complete, recall) in `useClinicApi.ts`.

## 4. Frontend Screen Implementations
- [ ] **Patient Registration Drawer** (`src/app/patients/page.tsx`):
  - Implement Aadhaar verification step first.
  - If duplicate found, show redirect prompt; if not, open demographic, medical, and emergency contact fields.
- [ ] **Patient Directory List**:
  - Show custom ID and masked Aadhaar (`XXXX-XXXX-1234`) on search grids.
- [ ] **Chronological Timeline Feed**:
  - Refactor Patient Timeline tab to merge all registration, visit, token, consultation, prescription, lab, document, and image events into a single sorted chronological feed.
- [ ] **Advanced Lobby Queue Manager** (`src/app/queue/page.tsx`):
  - Split dashboard into Doctor view and Receptionist view.
  - Add Queue Analytics widgets (Wait times, Completed vs Missed counts).
  - Add priority overrides and token action handlers.
- [ ] **Appointment Check-In Trigger**:
  - Integrate a "Check In" quick-action button in the Calendar slots list and Dashboard appointment cards.

## 5. Verification & Compilation Checks
- [ ] Run NestJS backend build test.
- [ ] Run Next.js frontend compile build check.
