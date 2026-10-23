# Flarum Unread Button

A small Flarum 2 extension that adds an **Unread** button next to the discussion sort control. For signed-in users, it:

- opens Flarum's native unread filter at `?filter[unread]=1&sort=latest`;
- shows the current unread-post count;
- never writes `is:unread` into global search;
- removes the stale `is:unread` search state left by older custom implementations;
- stays hidden for guests.

The count follows Flarum's own `Discussion.unreadCount()` calculation: `min(max(lastPostNumber - lastReadPostNumber, 0), commentCount)` across the current user's unread discussions.

## Compatibility

- Flarum `2.0.0`
- PHP version required by Flarum 2

## Installation

Until the package is published on Packagist, install it directly from GitHub:

```bash
composer require prelude-22/flarum-unread-button:dev-main
php flarum cache:clear
```

Then enable **Unread Button** in the Flarum admin extension list.

## Development

The repository includes the ready-built `js/dist/forum.js`, so Node.js is not required on a production forum server.

To rebuild frontend assets locally:

```bash
cd js
npm install
npm run build
```

## License

MIT. See [LICENSE](LICENSE).