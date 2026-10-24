import app from 'flarum/forum/app';
import { extend as patch } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';

// Flarum 2 requires each frontend bundle to export this symbol.
export const extend = [];

const PAGE_SIZE = 50;
const unreadRoute = () => app.route('index', { 'filter[unread]': '1', sort: 'latest' });
const allDiscussionsRoute = () => app.route('index', { sort: 'latest' });
const isUnreadIndex = () => (app.search.state.params().filter || {}).unread === '1';

function discussionUnreadCount(attributes) {
  const lastPostNumber = Number(attributes.lastPostNumber) || 0;
  const lastReadPostNumber = Number(attributes.lastReadPostNumber) || 0;
  const commentCount = Number(attributes.commentCount) || 0;
  return Math.min(Math.max(0, lastPostNumber - lastReadPostNumber), commentCount);
}

function countUnreadPosts() {
  if (!app.session.user) return;
  let offset = 0;
  let count = 0;
  const load = () => app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/discussions?filter[unread]=1&sort=-lastPostedAt&page[limit]=${PAGE_SIZE}&page[offset]=${offset}` }).then((response) => {
    const discussions = response.data || [];
    count += discussions.reduce((total, discussion) => total + discussionUnreadCount(discussion.attributes), 0);
    offset += discussions.length;
    if (discussions.length === PAGE_SIZE && (!response.meta?.total || offset < response.meta.total)) return load();
    app.cache.epimUnreadPostCount = count;
    m.redraw();
  });
  return load().catch(() => {});
}

app.initializers.add('prelude-22-flarum-unread-button', () => {
  patch(IndexPage.prototype, 'oninit', () => {
    if (!isUnreadIndex() && app.search.state.params().q === 'is:unread') app.search.state.clear();
    countUnreadPosts();
  });
  patch(IndexPage.prototype, 'viewItems', (items) => {
    if (!app.session.user) return;
    const count = app.cache.epimUnreadPostCount || 0;
    items.add('prelude-22-flarum-unread-button', m('a.Button', {
      href: isUnreadIndex() ? allDiscussionsRoute() : unreadRoute(),
      className: isUnreadIndex() ? 'active' : '',
      onclick(event) {
        event.preventDefault();
        const destination = isUnreadIndex() ? allDiscussionsRoute() : unreadRoute();
        app.search.state.clear();
        m.route.set(destination);
      },
    }, count ? `Unread (${count})` : 'Unread'), 90);
  });
});