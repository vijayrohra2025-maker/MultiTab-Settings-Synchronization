# Multi-Tab Settings Synchronization

A TypeScript web app for changing appearance, language, and reading size. Preferences are saved in the browser and synchronized across open tabs running this same app.

**GitHub repository:** [vijayrohra2025-maker/MultiTab-Settings-Synchronization](https://github.com/vijayrohra2025-maker/MultiTab-Settings-Synchronization)

## Features

- Light and dark appearance.
- English, Hindi, Spanish, and French preview text.
- Reading size from 12 px to 24 px.
- Quick presets, a reset button, and a live preview.
- Settings saved in `localStorage` and restored when the app is reopened.
- Changes synchronized to other open tabs using `BroadcastChannel`, with a browser storage-event fallback.
- Timestamp and tab-ID conflict handling for concurrent edits.

## Requirements

- [Node.js](https://nodejs.org/) and npm.
- Git, if you want to clone the repository.

## Installation

Clone the repository and move into its folder:

```sh
git clone https://github.com/vijayrohra2025-maker/MultiTab-Settings-Synchronization.git
cd MultiTab-Settings-Synchronization
```

Install the project dependencies:

```sh
npm install
```

## Run the application

Start Vite's development server:

```sh
npm run dev
```

Open the local URL printed in the terminal, usually `http://localhost:5173`.

To try multi-tab synchronization, open that same URL in two or more tabs in the same browser. Change a setting in one tab; the other tabs running this app should update without refreshing.

## Check and build

Check TypeScript types:

```sh
npm run typecheck
```

Create an optimized production build in the `dist` folder:

```sh
npm run build
```

Preview the production build locally after building:

```sh
npm run preview
```

## Synchronization and conflict resolution

Each settings update contains the full settings object, a timestamp, and the ID of the tab that made the change. The tab saves the update to `localStorage` and sends it through a `BroadcastChannel` named `settings-sync-v1`. Other tabs validate the message and apply it if its version is newer. If BroadcastChannel is unavailable, tabs listen for changes to the localStorage key instead.

Versions are compared in this order:

1. The update with the greater timestamp wins.
2. If timestamps match, the update with the lexicographically greater tab ID wins.

This gives tabs a deterministic last-write-wins rule. Older and duplicate messages are ignored. A receiving tab saves the winning update but does not rebroadcast it, which prevents message loops. The app reads and validates saved preferences before the first render, so the saved theme and font size are used immediately when a tab opens.

This approach is intended for tabs in the same browser and on the same device. It does not sync between different devices or browsers. Timestamp ordering is simple, but it is not a distributed database protocol and cannot guarantee a fixed synchronization time in every environment.

## Deployment

No deployed application link is available yet. Run the app locally using the instructions above.
