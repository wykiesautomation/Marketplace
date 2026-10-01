# Build25 Admin Demo Control

## Added
- Admin Marketplace Settings page.
- Show Demo Listings ON/OFF switch.
- Persistent global setting when Node backend is running.
- Browser-local fallback for GitHub Pages/static hosting.
- Demo cards and preview notice hide together.
- Empty-state call to action when demos are disabled and no real adverts exist.
- Audit event when admin changes the server setting.

## Important production gaps
- Current x-demo-user authentication must be replaced with real secure sessions before public launch.
- GitHub Pages cannot provide globally persistent admin settings or accept uploads by itself. Use the Node server for global control and real seller uploads.
