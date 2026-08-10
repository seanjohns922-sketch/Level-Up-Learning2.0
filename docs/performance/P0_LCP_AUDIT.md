# P0 Largest Contentful Paint Audit

Scope: Teacher Dashboard, School Home, and Student Home. Functionality, canonical saving, progression, and permissions remain unchanged.

## Teacher Dashboard

### Critical first render

- Supabase auth session resolution.
- Teacher class list (or the requested school-preview class access check and class row).

The route now server-renders a dashboard-shaped skeleton while these complete. Once the class list is known, the full dashboard shell renders immediately.

### Deferred hydration

- Selected-class roster.
- Number Nexus canonical progress.
- Measurelands canonical progress.
- Live student activity.
- Historical live activity events.
- School name and logo selection.

The roster is published as soon as its query completes. Progress and activity requests remain parallel and hydrate their existing panels afterward.

### Cache policy

Authenticated class, progress, and live-activity data must not be shared across users or cached as static route data. Existing 30-second live refresh behavior remains unchanged. Bundled curriculum and realm configuration require no network request.

## School Home

### Critical first render

- Preview cookie and adult session validation.
- School access context.
- School home snapshot RPC.
- School switcher context and administration permission.
- Mandatory access audit write.

The access audit write now overlaps the snapshot requests instead of creating a separate network waterfall. The existing route skeleton streams while the server snapshot resolves.

### Deferred hydration

- The canonical school-wide student directory is fetched only when the Students tab opens.

The directory has a dedicated table skeleton and refreshes after student creation or Explorer Code reset. Class and school overview data still server-render.

### Cache policy

School snapshots and directories are permission-sensitive and mutable, so they remain `no-store`. The small school logo uses `next/image` with priority. A shared cross-user cache is not appropriate for these records.

## Student Home

### Critical first render

- No data request blocks the visual shell.
- Canonical realm progress and secure student runtime context still load in parallel and continue to control the destination.

The branded backdrop and a stable journey skeleton render immediately. The previous 1.4 MB, 3840-pixel JPEG has been replaced on this route by a 124 KB, 1920-pixel WebP delivered through `next/image` with high fetch priority and responsive sizing.

### Cache policy

The visual asset can be cached by the image pipeline. Canonical student progress remains uncached because it determines placement and routing.

## Measurement

The code changes remove known LCP blockers, but a field LCP below 2.5 seconds must be confirmed after deployment using the same route and device percentile in Vercel Speed Insights. Field metrics aggregate real visits and will not update immediately after release.
