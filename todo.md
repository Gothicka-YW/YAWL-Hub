# YAWL Hub Plan

Last updated: 2026-05-04

## Product Direction

- Build YAWL Hub as a desktop-first responsive web app with mobile-friendly layouts.
- Keep the initial implementation build-free with plain HTML, CSS, and JavaScript to minimize dependency risk.
- Treat the Facebook group as the community layer, not the system of record.
- Store shared group data in a backend that all members can read and update based on permissions.
- Keep personal gifting notes, visited status, and draft work local to each member.
- Plan for an optional browser sidebar extension later, but do not make the MVP depend on Facebook page integration.

## Locked Decisions

- Backend for shared live data: Supabase.
- Shared data management for v1: admin-managed.
- Initial implementation path: responsive browser app with a sidebar-first layout and no build step.

## Security Direction

- Remove the Vite and npm toolchain from the first version to eliminate the current audited dev-server vulnerability class.
- Use a simple browser-side config file instead of build-time environment variables.
- Treat the Supabase anon key as a public client key and protect real data with Row Level Security.

## Primary Goals

- Give members one central place for weekly wishlists, home links, birthdays, giveaways, and hangouts.
- Reduce friction during gifting sessions.
- Preserve privacy for personal tracking data.
- Keep the admin workflow simple enough to maintain for a small group.
- Build on a stack that can grow if the group expands.

## MVP Scope

### Shared Features

- [ ] Member directory with display name, home link, birthday, and optional notes visible to the group.
- [ ] Weekly wishlist gallery with image upload or image link support.
- [ ] Birthday board with upcoming birthdays.
- [ ] Giveaway board with active and claimed states.
- [ ] Hangout board with yes, no, and maybe RSVPs.
- [ ] Group announcements or weekly highlights section.
- [ ] Admin tools for editing shared data.
- [ ] Link out to the related Facebook group post or weekly thread.

### Private Local-Only Features

- [ ] "I visited this home" checklist.
- [ ] "I already gifted this member" checklist.
- [ ] Personal notes about members.
- [ ] Draft wishlist notes or templates.

### Explicitly Out of Scope for v1

- [ ] Facebook automation or scraping.
- [ ] OCR or item recognition from wishlist images.
- [ ] Built-in chat.
- [ ] Push notifications.
- [ ] Native mobile app.
- [ ] Complex inventory or item database features.

## Recommended Technical Direction

### Frontend

- [x] Build the first version as a responsive browser app with a persistent left sidebar.
- [x] Keep the first version build-free with plain HTML, CSS, and JavaScript.
- [ ] Keep the UI clean, fast, and desktop-friendly for players using it alongside YoWorld.
- [ ] Make all layouts degrade cleanly to tablet and mobile widths.

### Backend

- [x] Preferred path: Supabase for shared live data, image storage, auth, and simple role control.
- [ ] Simpler fallback: Airtable or Google Sheets if admin-only editing is acceptable at first.
- [x] Decide the backend before scaffolding too much UI.

### Local Storage

- [ ] Store private checklists, notes, and draft data in browser local storage or IndexedDB.
- [ ] Keep private data fully separate from shared backend records.

### Future Extension

- [ ] Reuse the same backend and UI concepts for a browser sidebar extension later.
- [ ] Prefer a browser side panel over a fragile in-page Facebook overlay.

## Decision Checklist

- [ ] Confirm final app name and branding for YAWL Hub.
- [x] Choose backend: Supabase, Airtable, or Google Sheets.
- [ ] Choose access model: admin-created accounts, invite links, password gate, or email login.
- [x] Decide whether members can edit their own profile data in v1 or if admins control all shared updates.
- [ ] Decide how wishlist images are added: upload files, paste image URLs, or both.
- [ ] Decide whether giveaway claims can be reversed by members or only by admins.
- [ ] Decide how old weeks should be archived and browsed.
- [ ] Decide whether birthdays are shown as month/day only or with year hidden.

## Suggested Data Model

### Shared Entities

- [ ] Members
- [ ] Weeks
- [ ] Wishlist entries
- [ ] Wishlist images
- [ ] Giveaways
- [ ] Hangout events
- [ ] RSVPs
- [ ] Announcements

### Key Fields To Include Early

- [ ] Member display name
- [ ] Member home link
- [ ] Member birthday
- [ ] Member timezone or usual play time
- [ ] Wishlist week reference
- [ ] Giveaway claimed status
- [ ] Giveaway claimed by
- [ ] Hangout date and time
- [ ] RSVP status
- [ ] Facebook thread URL

### Local-Only Entities

- [ ] Gifted status by member
- [ ] Visited status by member
- [ ] Private notes by member
- [ ] Personal draft content

## App Structure

- [ ] This Week dashboard
- [ ] Members page
- [ ] Birthdays page
- [ ] Giveaways page
- [ ] Hangouts page
- [ ] My Notes page
- [ ] Admin page

## Sidebar Layout Plan

- [ ] Left sidebar navigation for core sections.
- [ ] Main content area focused on the currently selected board or gallery.
- [ ] Quick actions near the top for current week, Facebook thread, and home links.
- [ ] Small right-side utility area later if needed for private notes or recent activity.
- [ ] Keep the layout adaptable so it can be reused in a browser side panel extension.

## Build Phases

### Phase 1 - Foundation

- [x] Create the project structure.
- [x] Set up the base layout with sidebar navigation.
- [x] Define theme variables, spacing, and typography.
- [ ] Decide deployment target.
- [x] Set up config handling for Supabase connection details.

### Phase 2 - Data and Auth

- [ ] Create shared data tables or sheets.
- [ ] Set up storage for wishlist images.
- [ ] Implement role-aware access for admins versus members.
- [ ] Add basic invite or login flow.

### Phase 3 - Core Shared Features

- [ ] Build the member directory.
- [ ] Build the weekly wishlist gallery.
- [ ] Build the birthday board.
- [ ] Build the giveaway board.
- [ ] Build the hangout RSVP board.
- [ ] Add the Facebook thread link field where relevant.

### Phase 4 - Private Member Tools

- [ ] Add gifted and visited tracking stored locally.
- [ ] Add private notes stored locally.
- [ ] Add personal draft support stored locally.

### Phase 5 - Admin Workflow

- [ ] Add forms for creating and editing members, weeks, giveaways, hangouts, and announcements.
- [ ] Add archive management for older weeks.
- [ ] Add data validation and error handling.

### Phase 6 - Polish and Launch

- [ ] Seed the initial member data.
- [ ] Write a short onboarding guide for members.
- [ ] Test the app during one real weekly cycle.
- [ ] Fix pain points before wider rollout.
- [ ] Prepare the optional extension/sidebar phase.

## Success Criteria For v1

- [ ] Members can quickly find every group member's home link.
- [ ] Admins can post the current week's wishlists in one central place.
- [ ] Members can see birthdays, giveaways, and hangout attendance in one view.
- [ ] Private personal tracking stays private.
- [ ] The app is pleasant to use side-by-side with Facebook or YoWorld.

## Nice-To-Have Later

- [ ] Optional browser sidebar extension.
- [ ] Member profile customization.
- [ ] Secret angel or event draw tools.
- [ ] Better archives and search.
- [ ] Installable PWA version.
- [ ] Simple activity log for shared updates.

## First Recommended Actions

- [x] Finalize the backend choice.
- [x] Confirm whether v1 is admin-managed or member-editable.
- [x] Decide the first visual direction for the sidebar layout.
- [x] Scaffold the project once those three decisions are made.

## Current Visual Direction

- Warm clubhouse and corkboard feel rather than a generic dashboard.
- Persistent sidebar with soft gradients, paper cards, and quick-access actions.
- Desktop-first layout that still collapses cleanly on narrower screens.

## Current Implementation Notes

- The scaffold now runs as static files without Vite or npm dependencies.
- Supabase settings live in `src/config.js` for now.
- Shared data remains mock data until the first live Supabase reads are wired in.