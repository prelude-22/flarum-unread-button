(()=>{"use strict";var exports={};(()=>{
  const unwrap = (value) => value && value.__esModule ? value.default : value;
  const app = unwrap(flarum.reg.get('core', 'forum/app'));
  const patch = flarum.reg.get('core', 'common/extend').extend;
  const IndexPage = unwrap(flarum.reg.get('core', 'forum/components/IndexPage'));
  const PAGE_SIZE = 50;
  const unreadRoute = () => app.route('index', { 'filter[unread]': '1', sort: 'latest' });
  const isUnreadIndex = () => { const filter = app.search.state.params().filter || {}; return filter.unread === '1'; };
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
    const load = () => app.request({ method: 'GET', url: app.forum.attribute('apiUrl') + '/discussions?filter[unread]=1&sort=-lastPostedAt&page[limit]=' + PAGE_SIZE + '&page[offset]=' + offset }).then((response) => {
      const discussions = response.data || [];
      count += discussions.reduce((total, discussion) => total + discussionUnreadCount(discussion.attributes), 0);
      offset += discussions.length;
      if (discussions.length === PAGE_SIZE && (!response.meta || !response.meta.total || offset < response.meta.total)) return load();
      app.cache.epimUnreadPostCount = count;
      m.redraw();
    });
    return load().catch(() => {});
  }
  // Required by Flarum 2's extension loader. Imperative UI registration follows.
  exports.extend = [];
  app.initializers.add('prelude-22-flarum-unread-button', () => {
    patch(IndexPage.prototype, 'oninit', () => {
      if (!isUnreadIndex() && app.search.state.params().q === 'is:unread') app.search.state.clear();
      countUnreadPosts();
    });
    patch(IndexPage.prototype, 'viewItems', (items) => {
      if (!app.session.user) return;
      const count = app.cache.epimUnreadPostCount || 0;
      items.add('prelude-22-flarum-unread-button', m('a.Button', {
        href: unreadRoute(), className: isUnreadIndex() ? 'active' : '',
        onclick(event) { event.preventDefault(); app.search.state.clear(); m.route.set(unreadRoute()); }
      }, count ? 'Unread (' + count + ')' : 'Unread'), -10);
    });
  });
})(),module.exports=exports})();