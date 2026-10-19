# Multi-Tab Settings Synchronization

A small React + TypeScript application for choosing a theme, language, and reading size. Preferences persist in `localStorage` and synchronize between tabs with `BroadcastChannel` (plus a `storage` event fallback).

## Features

- Light/dark appearance, English/Hindi/Spanish/French preview text, and 12–24 px reading size.
- Quick presets for Balanced, Night focus, and Easy reading, plus a one-click reset.
- Immediate cross-tab updates and persistence after reload.
- Visible local save status and a live summary of the active preferences.
- Validated storage, safe defaults, and timestamp + tab-ID last-write-wins ordering.
- Responsive layout and a live preview.

## Run it

Install Node.js, then from this folder run:

```sh
npm install
npm run dev
```

Open the local URL Vite prints in two or more tabs. Change a control in one tab and watch the others update. To make a production build, run `npm run build`; `npm run typecheck` checks TypeScript without emitting files. `npm run preview` serves a built version locally.

See [LEARN.md](./LEARN.md) for the complete beginner's guide, code walkthrough, manual test checklist, and interview preparation.

## Limitations

This coordinates tabs on the same browser origin and device. It does not synchronize separate devices or browsers. Timestamp ordering is simple and deterministic but depends on the local clock; it is not a distributed database protocol. Browser storage can be disabled or cleared. Google Fonts are optional network-loaded styling; the system fallback fonts still work offline.
