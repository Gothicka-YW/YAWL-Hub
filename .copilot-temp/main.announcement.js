const {
  adminChecklist,
  chatMessages: mockChatMessages = [],
  dashboard,
  giveaways: mockGiveaways,
  hangouts: mockHangouts,
  members: mockMembers,
  modelPosts: mockModelPosts = [],
  wishlists: mockWishlists,
  sections: baseSections,
} = window.YAWL_DATA;
const {
  consumeAuthRedirectSession,
  getStoredSession,
  getSupabaseStatus,
  getValidSession,
  hasSupabaseConfig,
  sendPasswordResetEmail,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  storageFetch,
  supabaseFetch,
  updatePassword,
  uploadStorageObject,
} = window.YAWL_SUPABASE;
const GOTHICKA_ADMIN_EMAIL = 'ywa.paint@gmail.com';
const ADMIN_YOMODELS_FIELD_MAP = {
  theme_title: 'themeTitle',
};
const facebookGroupUrl = sanitizeUrl(String(window.YAWL_CONFIG.facebookGroupUrl || ''));
const facebookThreadUrl = sanitizeUrl(String(dashboard.facebookThreadUrl || ''));
const yoKeysWidgetUrl = sanitizeUrl(String(window.YAWL_CONFIG.yoKeysWidgetUrl || ''));
const DASHBOARD_SETTINGS_KEY = 'main';
const DEFAULT_DASHBOARD_ANNOUNCEMENT = cleanText(String(dashboard.announcement || ''));
const DASHBOARD_ANNOUNCEMENT_MAX_LENGTH = 500;

const STORAGE_KEY = 'yawl-hub-private-tracker';
const YOMODELS_IMAGE_BUCKET = 'yomodels-images';
const YOMODELS_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const YOMODELS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const YOMODELS_THEME_TITLE_MAX_LENGTH = 120;
const MONTH_NAME_TO_NUMBER = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};
const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CUSTOM_EVENT_TYPE_KEY = 'custom';
const EVENT_TYPE_DETAILS = {
  birthday_party: { label: 'Birthday Party', indicator: 'B', className: 'event-type-icon--birthday-party' },
  meet_up: { label: 'Meet Up', indicator: 'M', className: 'event-type-icon--meet-up' },
  game: { label: 'Game', indicator: 'G', className: 'event-type-icon--game' },
  special_event: { label: 'Special Event', indicator: 'S', className: 'event-type-icon--special-event' },
};
const EVENT_TYPE_ORDER = ['birthday_party', 'meet_up', 'game', 'special_event'];
const ADMIN_AUTH_FIELD_MAP = {
  email: 'email',
  password: 'password',
};
const ADMIN_MEMBER_FIELD_MAP = {
  facebook_name: 'facebookName',
  in_game_name: 'inGameName',
  house_key: 'houseKey',
  birthday_raw: 'birthdayRaw',
  group_role: 'groupRole',
  notes: 'notes',
};
const ADMIN_EVENT_FIELD_MAP = {
  event_type: 'eventType',
  custom_event_type: 'customEventType',
  title: 'title',
  event_date: 'eventDate',
  start_time: 'startTime',
  end_time: 'endTime',
  timezone: 'timezone',
  host_name: 'hostName',
  location_text: 'locationText',
  yes_count: 'yesCount',
  maybe_count: 'maybeCount',
  no_count: 'noCount',
  details: 'details',
};
const ADMIN_ANNOUNCEMENT_FIELD_MAP = {
  announcement: 'announcement',
};
const ADMIN_WISHLIST_FIELD_MAP = {
  member_id: 'memberId',
  summary: 'summary',
  status_note: 'statusNote',
  thank_you_note: 'thankYouNote',
};
const ADMIN_CHAT_FIELD_MAP = {
  sender_member_id: 'memberId',
  channel_key: 'channelKey',
  message_text: 'messageText',
};
const ADMIN_GIVEAWAY_FIELD_MAP = {
  giver_member_id: 'memberId',
  title: 'title',
  item_text: 'itemText',
  ends_at_local: 'endsAtLocal',
};
const ADMIN_MEMBER_INVITE_FIELD_MAP = {
  invited_member_id: 'memberId',
  expires_in_days: 'expiresInDays',
};
const MEMBER_INVITE_CLAIM_FIELD_MAP = {
  invite_code: 'code',
};
const ADMIN_PASSWORD_RESET_FIELD_MAP = {
  new_password: 'newPassword',
  confirm_password: 'confirmPassword',
};
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_GROUP_SIZE = 4;
const INVITE_CODE_GROUP_COUNT = 4;
const DEFAULT_MEMBER_INVITE_EXPIRY_DAYS = 14;
const MAX_MEMBER_INVITE_EXPIRY_DAYS = 30;
const MIN_MEMBER_INVITE_LENGTH = 10;
const DEFAULT_EVENT_TIMEZONE = cleanText(window.YAWL_CONFIG.defaultEventTimezone || 'ET') || 'ET';
const WISHLIST_ITEM_SLOT_COUNT = 20;
const WISHLIST_OUT_OF_STORE_LIMIT = 10;
const WISHLIST_TIMEZONE = 'America/New_York';
const WISHLIST_IMAGE_BUCKET = 'wishlist-images';
const WISHLIST_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const WISHLIST_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);
const GIVEAWAY_IMAGE_BUCKET = 'giveaway-images';
const GIVEAWAY_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const GIVEAWAY_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);
const CHAT_CHANNELS = [
  {
    key: 'general',
    label: 'General',
    description: 'Everyday group chat for the whole hub.',
  },
  {
    key: 'giveaways',
    label: 'Giveaways',
    description: 'Use this room for giveaway reminders, entry updates, and winner chatter.',
  },
  {
    key: 'models',
    label: 'Models',
    description: 'Share looks, model inspiration, and outfit screenshots with the group.',
  },
];
const CHAT_IMAGE_BUCKET = 'chat-images';
const CHAT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const CHAT_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const CHAT_MESSAGE_MAX_LENGTH = 2000;
const CHAT_AUTO_REFRESH_MS = 20000;

const defaultPrivateState = {
  notes: '',
  gifted: {},
  visited: {},
};

const initialMembers = normalizeMockMembers(mockMembers);
const initialEvents = normalizeMockEvents(mockHangouts);
const initialWishlists = normalizeMockWishlists(mockWishlists, initialMembers);
const initialGiveaways = normalizeMockGiveaways(mockGiveaways, initialMembers);
const initialYoModelsPosts = normalizeMockYoModelsPosts(mockModelPosts);
const initialChatMessages = normalizeMockChatMessages(mockChatMessages, initialMembers);

const state = {
  activeSection: 'dashboard',
  dashboardAnnouncement: DEFAULT_DASHBOARD_ANNOUNCEMENT,
  dashboardAnnouncementSource: hasSupabaseConfig ? 'loading' : 'mock',
  dashboardAnnouncementSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading dashboard announcement...' : getSupabaseStatus(),
  memberDirectory: createDefaultMemberDirectoryState(),
  privateData: loadPrivateState(),
  members: initialMembers,
  memberSource: hasSupabaseConfig ? 'loading' : 'mock',
  memberSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading live member directory...' : getSupabaseStatus(),
  events: initialEvents,
  eventSource: hasSupabaseConfig ? 'loading' : 'mock',
  eventSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading shared events...' : getSupabaseStatus(),
  wishlists: initialWishlists,
  wishlistSource: hasSupabaseConfig ? 'loading' : 'mock',
  wishlistSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading weekly wish lists...' : getSupabaseStatus(),
  giveaways: initialGiveaways,
  giveawaySource: hasSupabaseConfig ? 'loading' : 'mock',
  giveawaySourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading live giveaways...' : getSupabaseStatus(),
  modelPosts: hasSupabaseConfig ? [] : initialYoModelsPosts,
  modelSource: hasSupabaseConfig ? 'loading' : 'mock',
  modelSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading YoModels...' : getSupabaseStatus(),
  chatMessages: hasSupabaseConfig ? [] : initialChatMessages,
  chatSource: hasSupabaseConfig ? 'loading' : 'mock',
  chatSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading live group chats...' : getSupabaseStatus(),
  activeChatChannel: CHAT_CHANNELS[0].key,
  admin: createDefaultAdminState(),
};

const app = document.querySelector('#app');

render();
void loadLiveDashboardAnnouncement();
void loadLiveMembers();
void loadLiveEvents();
void loadLiveWishlists();
void loadLiveGiveaways();
void loadLiveYoModels();
void loadLiveChatMessages();
void initializeAdminSession();
startChatAutoRefresh();

app.addEventListener('click', async (event) => {
  const navButton = event.target.closest('[data-section]');
  if (navButton) {
    state.activeSection = navButton.dataset.section;
    render();

    if (state.activeSection === 'models' && hasSupabaseConfig) {
      void loadLiveYoModels();
    }

    if (state.activeSection === 'chat' && hasSupabaseConfig) {
      void loadLiveChatMessages();
    }

    return;
  }

  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const { toggle: type, memberId } = toggle.dataset;
    const currentValue = Boolean(state.privateData[type][memberId]);

    state.privateData = {
      ...state.privateData,
      [type]: {
        ...state.privateData[type],
        [memberId]: !currentValue,
      },
    };

    savePrivateState();
    render();
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) {
    return;
  }

  const {
    action,
    memberId,
    eventId,
    giveawayId,
    modelId,
    messageId,
    chatChannel,
  } = actionButton.dataset;

  switch (action) {
    case 'members-clear-filters':
      state.memberDirectory = createDefaultMemberDirectoryState();
      render();
      restoreMemberDirectorySearchFocus();
      return;
    case 'calendar-open-event':
      if (!cleanText(eventId)) {
        return;
      }

      state.activeSection = 'hangouts';
      render();
      scheduleScrollTo(`[data-event-card-id="${cleanText(eventId)}"]`);
      return;
    case 'admin-edit-member':
      beginEditingMember(memberId);
      render();
      scheduleScrollTo('[data-admin-member-form]');
      return;
    case 'admin-reset-member-form':
      resetAdminEditor();
      render();
      return;
    case 'admin-edit-event':
      beginEditingEvent(eventId);
      render();
      scheduleScrollTo('[data-admin-event-form]');
      return;
    case 'admin-reset-event-form':
      resetAdminEventEditor();
      render();
      return;
    case 'wishlist-edit':
      beginEditingWishlist(memberId);
      render();
      scheduleScrollTo('[data-wishlist-form]');
      return;
    case 'wishlist-reset-form':
      resetWishlistEditor();
      render();
      return;
    case 'giveaway-edit':
      beginEditingGiveaway(giveawayId);
      render();
      scheduleScrollTo('[data-giveaway-form]');
      return;
    case 'giveaway-reopen':
      beginEditingGiveaway(giveawayId, { reopen: true });
      render();
      scheduleScrollTo('[data-giveaway-form]');
      return;
    case 'giveaway-reset-form':
      resetGiveawayEditor();
      render();
      return;
    case 'models-reset-form':
      resetYoModelsComposer();
      render();
      return;
    case 'models-refresh':
      await loadLiveYoModels();
      return;
    case 'chat-set-channel':
      state.activeChatChannel = normalizeChatChannelKey(chatChannel);
      state.admin.chatForm = {
        ...state.admin.chatForm,
        channelKey: state.activeChatChannel,
      };
      render();
      return;
    case 'chat-reset-form':
      resetChatComposer();
      render();
      return;
    case 'chat-refresh':
      await loadLiveChatMessages();
      return;
    case 'admin-refresh-session':
      await initializeAdminSession(true);
      return;
    case 'admin-copy-generated-invite':
      await copyGeneratedInviteCode();
      return;
    case 'admin-sign-out':
      await handleAdminSignOut();
      return;
    case 'admin-deactivate-member':
      await deactivateMember(memberId);
      return;
    case 'admin-deactivate-event':
      await deactivateEvent(eventId);
      return;
    case 'giveaway-toggle-entry':
      await handleGiveawayEntryToggle(giveawayId);
      return;
    case 'giveaway-copy-entrants':
      await copyGiveawayEntrants(giveawayId);
      return;
    case 'giveaway-pick-winner':
      await pickGiveawayWinner(giveawayId);
      return;
    case 'giveaway-reroll-winner':
      await rerollGiveawayWinner(giveawayId);
      return;
    case 'giveaway-deactivate':
      await deactivateGiveaway(giveawayId);
      return;
    case 'models-deactivate-post':
      await deactivateYoModelsPost(modelId);
      return;
    case 'chat-delete-message':
      await deleteChatMessage(messageId);
      return;
    default:
      return;
  }
});

app.addEventListener('input', (event) => {
  if (event.target.matches('[data-member-search]')) {
    const selectionStart = event.target instanceof HTMLInputElement ? event.target.selectionStart : null;
    const selectionEnd = event.target instanceof HTMLInputElement ? event.target.selectionEnd : null;

    state.memberDirectory = {
      ...state.memberDirectory,
      query: event.target.value,
    };

    render();
    restoreMemberDirectorySearchFocus(selectionStart, selectionEnd);
    return;
  }

  if (event.target.matches('[data-private-notes]')) {
    state.privateData = {
      ...state.privateData,
      notes: event.target.value,
    };

    savePrivateState();
    return;
  }

  syncAdminDraftField(event.target);
});

app.addEventListener('change', (event) => {
  if (event.target.matches('[data-member-role-filter]')) {
    state.memberDirectory = {
      ...state.memberDirectory,
      role: normalizeDirectoryRoleFilter(event.target.value),
    };

    render();
    return;
  }

  if (event.target.matches('[data-member-home-filter]')) {
    state.memberDirectory = {
      ...state.memberDirectory,
      onlyHomeLink: Boolean(event.target.checked),
    };

    render();
    return;
  }

  syncAdminDraftField(event.target);
});

app.addEventListener('submit', async (event) => {
  if (event.target.matches('[data-admin-auth-form]')) {
    event.preventDefault();
    await handleAdminAuthSubmit(event);
    return;
  }

  if (event.target.matches('[data-admin-announcement-form]')) {
    event.preventDefault();
    await handleAdminAnnouncementSubmit(event);
    return;
  }

  if (event.target.matches('[data-admin-member-form]')) {
    event.preventDefault();
    await handleAdminMemberSubmit(event);
    return;
  }

  if (event.target.matches('[data-admin-event-form]')) {
    event.preventDefault();
    await handleAdminEventSubmit(event);
    return;
  }

  if (event.target.matches('[data-wishlist-form]')) {
    event.preventDefault();
    await handleWishlistSubmit(event);
    return;
  }

  if (event.target.matches('[data-giveaway-form]')) {
    event.preventDefault();
    await handleGiveawaySubmit(event);
    return;
  }

  if (event.target.matches('[data-models-form]')) {
    event.preventDefault();
    await handleYoModelsSubmit(event);
    return;
  }

  if (event.target.matches('[data-chat-form]')) {
    event.preventDefault();
    await handleChatSubmit(event);
    return;
  }

  if (event.target.matches('[data-wishlist-comment-form]')) {
    event.preventDefault();
    await handleWishlistCommentSubmit(event);
    return;
  }

  if (event.target.matches('[data-admin-member-invite-form]')) {
    event.preventDefault();
    await handleAdminMemberInviteSubmit(event);
    return;
  }

  if (event.target.matches('[data-member-invite-claim-form]')) {
    event.preventDefault();
    await handleMemberInviteClaimSubmit(event);
    return;
  }

  if (event.target.matches('[data-admin-password-reset-form]')) {
    event.preventDefault();
    await handlePasswordResetSubmit(event);
    return;
  }
});

function render() {
  ensureValidActiveSection();

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand-block">
          <p class="eyebrow">YoAngels Wish List</p>
          <h1>YAWL Hub</h1>
          <p class="brand-copy">A warm, welcoming group for sharing and celebrating each other in YoWorld.</p>
        </div>

        <div class="status-pill ${state.memberSource === 'live' ? 'status-pill--live' : ''}">
          ${escapeHtml(getDirectoryStatusText())}
        </div>

        <nav class="nav-list" aria-label="Primary">
          ${getSections()
            .map(
              (section) => `
                <button
                  class="nav-button ${section.id === state.activeSection ? 'nav-button--active' : ''}"
                  type="button"
                  data-section="${section.id}"
                >
                  <span>${section.label}</span>
                </button>
              `,
            )
            .join('')}
        </nav>

        <div class="quick-card">
          <p class="quick-card__label">Current Week</p>
          <strong>${dashboard.weekLabel}</strong>
          ${renderSidebarLinks()}
        </div>
      </aside>

      <main class="content">
        ${renderHeader()}
        ${renderSection()}
      </main>
    </div>
  `;
}

function renderHeader() {
  return `
    <header class="hero">
      <div>
        <p class="eyebrow">YAWL Hub</p>
        <h2>${getSectionTitle()}</h2>
      </div>
      <div class="hero__actions">
        ${renderHeaderLinks()}
        <button class="hero-button hero-button--secondary" type="button" data-section="notes">Personal Notes</button>
      </div>
    </header>
  `;
}

function renderSidebarLinks() {
  const links = [];

  if (facebookGroupUrl) {
    links.push(`
      <a class="quick-link" href="${facebookGroupUrl}" target="_blank" rel="noreferrer">
        Open Facebook Group
      </a>
    `);
  }

  if (facebookThreadUrl) {
    links.push(`
      <a class="quick-link" href="${facebookThreadUrl}" target="_blank" rel="noreferrer">
        Open Weekly Thread
      </a>
    `);
  }

  if (yoKeysWidgetUrl) {
    links.push(`
      <a class="quick-link" href="${yoKeysWidgetUrl}" target="_blank" rel="noreferrer">
        Open YoKeys Widget
      </a>
    `);
  }

  if (!links.length) {
    return '<p class="quick-link quick-link--muted">Add group and tool links in src/config.js.</p>';
  }

  return `<div class="quick-links">${links.join('')}</div>`;
}

function renderHeaderLinks() {
  const links = [];

  if (facebookGroupUrl) {
    links.push(
      `<a class="hero-button" href="${facebookGroupUrl}" target="_blank" rel="noreferrer">Facebook Group</a>`,
    );
  }

  if (facebookThreadUrl) {
    links.push(
      `<a class="hero-button hero-button--secondary" href="${facebookThreadUrl}" target="_blank" rel="noreferrer">Weekly Thread</a>`,
    );
  }

  if (yoKeysWidgetUrl) {
    links.push(
      `<a class="hero-button hero-button--secondary" href="${yoKeysWidgetUrl}" target="_blank" rel="noreferrer">YoKeys Widget</a>`,
    );
  }

  return links.join('');
}

function getSectionTitle() {
  const current = getSections().find((section) => section.id === state.activeSection);
  return current ? current.label : 'This Week';
}

function getSections() {
  const visibleSections = baseSections.filter((section) => section.id !== 'birthdays');

  if (hasAdminToolsAccess()) {
    visibleSections.push({ id: 'admin', label: 'Admin Tools' });
  }

  return visibleSections;
}

function ensureValidActiveSection() {
  if (state.activeSection === 'birthdays') {
    state.activeSection = 'dashboard';
    return;
  }

  const visibleSectionIds = new Set(getSections().map((section) => section.id));

  if (!visibleSectionIds.has(state.activeSection)) {
    state.activeSection = visibleSectionIds.has('account') ? 'account' : 'dashboard';
  }
}

function hasStaffProfile() {
  return Boolean(state.admin.staffProfile?.isActive);
}

function canManageMembers() {
  return Boolean(state.admin.staffProfile?.isActive && state.admin.staffProfile.canManageMembers);
}

function canManageEvents() {
  return Boolean(state.admin.staffProfile?.isActive && state.admin.staffProfile.canManageEvents);
}

function canManageWishlistPosts() {
  return canManageMembers();
}

function canManageGiveawayPosts() {
  return canManageMembers() || canManageEvents();
}

function canModerateChatMessages() {
  return canManageMembers();
}

function canManageYoModels() {
  const staffEmail = cleanText(state.admin.staffProfile?.email).toLowerCase();
  const sessionEmail = cleanText(state.admin.session?.user?.email).toLowerCase();

  return Boolean(
    hasStaffProfile()
    && staffEmail === GOTHICKA_ADMIN_EMAIL
    && sessionEmail === GOTHICKA_ADMIN_EMAIL,
  );
}

function canPostOwnEvents() {
  return Boolean(getLinkedEventMember());
}

function canCreateEventPost() {
  return canManageEvents() || canPostOwnEvents();
}

function canEditEvent(calendarEvent) {
  if (!calendarEvent) {
    return false;
  }

  if (canManageEvents()) {
    return true;
  }

  const linkedMember = getLinkedEventMember();
  const sessionUserId = getSessionUserId();
  const sessionEmail = cleanText(state.admin.session?.user?.email).toLowerCase();

  if (!linkedMember || (!sessionUserId && !sessionEmail)) {
    return false;
  }

  return (
    cleanText(calendarEvent.hostMemberId) === cleanText(linkedMember.id)
    && (
      (sessionUserId && cleanText(calendarEvent.createdByUserId) === sessionUserId)
      || (sessionEmail && cleanText(calendarEvent.createdByEmail).toLowerCase() === sessionEmail)
    )
  );
}

function canEditWishlistPost(wishlist) {
  if (!wishlist) {
    return false;
  }

  if (canManageWishlistPosts()) {
    return true;
  }

  const linkedMember = getLinkedWishlistMember();
  return Boolean(linkedMember && cleanText(linkedMember.id) === cleanText(wishlist.memberId));
}

function canManageGiveaway(giveaway) {
  if (!giveaway) {
    return false;
  }

  if (canManageGiveawayPosts()) {
    return true;
  }

  const linkedMember = getLinkedGiveawayMember();
  const sessionUserId = getSessionUserId();
  const sessionEmail = cleanText(state.admin.session?.user?.email).toLowerCase();

  if (!linkedMember || (!sessionUserId && !sessionEmail)) {
    return false;
  }

  return (
    cleanText(giveaway.giverMemberId) === cleanText(linkedMember.id)
    && (
      (sessionUserId && cleanText(giveaway.createdByUserId) === sessionUserId)
      || (sessionEmail && cleanText(giveaway.createdByEmail).toLowerCase() === sessionEmail)
    )
  );
}

function canEnterGiveaway(giveaway) {
  if (!giveaway || !giveaway.isOpen) {
    return false;
  }

  const linkedMember = getLinkedGiveawayMember();
  const sessionUserId = getSessionUserId();
  const sessionEmail = cleanText(state.admin.session?.user?.email).toLowerCase();

  if (!linkedMember || (!sessionUserId && !sessionEmail)) {
    return false;
  }

  if (cleanText(giveaway.giverMemberId) === cleanText(linkedMember.id)) {
    return false;
  }

  return true;
}

function hasLinkedWishlistAccess() {
  return Boolean(getLinkedWishlistMember());
}

function hasAdminToolsAccess() {
  return canManageMembers() || canManageEvents();
}

function renderSection() {
  switch (state.activeSection) {
    case 'account':
      return renderAccount();
    case 'models':
      return renderYoModels();
    case 'chat':
      return renderChat();
    case 'wishlists':
      return renderWishlists();
    case 'members':
      return renderMembers();
    case 'giveaways':
      return renderGiveaways();
    case 'hangouts':
      return renderHangouts();
    case 'notes':
      return renderNotes();
    case 'admin':
      return renderAdmin();
    case 'dashboard':
    default:
      return renderDashboard();
  }
}

function renderDashboard() {
  const upcomingMembers = getUpcomingBirthdayMembers(3);
  const dashboardCalendar = buildDashboardCalendarModel(getEvents(), getBirthdayMembers());
  const dashboardStats = getDashboardStats(upcomingMembers);

  return `
    <section class="panel-grid panel-grid--dashboard">
      <article class="panel panel--announcement panel--feature dashboard-card dashboard-card--announcement">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Announcement</p>
            <h3>Weekly headquarters</h3>
          </div>
          <span class="tag">${dashboard.weekLabel}</span>
        </div>
        <p class="panel-lead">${escapeHtml(state.dashboardAnnouncement || DEFAULT_DASHBOARD_ANNOUNCEMENT)}</p>
      </article>

      ${renderDashboardCalendarPanel(dashboardCalendar)}

      <article class="stats-grid stats-grid--dashboard dashboard-card dashboard-card--stats">
        ${dashboardStats
          .map(
            (stat) => `
              <div class="stat-card">
                <span>${stat.label}</span>
                <strong>${stat.value}</strong>
              </div>
            `,
          )
          .join('')}
      </article>

      ${renderLaunchpadPanel()}

      <article class="panel panel--directory dashboard-card dashboard-card--upcoming">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Upcoming</p>
            <h3>Birthdays soon</h3>
          </div>
          <span class="tag">${escapeHtml(`${upcomingMembers.length}`)}</span>
        </div>
        <div class="dashboard-upcoming-list">
          ${upcomingMembers.length
            ? upcomingMembers
                .map(
                  (member) => `
                    <div class="dashboard-upcoming-item">
                      <strong>${escapeHtml(member.displayName)}</strong>
                      <span>${escapeHtml(member.birthdayLabel)}</span>
                    </div>
                  `,
                )
                .join('')
            : `
                <div class="dashboard-upcoming-empty">
                  <span>${escapeHtml(state.memberSource === 'loading' ? 'Loading live member birthdays...' : 'No member birthdays available yet.')}</span>
                </div>
              `}
        </div>
      </article>
    </section>
  `;
}

function renderWishlists() {
  ensureWishlistEditorState();

  const wishlists = getActiveWishlists();
  const editorState = getWishlistEditorState();

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderWishlistSourceNotice()}
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Wish List Board</p>
            <h3>Active wish lists of the week</h3>
          </div>
          <span class="tag">${escapeHtml(`${wishlists.length} active`)}</span>
        </div>
        <p class="panel-lead">Use this board like a clean weekly wish list thread. Each member gets one image post for the current Sunday reset, and comments let gifters say when they helped.</p>
      </article>

      ${renderWishlistNotice()}
      ${renderWishlistComposer(editorState)}

      <article class="panel panel--directory panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">This Week</p>
            <h3>Who has an active wish list</h3>
          </div>
          <span class="tag">${escapeHtml(`${wishlists.length} boards live`)}</span>
        </div>
        <div class="wishlist-board">
          ${wishlists.length
            ? wishlists.map((wishlist) => renderWishlistCard(wishlist)).join('')
            : `
                <div class="list-row list-row--compact">
                  <span>No wish lists are active this week yet.</span>
                </div>
              `}
        </div>
      </article>
    </section>
  `;
}

function renderWishlistCard(wishlist) {
  const canEditThisPost = canEditWishlistPost(wishlist);

  return `
    <article class="wishlist-card">
      <div class="wishlist-card__media">
        ${renderWishlistBoardMedia(wishlist, 'wishlist-card__image')}
      </div>
      <div class="wishlist-card__body">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">${escapeHtml(wishlist.weekLabel)}</p>
            <h3>${escapeHtml(wishlist.memberName)}</h3>
          </div>
          <span class="tag">${escapeHtml(wishlist.lastUpdatedLabel)}</span>
        </div>
        <p class="panel-lead">${escapeHtml(wishlist.summary)}</p>
        <div class="wishlist-counts wishlist-counts--board">
          ${renderWishlistCountTag(`${wishlist.commentCount} comments`, '')}
          ${renderWishlistCountTag(`${wishlist.giftedCommentCount} gifted notes`, wishlist.giftedCommentCount > 0 ? 'wishlist-count--success' : '')}
          ${canEditThisPost ? renderWishlistCountTag('You can update this post', 'wishlist-count--success') : ''}
        </div>
        <div class="stack-list">
          <div class="list-row list-row--compact">
            <strong>Status</strong>
            <span>${escapeHtml(wishlist.statusNote)}</span>
          </div>
          ${wishlist.thankYouSummary
            ? `
                <div class="list-row list-row--compact">
                  <strong>Thanks</strong>
                  <span>${escapeHtml(wishlist.thankYouSummary)}</span>
                </div>
              `
            : ''}
        </div>
        ${wishlist.thankYouNote ? `<p class="wishlist-note"><strong>Thank-you note:</strong> ${escapeHtml(wishlist.thankYouNote)}</p>` : ''}
        <div class="button-row">
          ${wishlist.homeLink ? `<a class="hero-button hero-button--secondary" href="${wishlist.homeLink}" target="_blank" rel="noreferrer">Open Home Link</a>` : ''}
          ${wishlist.imageUrl ? `<a class="hero-button hero-button--secondary" href="${wishlist.imageUrl}" target="_blank" rel="noreferrer">Open Board Image</a>` : ''}
          ${canEditThisPost ? `<button class="hero-button hero-button--secondary" type="button" data-action="wishlist-edit" data-member-id="${escapeHtml(wishlist.memberId)}">Edit This Board</button>` : ''}
        </div>
        ${renderWishlistComments(wishlist)}
      </div>
    </article>
  `;
}

function renderWishlistComposer(editorState) {
  const canManagePosts = canManageWishlistPosts();

  if (!state.admin.session) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post Your Wish List</p>
            <h3>Sign in to manage this week's board</h3>
          </div>
        </div>
        <p class="panel-lead">Wish list posting uses your YAWL Hub account so weekly image posts stay tied to the right member. Claimed member accounts can manage only their own current-week wish list.</p>
        <div class="button-row">
          <button class="hero-button" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  if (!editorState.canEdit) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post Your Wish List</p>
            <h3>Claim your member invite first</h3>
          </div>
        </div>
        <p class="panel-lead">Ask an admin for your invite code, then open Account to claim your member profile before posting this week's wish list.</p>
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  if (!editorState.selectedMember) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post Your Wish List</p>
            <h3>Load the member directory first</h3>
          </div>
        </div>
        <p class="panel-lead">The wish list composer needs an active member record before this post can be assigned.</p>
      </article>
    `;
  }

  const form = state.admin.wishlistForm;
  const selectedMember = editorState.selectedMember;
  const isEditingLiveBoard = Boolean(editorState.currentWishlist?.id);
  const previewUrl = form.boardImagePreviewUrl || editorState.currentWishlist?.imageUrl || '';
  const imageName = form.boardImageName || editorState.currentWishlist?.imageName || '';

  return `
    <article class="panel panel--span-full">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Post Your Wish List</p>
          <h3>${escapeHtml(isEditingLiveBoard ? 'Update this week\'s wish list' : 'Create this week\'s wish list')}</h3>
        </div>
        <span class="tag">${escapeHtml(formatWishlistWeekLabel(getCurrentWishlistWeekStartIso()))}</span>
      </div>
      <p class="panel-lead">${escapeHtml(canManagePosts
        ? 'Staff can post or update the current-week board for any active member. Select the member first, then save the board below.'
        : 'Upload a PNG or JPEG of your wish list board. It always posts under your linked member profile, and saving again updates the same weekly post instead of creating a second one.')}</p>
      <form class="admin-form wishlist-image-form" data-wishlist-form>
        <div class="form-grid">
          ${canManagePosts
            ? `
                <label class="field-group">
                  <span>Posting For</span>
                  <select class="text-input" name="member_id">
                    ${renderWishlistMemberOptions(editorState.availableMembers, form.memberId || selectedMember.id)}
                  </select>
                  <small class="field-help">Staff can create or update the current-week board for any active member.</small>
                </label>
              `
            : `
                <label class="field-group">
                  <span>Posting As</span>
                  <input class="text-input" type="text" value="${escapeHtml(selectedMember.displayName || 'Linked member')}" readonly />
                </label>
                <input type="hidden" name="member_id" value="${escapeHtml(form.memberId)}" />
              `}
          <label class="field-group field-group--wide wishlist-upload-field">
            <span>Wish List Image</span>
            <input class="text-input" type="file" name="board_image_file" accept="image/png,image/jpeg" />
            <small class="field-help">PNG or JPEG, up to ${Math.round(WISHLIST_IMAGE_MAX_BYTES / (1024 * 1024))} MB. Choose a new image here when you want to update the post.</small>
          </label>
          <div class="wishlist-image-preview field-group--wide">
            ${previewUrl
              ? `<img class="wishlist-image-preview__image" src="${previewUrl}" alt="${escapeHtml(`${selectedMember?.displayName || 'Member'} wish list preview`)}" />`
              : `
                  <div class="wishlist-card__placeholder">
                    <strong>No image selected</strong>
                    <span>Upload a PNG or JPEG wish list board.</span>
                  </div>
                `}
            ${imageName ? `<span class="field-help">${escapeHtml(imageName)}</span>` : ''}
          </div>
          <label class="field-group field-group--wide">
            <span>Wish List Summary</span>
            <textarea name="summary" class="admin-textarea" placeholder="Short note about this week's board.">${escapeHtml(form.summary)}</textarea>
          </label>
          <label class="field-group field-group--wide">
            <span>Status Note</span>
            <textarea name="status_note" class="admin-textarea" placeholder="Example: Updated after evening gifts and porch visits.">${escapeHtml(form.statusNote)}</textarea>
          </label>
          <label class="field-group field-group--wide">
            <span>Thank-you Note</span>
            <textarea name="thank_you_note" class="admin-textarea" placeholder="Optional public thank-you note for gifters.">${escapeHtml(form.thankYouNote)}</textarea>
          </label>
        </div>
        <div class="wishlist-editor-toolbar">
          <div class="wishlist-counts wishlist-counts--board">
            ${renderWishlistCountTag(isEditingLiveBoard ? 'Updating current-week post' : 'New current-week post', '')}
            ${previewUrl ? renderWishlistCountTag('Image ready', 'wishlist-count--success') : renderWishlistCountTag('Image required', 'wishlist-count--warning')}
          </div>
          ${selectedMember?.homeLink ? `<a class="hero-button hero-button--secondary" href="${selectedMember.homeLink}" target="_blank" rel="noreferrer">Open ${escapeHtml(selectedMember.displayName)}'s Home</a>` : ''}
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">${escapeHtml(isEditingLiveBoard ? 'Save This Week\'s Wish List' : 'Post This Week\'s Wish List')}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="wishlist-reset-form">Reset Form</button>
        </div>
      </form>
      <p class="muted">Home links come from the member directory automatically. If a member's house key changes, update it in Members and the next wish list save will use the new link.</p>
    </article>
  `;
}

function renderWishlistBoardMedia(wishlist, imageClassName) {
  if (wishlist.imageUrl) {
    return `<img class="${imageClassName}" src="${wishlist.imageUrl}" alt="${escapeHtml(`${wishlist.memberName} weekly wish list`)}" loading="lazy" />`;
  }

  const previewItems = wishlist.items.filter((item) => item.imageUrl).slice(0, 4);

  if (previewItems.length) {
    return renderWishlistPreviewMedia(previewItems, wishlist.memberName);
  }

  return `
    <div class="wishlist-card__placeholder">
      <strong>${escapeHtml(wishlist.memberName)}</strong>
      <span>No wish list image yet</span>
    </div>
  `;
}

function renderWishlistPreviewMedia(items, memberName) {
  return `
    <div class="wish-thumb-grid" aria-label="${escapeHtml(`${memberName} legacy wish list item preview`)}">
      ${items
        .map(
          (item) => `
            <div class="wish-thumb-grid__item">
              <img class="wish-thumb-grid__image" src="${item.imageUrl}" alt="${escapeHtml(item.name || `${memberName} wish list item`)}" loading="lazy" />
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderWishlistItemsGrid(items, memberName) {
  return `
    <div class="wishlist-items-grid" aria-label="${escapeHtml(`${memberName} wish list items`)}">
      ${items.map((item) => renderWishlistItemCard(item)).join('')}
    </div>
  `;
}

function renderWishlistItemCard(item) {
  const cardBody = `
    <div class="wishlist-item__media">
      ${item.imageUrl
        ? `<img class="wishlist-item__image" src="${item.imageUrl}" alt="${escapeHtml(item.name || 'Wish list item')}" loading="lazy" />`
        : '<div class="wishlist-item__placeholder">Image pending</div>'}
    </div>
    <div class="wishlist-item__body">
      <strong class="wishlist-item__name">${escapeHtml(item.name || 'Wish list item')}</strong>
      <div class="wishlist-item__tags">
        <span class="tag ${item.availabilityStatus === 'out_of_store' ? 'tag--role-event' : 'tag--muted'}">${escapeHtml(formatWishlistAvailabilityLabel(item.availabilityStatus))}</span>
        ${item.isReceived ? `<span class="tag tag--role-helper">${escapeHtml(item.receivedFrom ? `Gifted by ${item.receivedFrom}` : 'Gifted')}</span>` : ''}
      </div>
    </div>
  `;

  if (item.sourceUrl) {
    return `<a class="wishlist-item ${item.isReceived ? 'wishlist-item--received' : ''}" href="${item.sourceUrl}" target="_blank" rel="noreferrer">${cardBody}</a>`;
  }

  return `<div class="wishlist-item ${item.isReceived ? 'wishlist-item--received' : ''}">${cardBody}</div>`;
}

function renderWishlistCountTag(label, className) {
  return `<span class="tag wishlist-count ${className}">${escapeHtml(label)}</span>`;
}

function renderWishlistNotice() {
  if (!state.admin.notice || state.activeSection !== 'wishlists') {
    return '';
  }

  return `
    <article class="panel panel--span-full">
      ${renderAdminNotice()}
    </article>
  `;
}

function renderWishlistComments(wishlist) {
  const comments = Array.isArray(wishlist.comments) ? wishlist.comments : [];
  const defaultCommenter = getDefaultWishlistCommenterName();

  return `
    <section class="wishlist-comments" aria-label="${escapeHtml(`${wishlist.memberName} gift comments`)}">
      <div class="wishlist-comments__heading">
        <div>
          <p class="eyebrow">Gift Comments</p>
          <h4>Let ${escapeHtml(wishlist.memberName)} know</h4>
        </div>
        <span class="tag">${escapeHtml(`${comments.length} total`)}</span>
      </div>
      <div class="wishlist-comments__list">
        ${comments.length
          ? comments.map((comment) => renderWishlistComment(comment)).join('')
          : '<p class="muted">No gift comments yet.</p>'}
      </div>
      <form class="wishlist-comment-form" data-wishlist-comment-form>
        <input type="hidden" name="wishlist_id" value="${escapeHtml(wishlist.id)}" />
        <div class="form-grid form-grid--comment">
          <label class="field-group">
            <span>Your Name</span>
            <input class="text-input" type="text" name="commenter_name" value="${escapeHtml(defaultCommenter)}" placeholder="Your group name" required />
          </label>
          <label class="field-group field-group--checkbox wishlist-comment-gifted">
            <span>I gifted</span>
            <input type="checkbox" name="did_gift" checked />
          </label>
          <label class="field-group field-group--wide">
            <span>Comment</span>
            <textarea name="comment_text" class="admin-textarea wishlist-comment-textarea" placeholder="Optional note, item gifted, or porch update."></textarea>
          </label>
        </div>
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="submit">Post Gift Comment</button>
        </div>
      </form>
    </section>
  `;
}

function renderWishlistComment(comment) {
  return `
    <article class="wishlist-comment">
      <div class="wishlist-comment__meta">
        <strong>${escapeHtml(comment.commenterName)}</strong>
        <span>${escapeHtml(comment.createdLabel)}</span>
      </div>
      ${comment.didGift ? '<span class="tag wishlist-count--success">Gifted</span>' : ''}
      ${comment.commentText ? `<p>${escapeHtml(comment.commentText)}</p>` : ''}
    </article>
  `;
}

function getDefaultWishlistCommenterName() {
  const linkedMember = getLinkedWishlistMember();
  return cleanText(linkedMember?.displayName || state.admin.staffProfile?.displayName || '');
}

function renderWishlistMemberOptions(members, selectedMemberId) {
  return members
    .map(
      (member) => `
        <option value="${escapeHtml(member.id)}" ${member.id === selectedMemberId ? 'selected' : ''}>${escapeHtml(member.displayName)}</option>
      `,
    )
    .join('');
}

function renderWishlistAvailabilityOptions(selectedValue) {
  return ['in_store', 'out_of_store']
    .map(
      (value) => `
        <option value="${value}" ${normalizeWishlistAvailability(value) === normalizeWishlistAvailability(selectedValue) ? 'selected' : ''}>${escapeHtml(formatWishlistAvailabilityLabel(value))}</option>
      `,
    )
    .join('');
}

function renderDashboardCalendarPanel(calendarModel) {
  return `
    <article class="panel panel--calendar dashboard-card dashboard-card--calendar">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Shared Calendar</p>
          <h3>${escapeHtml(calendarModel.monthLabel)}</h3>
        </div>
        <span class="tag">${escapeHtml(`${calendarModel.calendarItemCount} on calendar`)}</span>
      </div>
      <p class="panel-lead">${escapeHtml(getDashboardCalendarLeadText(calendarModel))}</p>
      <div class="month-calendar" role="group" aria-label="${escapeHtml(`Calendar for ${calendarModel.monthLabel}`)}">
        <div class="month-calendar__weekdays" aria-hidden="true">
          ${WEEKDAY_NAMES_SHORT.map((weekday) => `<span class="month-calendar__weekday">${escapeHtml(weekday)}</span>`).join('')}
        </div>
        <div class="month-calendar__grid">
          ${calendarModel.cells.map((cell) => renderDashboardCalendarCell(cell)).join('')}
        </div>
      </div>
    </article>
  `;
}

function renderDashboardCalendarCell(cell) {
  if (cell.kind === 'blank') {
    return '<div class="month-calendar__cell month-calendar__cell--empty" aria-hidden="true"></div>';
  }

  const primaryCalendarItem = cell.calendarItems[0];
  const detailTarget = getDashboardCalendarDetailTarget(cell);
  const moreCount = Math.max(0, cell.calendarItems.length - 1);
  const cellClasses = [
    'month-calendar__cell',
    cell.isToday ? 'month-calendar__cell--today' : '',
    cell.calendarItems.length ? 'month-calendar__cell--has-events' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const cellTitle = buildDashboardCalendarCellTitle(cell);

  return `
    <div class="${cellClasses}"${cellTitle ? ` title="${escapeHtml(cellTitle)}"` : ''}>
      <div class="month-calendar__day-row">
        <span class="month-calendar__day-number">${cell.dayNumber}</span>
        ${cell.calendarItems.length ? `<span class="month-calendar__day-count">${cell.calendarItems.length}</span>` : ''}
      </div>
      ${primaryCalendarItem
        ? `
            <div class="month-calendar__events">
              <div class="month-calendar__event">
                <span class="event-type-icon month-calendar__event-icon ${primaryCalendarItem.typeIndicatorClass}" aria-hidden="true">${escapeHtml(primaryCalendarItem.typeIndicator)}</span>
                <span class="month-calendar__event-title">${escapeHtml(primaryCalendarItem.title)}</span>
              </div>
              ${moreCount ? `<div class="month-calendar__more">+${moreCount} more</div>` : ''}
              ${detailTarget ? `<button class="month-calendar__details-link" type="button" data-action="calendar-open-event" data-event-id="${escapeHtml(detailTarget.id)}" aria-label="${escapeHtml(`See details for ${detailTarget.title}`)}">See details</button>` : ''}
            </div>
          `
        : '<div class="month-calendar__events month-calendar__events--empty"></div>'}
    </div>
  `;
}

function renderLaunchpadPanel() {
  const tiles = [
    facebookGroupUrl
      ? renderLinkLaunchTile(
          'Community',
          'YoAngels Group',
          'Jump back into the private Facebook group for weekly posts, replies, and announcements.',
          facebookGroupUrl,
          'Open group',
          '',
        )
      : '',
    renderSectionLaunchTile(
      'Directory',
      'Member Homes',
      'Browse home links quickly, then jump into your gifting route without leaving the main hub.',
      'members',
      'View members',
      '',
    ),
    renderSectionLaunchTile(
      'Private',
      'Gift Tracker',
      'Mark visits, keep private notes, and stay organized without sharing personal tracking data.',
      'notes',
      'Open notes',
      '',
    ),
    yoKeysWidgetUrl
      ? renderLinkLaunchTile(
          'Standalone Tool',
          'YoKeys Widget',
          'Keep personal keys and saved friend homes in a dedicated space outside the hub.',
          yoKeysWidgetUrl,
          'Open widget',
          'launch-tile--accent',
        )
      : '',
    facebookThreadUrl
      ? renderLinkLaunchTile(
          'Current Week',
          'Weekly Thread',
          'Open the active weekly post when you want the latest comments without hunting for it.',
          facebookThreadUrl,
          'Open thread',
          '',
        )
      : '',
  ].filter(Boolean);

  return `
    <article class="panel panel--launchpad dashboard-card dashboard-card--launchpad">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Launchpad</p>
          <h3>Tools and shortcuts</h3>
        </div>
      </div>
      <div class="launch-grid">
        ${tiles.join('')}
      </div>
    </article>
  `;
}

function getDashboardStats(upcomingMembers) {
  const openGiveaways = getGiveaways().filter((item) => item.isOpen).length;

  return [
    { label: 'Wish Lists active', value: String(getActiveWishlists().length) },
    { label: 'Birthdays soon', value: String(upcomingMembers.length) },
    { label: 'Open giveaways', value: String(openGiveaways) },
    { label: 'Upcoming events', value: String(getEvents().length) },
  ];
}

function renderLinkLaunchTile(eyebrow, title, text, href, footer, modifier) {
  return `
    <a class="launch-tile ${modifier}" href="${href}" target="_blank" rel="noreferrer">
      <span class="launch-tile__eyebrow">${eyebrow}</span>
      <strong class="launch-tile__title">${title}</strong>
      <span class="launch-tile__body">${text}</span>
      <span class="launch-tile__footer">${footer}</span>
    </a>
  `;
}

function renderSectionLaunchTile(eyebrow, title, text, sectionId, footer, modifier) {
  return `
    <button class="launch-tile ${modifier}" type="button" data-section="${sectionId}">
      <span class="launch-tile__eyebrow">${eyebrow}</span>
      <strong class="launch-tile__title">${title}</strong>
      <span class="launch-tile__body">${text}</span>
      <span class="launch-tile__footer">${footer}</span>
    </button>
  `;
}

function createDefaultMemberDirectoryState() {
  return {
    query: '',
    role: 'all',
    onlyHomeLink: false,
  };
}

function getFilteredDirectoryMembers() {
  const query = cleanText(state.memberDirectory.query).toLowerCase();
  const role = normalizeDirectoryRoleFilter(state.memberDirectory.role);
  const onlyHomeLink = Boolean(state.memberDirectory.onlyHomeLink);

  return getMembers().filter((member) => matchesMemberDirectoryFilters(member, query, role, onlyHomeLink));
}

function matchesMemberDirectoryFilters(member, query, role, onlyHomeLink) {
  if (role !== 'all' && normalizeGroupRole(member.groupRole) !== role) {
    return false;
  }

  if (onlyHomeLink && !cleanText(member.homeLink)) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchFields = [
    member.facebookName,
    member.displayName,
    member.inGameName,
    member.roleLabel,
    member.birthdayLabel,
    member.secondaryName,
    member.metaText,
    member.statusText,
  ];

  return searchFields.some((value) => cleanText(value).toLowerCase().includes(query));
}

function normalizeDirectoryRoleFilter(value) {
  const normalized = cleanText(value).toLowerCase().replace(/[-\s]+/g, '_');

  if (!normalized || normalized === 'all') {
    return 'all';
  }

  return normalizeGroupRole(normalized);
}

function hasActiveMemberDirectoryFilters() {
  return Boolean(
    cleanText(state.memberDirectory.query)
    || normalizeDirectoryRoleFilter(state.memberDirectory.role) !== 'all'
    || state.memberDirectory.onlyHomeLink,
  );
}

function renderMemberDirectoryToolbar(filteredCount, totalCount) {
  const roleFilter = normalizeDirectoryRoleFilter(state.memberDirectory.role);
  const query = cleanText(state.memberDirectory.query);
  const onlyHomeLink = Boolean(state.memberDirectory.onlyHomeLink);
  const helperText = hasActiveMemberDirectoryFilters()
    ? 'Search Facebook name, YoWorld name, role, or birthday. Home-link-only view helps plan gifting routes.'
    : 'Search Facebook name, YoWorld name, role, or birthday.';
  const countLabel = filteredCount === totalCount
    ? `${totalCount} active members`
    : `${filteredCount} of ${totalCount} shown`;

  return `
    <div class="directory-toolbar" role="search" aria-label="Member directory filters">
      <div class="directory-toolbar__controls">
        <label class="field-group">
          <span>Search Members</span>
          <input
            class="text-input"
            type="search"
            value="${escapeHtml(query)}"
            placeholder="Facebook name, YoWorld name, role, or birthday"
            data-member-search
          />
        </label>
        <label class="field-group">
          <span>Role</span>
          <select class="text-input" data-member-role-filter>
            ${renderDirectoryRoleFilterOptions(roleFilter)}
          </select>
        </label>
        <div class="field-group">
          <span>Extras</span>
          <label class="directory-filter-checkbox">
            <input type="checkbox" data-member-home-filter ${onlyHomeLink ? 'checked' : ''} />
            <strong>Only members with home links</strong>
          </label>
        </div>
        <button class="hero-button hero-button--secondary directory-toolbar__clear" type="button" data-action="members-clear-filters">
          Clear Filters
        </button>
      </div>
      <div class="directory-toolbar__summary">
        <span class="tag">${escapeHtml(countLabel)}</span>
        <p class="muted">${escapeHtml(helperText)}</p>
      </div>
    </div>
  `;
}

function renderDirectoryRoleFilterOptions(selectedValue) {
  return ['all', 'admin', 'event_planner', 'moderator', 'helper', 'member']
    .map(
      (role) => `
        <option value="${role}" ${normalizeDirectoryRoleFilter(selectedValue) === role ? 'selected' : ''}>${escapeHtml(
          role === 'all' ? 'All Roles' : formatGroupRoleLabel(role),
        )}</option>
      `,
    )
    .join('');
}

function restoreMemberDirectorySearchFocus(selectionStart = null, selectionEnd = null) {
  window.requestAnimationFrame(() => {
    const searchInput = app.querySelector('[data-member-search]');

    if (!(searchInput instanceof HTMLInputElement)) {
      return;
    }

    searchInput.focus();

    if (selectionStart === null || selectionEnd === null) {
      const endPosition = searchInput.value.length;
      searchInput.setSelectionRange(endPosition, endPosition);
      return;
    }

    const safeStart = Math.min(selectionStart, searchInput.value.length);
    const safeEnd = Math.min(selectionEnd, searchInput.value.length);
    searchInput.setSelectionRange(safeStart, safeEnd);
  });
}

function renderMembers() {
  const currentMembers = getMembers();
  const filteredMembers = getFilteredDirectoryMembers();

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderDirectoryNotice()}
      ${currentMembers.length
        ? renderMemberDirectoryPanel(filteredMembers, currentMembers.length)
        : renderEmptyMemberPanel(
            state.memberSource === 'loading' ? 'Loading members' : 'No members yet',
            state.memberSource === 'loading'
              ? 'Trying to load the live member directory from Supabase.'
              : 'Import members into Supabase or keep using the mock data until the directory is ready.',
          )}
    </section>
  `;
}

function renderMemberDirectoryPanel(currentMembers, totalMembers) {
  const countLabel = currentMembers.length === totalMembers && !hasActiveMemberDirectoryFilters()
    ? `${totalMembers} active members`
    : `${currentMembers.length} of ${totalMembers} shown`;

  return `
    <article class="panel panel--directory">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Directory</p>
          <h3>Facebook-first member list</h3>
        </div>
        <span class="tag">${escapeHtml(countLabel)}</span>
      </div>
      <p class="panel-lead">Facebook names lead each row. Use the YoWorld name as confirmation before sending gifts.</p>
      ${renderMemberDirectoryToolbar(currentMembers.length, totalMembers)}
      <div class="directory-list" role="list">
        ${currentMembers.length
          ? `
              ${renderMemberDirectoryHeader()}
              ${currentMembers.map((member) => renderMemberDirectoryRow(member)).join('')}
            `
          : `
              <div class="list-row list-row--compact">
                <span>No members match the current search or filters.</span>
              </div>
            `}
      </div>
    </article>
  `;
}

function renderMemberDirectoryHeader() {
  return `
    <div class="directory-row directory-row--header" aria-hidden="true">
      <span>Facebook Name</span>
      <span>YoWorld Name</span>
      <span>Role</span>
      <span>Birthday</span>
      <span>Actions</span>
    </div>
  `;
}

function renderMemberDirectoryRow(member) {
  return `
    <article class="directory-row" role="listitem">
      <div class="directory-cell directory-cell--name">
        <strong>${escapeHtml(member.facebookName || member.displayName)}</strong>
        ${member.metaText ? `<span class="directory-helper">${escapeHtml(member.metaText)}</span>` : ''}
      </div>
      <div class="directory-cell">
        <span class="directory-primary">${escapeHtml(member.inGameName || 'Not added yet')}</span>
        <span class="directory-helper">${escapeHtml(member.inGameName ? 'Use this to confirm the gift target.' : 'YoWorld name not added yet.')}</span>
      </div>
      <div class="directory-cell">
        <span class="tag ${member.roleTagClass}">${escapeHtml(member.roleLabel)}</span>
      </div>
      <div class="directory-cell">
        <span class="directory-primary">${escapeHtml(member.birthdayLabel)}</span>
      </div>
      <div class="directory-cell directory-cell--actions">
        <div class="directory-actions">
          ${member.homeLink
            ? `<a class="hero-button hero-button--secondary" href="${escapeHtml(member.homeLink)}" target="_blank" rel="noreferrer">Open Home Link</a>`
            : '<span class="muted">Home link not added yet.</span>'}
          <button class="tracker-button ${state.privateData.visited[member.id] ? 'tracker-button--active' : ''}" type="button" data-toggle="visited" data-member-id="${escapeHtml(member.id)}">
            ${state.privateData.visited[member.id] ? 'Visited' : 'Mark Visited'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderBirthdays() {
  const birthdayMembers = getBirthdayMembers();

  return `
    <section class="panel stack-panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Calendar</p>
          <h3>Upcoming birthdays</h3>
        </div>
      </div>
      <div class="stack-list">
        ${birthdayMembers.length
          ? birthdayMembers
              .map(
                (member) => `
                  <div class="list-row">
                    <div>
                      <strong>${escapeHtml(member.displayName)}</strong>
                      <span>${escapeHtml(member.secondaryName || member.metaText)}</span>
                    </div>
                    <span>${escapeHtml(member.birthdayLabel)}</span>
                  </div>
                `,
              )
              .join('')
          : `
              <div class="list-row list-row--compact">
                <span>${escapeHtml(state.memberSource === 'loading' ? 'Loading live birthdays...' : 'No birthdays have been added yet.')}</span>
              </div>
            `}
      </div>
    </section>
  `;
}

function renderGiveaways() {
  ensureGiveawayEditorState();

  const currentGiveaways = getGiveaways();
  const openCount = currentGiveaways.filter((item) => item.isOpen).length;
  const editorState = getGiveawayComposerState();

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderGiveawaySourceNotice()}
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Giveaways</p>
            <h3>Post item drops and let members enter live</h3>
          </div>
          <span class="tag">${escapeHtml(`${openCount} open`)}</span>
        </div>
        <p class="panel-lead">Giveaway posts are now live: hosts can upload an image, set an end date and time, members can use Enter Giveaway on open cards, and the winner can be posted publicly when the giveaway closes.</p>
      </article>

      ${renderGiveawayComposer(editorState)}

      <article class="panel panel--directory panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Live Board</p>
            <h3>Active and recent giveaways</h3>
          </div>
          <span class="tag">${escapeHtml(`${currentGiveaways.length} posts`)}</span>
        </div>
        <div class="giveaway-board">
          ${currentGiveaways.length
            ? currentGiveaways.map((giveaway) => renderGiveawayCard(giveaway)).join('')
            : `
                <div class="list-row list-row--compact">
                  <span>${escapeHtml(state.giveawaySource === 'loading' ? 'Loading live giveaways...' : 'No giveaways are live yet.')}</span>
                </div>
              `}
        </div>
      </article>
    </section>
  `;
}

function renderYoModels() {
  const currentPosts = getYoModelsPosts();
  const monthGroups = groupYoModelsPostsByMonth(currentPosts);

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderYoModelsSourceNotice()}
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">YoModels</p>
            <h3>Monthly model edits and themed looks</h3>
          </div>
          <span class="tag">${escapeHtml(`${currentPosts.length} posts`)}</span>
        </div>
        <p class="panel-lead">YoModels keeps Gothicka's edit drops in one place, ordered by posted date. The current month stays open, and older months collapse into an archive automatically.</p>
      </article>

      ${renderYoModelsComposer()}

      <article class="panel panel--span-full models-feed-panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Gallery</p>
            <h3>Newest looks first</h3>
          </div>
          <div class="button-row">
            <button class="hero-button hero-button--secondary" type="button" data-action="models-refresh">Refresh YoModels</button>
          </div>
        </div>
        <div class="models-month-stack">
          ${monthGroups.length
            ? monthGroups.map((group) => renderYoModelsMonthGroup(group)).join('')
            : `
                <div class="list-row list-row--compact">
                  <span>${escapeHtml(state.modelSource === 'loading' ? 'Loading YoModels...' : 'No YoModels posts have been published yet.')}</span>
                </div>
              `}
        </div>
      </article>
    </section>
  `;
}

function renderYoModelsComposer() {
  const form = state.admin.modelsForm;
  const isBusy = state.admin.isBusy;

  if (!canManageYoModels()) {
    return `
      <article class="panel panel--announcement panel--span-full models-composer-panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Publish</p>
            <h3>Only Gothicka can post here</h3>
          </div>
        </div>
        <p class="panel-lead">This module is read-only for everyone except the Gothicka admin account. Once a month ends, its posts collapse into the archive automatically.</p>
        ${renderAdminNotice()}
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  return `
    <article class="panel panel--span-full models-composer-panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Publish</p>
          <h3>Post a new YoModels edit</h3>
        </div>
        <span class="tag tag--role-admin">Gothicka Only</span>
      </div>
      <p class="panel-lead">Theme titles are optional. The post date is captured automatically when you publish, and the image is required.</p>
      ${renderAdminNotice()}
      <form class="admin-form models-form" data-models-form>
        <div class="form-grid">
          <label class="field-group field-group--wide">
            <span>Theme Title</span>
            <input class="text-input" type="text" name="theme_title" maxlength="${YOMODELS_THEME_TITLE_MAX_LENGTH}" value="${escapeHtml(form.themeTitle)}" placeholder="Optional, for example: Moonlit Velvet" />
            <small class="field-help">Optional. Leave blank if the image should stand on its own.</small>
          </label>
          <label class="field-group">
            <span>Upload Picture</span>
            <input class="text-input" type="file" name="models_image_file" accept="image/png,image/jpeg,image/webp">
            <small class="field-help">Required. PNG, JPEG, or WebP up to ${Math.round(YOMODELS_IMAGE_MAX_BYTES / (1024 * 1024))} MB.</small>
          </label>
          <div class="field-group field-group--wide">
            <span>Preview</span>
            ${renderYoModelsImagePreview(form)}
          </div>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit"${isBusy ? ' disabled' : ''}>${escapeHtml(isBusy ? 'Publishing...' : 'Publish YoModels Post')}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="models-reset-form"${isBusy ? ' disabled' : ''}>Clear Form</button>
        </div>
      </form>
    </article>
  `;
}

function renderYoModelsImagePreview(form) {
  const previewUrl = cleanText(form.imagePreviewUrl);
  const imageName = cleanText(form.imageName);

  if (!previewUrl) {
    return `
      <div class="models-preview">
        <div class="giveaway-card__placeholder">
          <strong>No picture selected</strong>
          <span>Upload the finished edit and it will appear here before you publish.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="models-preview">
      <img class="models-preview__image" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(imageName || 'YoModels upload preview')}" loading="lazy">
      <span class="muted">${escapeHtml(imageName || 'Selected YoModels image')}</span>
    </div>
  `;
}

function renderYoModelsMonthGroup(group) {
  return `
    <details class="models-month-group"${group.isCurrentMonth ? ' open' : ''}>
      <summary class="models-month-summary">
        <div>
          <strong>${escapeHtml(group.monthLabel)}</strong>
          <span class="directory-helper">${escapeHtml(group.isCurrentMonth ? 'Current month stays open' : 'Archived after month end')}</span>
        </div>
        <span class="tag">${escapeHtml(`${group.posts.length} posts`)}</span>
      </summary>
      <div class="models-post-grid">
        ${group.posts.map((post) => renderYoModelsPostCard(post)).join('')}
      </div>
    </details>
  `;
}

function renderYoModelsPostCard(post) {
  return `
    <article class="models-post-card">
      <div class="models-post-card__header">
        <div>
          ${post.themeTitle ? `<h4 class="models-post-card__theme">${escapeHtml(post.themeTitle)}</h4>` : '<p class="eyebrow">YoModels Edit</p>'}
          <span class="directory-helper">${escapeHtml(post.postedLabel)}</span>
        </div>
        ${canManageYoModels()
          ? `<button class="tracker-button" type="button" data-action="models-deactivate-post" data-model-id="${escapeHtml(post.id)}">Hide Post</button>`
          : ''}
      </div>
      <a class="models-post-card__image-link" href="${escapeHtml(post.imageUrl)}" target="_blank" rel="noreferrer">
        <img class="models-post-card__image" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.imageName || post.themeTitle || 'YoModels image')}" loading="lazy">
      </a>
    </article>
  `;
}

function renderChat() {
  ensureChatComposerState();

  const activeChannel = getActiveChatChannel();
  const currentMessages = getChatMessages(activeChannel.key);
  const composerState = getChatComposerState();

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderChatSourceNotice()}
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Chat</p>
            <h3>Live room tabs for the YAWL Hub</h3>
          </div>
          <span class="tag">${escapeHtml(`${currentMessages.length} in ${activeChannel.label}`)}</span>
        </div>
        <p class="panel-lead">Use the channel tabs to switch between General, Giveaways, and Models. Linked members can post text or image messages, admins can post as any active member, and admins can moderate the feed.</p>
      </article>

      <article class="panel panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Channels</p>
            <h3>${escapeHtml(activeChannel.label)}</h3>
          </div>
          <div class="button-row">
            <button class="hero-button hero-button--secondary" type="button" data-action="chat-refresh">Refresh Chat</button>
          </div>
        </div>
        <p class="panel-lead">${escapeHtml(activeChannel.description)}</p>
        <div class="chat-channel-tabs" role="tablist" aria-label="Chat channels">
          ${CHAT_CHANNELS.map((channel) => `
            <button
              class="chat-channel-tab${channel.key === activeChannel.key ? ' chat-channel-tab--active' : ''}"
              type="button"
              role="tab"
              aria-selected="${channel.key === activeChannel.key ? 'true' : 'false'}"
              data-action="chat-set-channel"
              data-chat-channel="${escapeHtml(channel.key)}"
            >
              ${escapeHtml(channel.label)}
            </button>
          `).join('')}
        </div>
      </article>

      <div class="chat-layout panel--span-full">
        <article class="panel chat-feed-panel">
          <div class="panel__heading">
            <div>
              <p class="eyebrow">Messages</p>
              <h3>${escapeHtml(`${activeChannel.label} Feed`)}</h3>
            </div>
            <span class="tag">${escapeHtml(`${currentMessages.length} messages`)}</span>
          </div>
          <div class="chat-feed">
            ${currentMessages.length
              ? currentMessages.map((message) => renderChatMessageCard(message)).join('')
              : `
                  <div class="list-row list-row--compact">
                    <span>${escapeHtml(state.chatSource === 'loading' ? 'Loading live chat...' : `No messages in ${activeChannel.label} yet.`)}</span>
                  </div>
                `}
          </div>
        </article>

        ${renderChatComposer(activeChannel, composerState)}
      </div>
    </section>
  `;
}

function renderChatComposer(activeChannel, editorState = getChatComposerState()) {
  const form = state.admin.chatForm;
  const isBusy = state.admin.isBusy;
  const canManagePosts = canModerateChatMessages();

  if (!state.admin.session) {
    return `
      <article class="panel panel--announcement chat-composer-panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post a Message</p>
            <h3>Sign in to join chat</h3>
          </div>
        </div>
        <p class="panel-lead">Chat is tied to your YAWL Hub account so messages stay attached to the right member profile.</p>
        ${renderAdminNotice()}
        <div class="button-row">
          <button class="hero-button" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  if (!editorState.selectedMember) {
    if (canManagePosts) {
      return `
        <article class="panel panel--announcement chat-composer-panel">
          <div class="panel__heading">
            <div>
              <p class="eyebrow">Post a Message</p>
              <h3>Load the member directory first</h3>
            </div>
          </div>
          <p class="panel-lead">Chat posts still need an active member profile, even for admins. Load the live directory so the composer can assign this message correctly.</p>
          ${renderAdminNotice()}
        </article>
      `;
    }

    return `
      <article class="panel panel--announcement chat-composer-panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post a Message</p>
            <h3>Claim your member invite first</h3>
          </div>
        </div>
        <p class="panel-lead">Ask an admin for your invite code, then claim your member profile from Account before posting in the chat rooms.</p>
        ${renderAdminNotice()}
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  const selectedMember = editorState.selectedMember;

  return `
    <article class="panel chat-composer-panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Post a Message</p>
          <h3>Send to ${escapeHtml(activeChannel.label)}</h3>
        </div>
        <span class="tag ${selectedMember.roleTagClass}">${escapeHtml(selectedMember.roleLabel)}</span>
      </div>
      <p class="panel-lead">${escapeHtml(canManagePosts
        ? 'Admins can post as any active member and moderate the feed below.'
        : `Posting as ${formatGiveawayComposerIdentity(selectedMember)}. Images can include PNG files.`)}</p>
      ${renderAdminNotice()}
      <form class="admin-form chat-form" data-chat-form>
        <input type="hidden" name="channel_key" value="${escapeHtml(activeChannel.key)}">
        ${canManagePosts
          ? `
              <label class="field-group">
                <span>Post As</span>
                <select class="text-input" name="sender_member_id">
                  ${renderWishlistMemberOptions(editorState.availableMembers, form.memberId || selectedMember.id)}
                </select>
                <small class="field-help">Admins can post chat messages for any active member profile.</small>
              </label>
            `
          : `
              <label class="field-group">
                <span>Post As</span>
                <input class="text-input" type="text" value="${escapeHtml(formatGiveawayComposerIdentity(selectedMember))}" readonly>
                <small class="field-help">This chat message stays tied to your claimed member profile.</small>
              </label>
            `}
        <label class="field-group field-group--wide">
          <span>Message</span>
          <textarea name="message_text" class="admin-textarea" maxlength="${CHAT_MESSAGE_MAX_LENGTH}" placeholder="Say hi, share an update, or drop a quick note for this room.">${escapeHtml(form.messageText)}</textarea>
          <small class="field-help">You can send text, an image, or both.</small>
        </label>
        <label class="field-group">
          <span>Image Upload</span>
          <input class="text-input" type="file" name="chat_image_file" accept="image/png,image/jpeg,image/webp">
          <small class="field-help">Optional. PNG, JPEG, or WebP up to ${Math.round(CHAT_IMAGE_MAX_BYTES / (1024 * 1024))} MB.</small>
        </label>
        <div class="field-group">
          <span>Attachment Preview</span>
          ${renderChatImagePreview(form)}
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit"${isBusy ? ' disabled' : ''}>${escapeHtml(isBusy ? 'Sending...' : `Send to ${activeChannel.label}`)}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="chat-reset-form"${isBusy ? ' disabled' : ''}>Clear Draft</button>
        </div>
      </form>
    </article>
  `;
}

function renderChatImagePreview(form) {
  const previewUrl = cleanText(form.imagePreviewUrl);
  const imageName = cleanText(form.imageName);

  if (!previewUrl) {
    return `
      <div class="chat-image-preview">
        <div class="giveaway-card__placeholder">
          <strong>No image selected</strong>
          <span>Upload a screenshot, item shot, or model image if you want the room to include artwork.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="chat-image-preview">
      <img class="chat-image-preview__image" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(imageName || 'Chat upload preview')}" loading="lazy">
      <span class="muted">${escapeHtml(imageName || 'Selected chat image')}</span>
    </div>
  `;
}

function renderChatMessageCard(message) {
  const deleteLabel = canModerateChatMessages() && !isChatMessageOwner(message) ? 'Moderate' : 'Delete';

  return `
    <article class="chat-message${message.imageUrl ? ' chat-message--with-image' : ''}">
      <div class="chat-message__meta">
        <div>
          <strong>${escapeHtml(message.senderName)}</strong>
          <span class="directory-helper">${escapeHtml(message.senderInGameName ? `YoWorld: ${message.senderInGameName}` : 'Member account linked')}</span>
        </div>
        <div class="chat-message__meta-actions">
          <span class="tag ${message.senderRoleTagClass}">${escapeHtml(message.senderRoleLabel)}</span>
          <span class="muted">${escapeHtml(message.createdLabel)}</span>
          ${canDeleteChatMessage(message)
            ? `<button class="tracker-button" type="button" data-action="chat-delete-message" data-message-id="${escapeHtml(message.id)}">${escapeHtml(deleteLabel)}</button>`
            : ''}
        </div>
      </div>
      ${message.messageText ? `<div class="chat-message__text">${formatChatMessageText(message.messageText)}</div>` : ''}
      ${message.imageUrl
        ? `
            <a class="chat-message__image-link" href="${escapeHtml(message.imageUrl)}" target="_blank" rel="noreferrer">
              <img class="chat-message__image" src="${escapeHtml(message.imageUrl)}" alt="${escapeHtml(message.imageName || `${message.senderName} upload`)}" loading="lazy">
            </a>
          `
        : ''}
    </article>
  `;
}

function renderGiveawayComposer(editorState) {
  const canManagePosts = canManageGiveawayPosts();

  if (!state.admin.session) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post a Giveaway</p>
            <h3>Sign in before posting or entering</h3>
          </div>
        </div>
        <p class="panel-lead">Giveaways use your YAWL Hub account so the host and entrant list stay tied to the correct member profile.</p>
        ${renderAdminNotice()}
        <div class="button-row">
          <button class="hero-button" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  if (!editorState.canEdit) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post a Giveaway</p>
            <h3>Claim your member invite first</h3>
          </div>
        </div>
        <p class="panel-lead">Ask an admin for your invite code, then claim your member profile from Account before posting or entering giveaways.</p>
        ${renderAdminNotice()}
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  if (!editorState.selectedMember) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post a Giveaway</p>
            <h3>Load the member directory first</h3>
          </div>
        </div>
        <p class="panel-lead">The giveaway composer needs an active member record before this post can be assigned.</p>
      </article>
    `;
  }

  const selectedMember = editorState.selectedMember;
  const editingGiveaway = editorState.editingGiveaway;
  const form = state.admin.giveawayForm;
  const isBusy = state.admin.isBusy;
  const isEditing = Boolean(editingGiveaway?.id);
  const actionLabel = isBusy ? 'Saving giveaway...' : (isEditing ? 'Save Giveaway' : 'Post Giveaway');
  const resetLabel = isEditing ? 'Cancel Edit' : 'Clear Form';

  return `
    <article class="panel panel--span-full">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Post a Giveaway</p>
          <h3>${escapeHtml(isEditing ? 'Edit this giveaway' : 'Create a new live giveaway')}</h3>
        </div>
      </div>
      <p class="panel-lead">${escapeHtml(isEditing
        ? 'Update the giveaway details below. Saving a future end time reopens a closed giveaway, and leaving the image field alone keeps the current artwork.'
        : canManagePosts
          ? 'Staff can post giveaways for any active member and still moderate the board below.'
          : 'Post as your claimed member profile, upload an optional image, set the end date and time, and let members enter from the board below.')}</p>
      ${renderAdminNotice()}
      <form class="admin-form giveaway-form" data-giveaway-form>
        <div class="form-grid giveaway-form__grid">
          ${canManagePosts && !isEditing
            ? `
                <label class="field-group">
                  <span>Host</span>
                  <select class="text-input" name="giver_member_id">
                    ${renderWishlistMemberOptions(editorState.availableMembers, form.memberId || selectedMember.id)}
                  </select>
                  <small class="field-help">Staff can host a giveaway for any active member.</small>
                </label>
              `
            : `
                <label class="field-group">
                  <span>Host</span>
                  <input class="text-input" type="text" value="${escapeHtml(formatGiveawayComposerIdentity(selectedMember))}" readonly>
                  <small class="field-help">${escapeHtml(canManagePosts ? 'This giveaway is tied to the selected member profile for moderation and winner tracking.' : 'This giveaway is tied to your claimed member profile.')}</small>
                </label>
              `}
          <label class="field-group">
            <span>Ends</span>
            <input class="text-input" type="datetime-local" name="ends_at_local" value="${escapeHtml(form.endsAtLocal)}" required>
            <small class="field-help">The saved end time uses your current browser timezone.</small>
          </label>
          <label class="field-group field-group--wide">
            <span>Giveaway Title</span>
            <input class="text-input" type="text" name="title" maxlength="120" placeholder="Example: Cottage Garden Bundle" value="${escapeHtml(form.title)}" required>
          </label>
          <label class="field-group field-group--wide">
            <span>Item Details</span>
            <textarea name="item_text" class="admin-textarea" maxlength="2000" placeholder="Describe the item or bundle, any entry notes, and anything members should know.">${escapeHtml(form.itemText)}</textarea>
          </label>
          <label class="field-group giveaway-upload-field">
            <span>Giveaway Image</span>
            <input class="text-input" type="file" name="giveaway_image_file" accept="image/png,image/jpeg">
            <small class="field-help">Optional. PNG or JPEG, up to ${Math.round(GIVEAWAY_IMAGE_MAX_BYTES / (1024 * 1024))} MB.${isEditing ? ' Leave this alone to keep the current image.' : ''}</small>
          </label>
          <div class="field-group field-group--wide">
            <span>Preview</span>
            <small class="field-help">This updates before you post so you can see the live board card first.</small>
            <div data-giveaway-preview>
              ${renderGiveawayComposerPreview(editorState)}
            </div>
          </div>
        </div>
        <div class="button-row admin-form-actions giveaway-form__actions">
          <button class="hero-button" type="submit"${isBusy ? ' disabled' : ''}>${escapeHtml(actionLabel)}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="giveaway-reset-form"${isBusy ? ' disabled' : ''}>${escapeHtml(resetLabel)}</button>
        </div>
      </form>
    </article>
  `;
}

function renderGiveawayComposerPreview(editorState) {
  const previewGiveaway = buildGiveawayComposerPreviewModel(editorState);

  if (!previewGiveaway) {
    return `
      <div class="giveaway-image-preview">
        <div class="giveaway-card__placeholder">
          <strong>Preview unavailable</strong>
          <span>Pick a host first so the giveaway card preview can load.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="giveaway-composer-preview">
      <span class="muted">Live giveaway card preview</span>
      ${renderGiveawayCard(previewGiveaway, { isPreview: true })}
    </div>
  `;
}

function buildGiveawayComposerPreviewModel(editorState) {
  const form = state.admin.giveawayForm;
  const editingGiveaway = editorState?.editingGiveaway || null;
  const previewHost = findMemberById(form.memberId) || editorState?.selectedMember || null;

  if (!previewHost) {
    return null;
  }

  const defaultEndsAt = parseDateTimeLocalInputToIso(createDefaultGiveawayEndsAtLocal());
  const endsAt = parseDateTimeLocalInputToIso(form.endsAtLocal) || cleanText(editingGiveaway?.endsAt) || defaultEndsAt;
  const nowIso = new Date().toISOString();

  return buildGiveawayModel(
    {
      id: cleanText(editingGiveaway?.id) || 'giveaway-preview',
      giverMemberId: cleanText(previewHost.id),
      giverName: cleanText(previewHost.facebookName || previewHost.displayName),
      giverInGameName: cleanText(previewHost.inGameName),
      giverHomeLink: buildHomeLink(previewHost.houseKey),
      title: cleanText(form.title) || cleanText(editingGiveaway?.title) || 'Giveaway title preview',
      itemText: cleanText(form.itemText) || cleanText(editingGiveaway?.itemText) || 'Describe the item or bundle, any entry notes, and anything members should know.',
      imageUrl: cleanText(form.imagePreviewUrl) || cleanText(editingGiveaway?.imageUrl),
      imagePath: cleanText(form.imagePath) || cleanText(editingGiveaway?.imagePath),
      imageMimeType: cleanText(form.imageMimeType) || cleanText(editingGiveaway?.imageMimeType),
      imageName: cleanText(form.imageName) || cleanText(editingGiveaway?.imageName),
      endsAt,
      winnerMemberId: cleanText(editingGiveaway?.winnerMemberId),
      winnerName: cleanText(editingGiveaway?.winnerName),
      winnerInGameName: cleanText(editingGiveaway?.winnerInGameName),
      winnerSelectedAt: cleanText(editingGiveaway?.winnerSelectedAt),
      isActive: editingGiveaway ? editingGiveaway.isActive : true,
      entries: Array.isArray(editingGiveaway?.entries) ? editingGiveaway.entries : [],
      createdAt: cleanText(editingGiveaway?.createdAt) || nowIso,
      updatedAt: nowIso,
      createdByUserId: cleanText(editingGiveaway?.createdByUserId),
      createdByEmail: cleanText(editingGiveaway?.createdByEmail),
    },
    0,
  );
}

function renderGiveawayImagePreview(form, currentGiveaway = null) {
  const previewUrl = cleanText(form.imagePreviewUrl) || cleanText(currentGiveaway?.imageUrl);
  const imageName = cleanText(form.imageName) || cleanText(currentGiveaway?.imageName);

  if (!previewUrl) {
    return `
      <div class="giveaway-image-preview">
        <div class="giveaway-card__placeholder">
          <strong>No image selected</strong>
          <span>Upload a screenshot or item preview if you want the giveaway tile to include artwork.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="giveaway-image-preview">
      <img class="giveaway-image-preview__image" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(imageName || 'Giveaway preview')}" loading="lazy">
      <span class="muted">${escapeHtml(imageName || 'Selected giveaway image')}</span>
    </div>
  `;
}

function renderGiveawayCard(giveaway, options = {}) {
  const { isPreview = false } = options;
  const canManage = isPreview ? false : canManageGiveaway(giveaway);
  const linkedMember = isPreview ? null : getLinkedGiveawayMember();
  const currentEntry = linkedMember ? getGiveawayEntryForMember(giveaway, linkedMember.id) : null;

  return `
    <article class="giveaway-card">
      <div class="giveaway-card__media">
        ${renderGiveawayMedia(giveaway)}
      </div>
      <div class="giveaway-card__body">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Giveaway</p>
            <h3>${escapeHtml(giveaway.title)}</h3>
          </div>
          <span class="tag ${escapeHtml(giveaway.statusTagClass)}">${escapeHtml(giveaway.statusLabel)}</span>
        </div>
        <p class="panel-lead">${escapeHtml(giveaway.itemText)}</p>
        <div class="event-meta giveaway-meta">
          <div class="event-meta-row">
            <strong>Host</strong>
            <span>${escapeHtml(formatGiveawayGiverLine(giveaway))}</span>
          </div>
          <div class="event-meta-row">
            <strong>Ends</strong>
            <span>${escapeHtml(giveaway.endsLabel)}</span>
          </div>
        </div>
        <div class="wishlist-counts giveaway-counts">
          ${renderWishlistCountTag(`${giveaway.entryCount} ${giveaway.entryCount === 1 ? 'entry' : 'entries'}`, giveaway.entryCount > 0 ? 'wishlist-count--success' : '')}
          ${canManage ? renderWishlistCountTag('You can manage this giveaway', 'wishlist-count--success') : ''}
          ${currentEntry ? renderWishlistCountTag('You entered', 'wishlist-count--success') : ''}
        </div>
        ${giveaway.hasWinner ? renderGiveawayWinnerBanner(giveaway) : ''}
        ${renderGiveawayEntries(giveaway)}
        <div class="button-row giveaway-card__actions">
          ${!isPreview && giveaway.giverHomeLink ? `<a class="hero-button hero-button--secondary" href="${giveaway.giverHomeLink}" target="_blank" rel="noreferrer">Open Host Home</a>` : ''}
          ${renderGiveawayActionButtons(giveaway, canManage, currentEntry, { isPreview })}
        </div>
      </div>
    </article>
  `;
}

function renderGiveawayMedia(giveaway) {
  if (giveaway.imageUrl) {
    return `<img class="giveaway-card__image" src="${escapeHtml(giveaway.imageUrl)}" alt="${escapeHtml(giveaway.title)}" loading="lazy">`;
  }

  return `
    <div class="giveaway-card__placeholder">
      <strong>No image uploaded</strong>
      <span>${escapeHtml(giveaway.giverName)} hosted this giveaway with text details only.</span>
    </div>
  `;
}

function renderGiveawayWinnerBanner(giveaway) {
  return `
    <div class="giveaway-winner-banner">
      <p class="eyebrow">Winner</p>
      <strong>${escapeHtml(giveaway.winnerName)}</strong>
      <span>${escapeHtml(giveaway.winnerInGameName ? `YoWorld: ${giveaway.winnerInGameName}` : 'Winner selected')}</span>
      <span class="muted">${escapeHtml(giveaway.winnerSelectedLabel || 'Winner posted and giveaway closed')}</span>
    </div>
  `;
}

function renderGiveawayEntries(giveaway) {
  return `
    <section class="giveaway-entries">
      <div class="wishlist-comments__heading">
        <div>
          <p class="eyebrow">Entries</p>
          <h3>Everyone can see who entered</h3>
        </div>
        <span class="tag">${escapeHtml(`${giveaway.entryCount} total`)}</span>
      </div>
      <div class="giveaway-entry-list">
        ${giveaway.entries.length
          ? giveaway.entries.map((entry) => renderGiveawayEntryChip(giveaway, entry)).join('')
          : `
              <div class="list-row list-row--compact">
                <span>${escapeHtml(giveaway.isOpen ? 'No entries yet. Be the first one in.' : 'This giveaway closed without any entries yet.')}</span>
              </div>
            `}
      </div>
    </section>
  `;
}

function renderGiveawayEntryChip(giveaway, entry) {
  const isWinner = giveaway.hasWinner && cleanText(giveaway.winnerMemberId) && cleanText(giveaway.winnerMemberId) === cleanText(entry.entrantMemberId);

  return `
    <div class="giveaway-entry-chip${isWinner ? ' giveaway-entry-chip--winner' : ''}">
      <strong>${escapeHtml(entry.entrantName)}</strong>
      <span>${escapeHtml(entry.entrantInGameName ? `YoWorld: ${entry.entrantInGameName}` : entry.createdLabel)}</span>
    </div>
  `;
}

function renderGiveawayActionButtons(giveaway, canManage, currentEntry, options = {}) {
  const { isPreview = false } = options;
  const buttons = [];
  const isBusy = state.admin.isBusy ? ' disabled' : '';

  if (isPreview) {
    if (giveaway.hasWinner) {
      buttons.push('<button class="hero-button" type="button" disabled>Winner Posted</button>');
    } else if (giveaway.isOpen) {
      buttons.push('<button class="hero-button" type="button" disabled>Enter Giveaway</button>');
    } else {
      buttons.push('<button class="hero-button hero-button--secondary" type="button" disabled>Giveaway Closed</button>');
    }

    return buttons.join('');
  }

  if (canManage) {
    buttons.push(`<button class="hero-button hero-button--secondary" type="button" data-action="giveaway-edit" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Edit Giveaway</button>`);
  }

  if (canManage && giveaway.entryCount > 0) {
    buttons.push(`<button class="hero-button hero-button--secondary" type="button" data-action="giveaway-copy-entrants" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Copy Entrants</button>`);
  }

  if (canManage && !giveaway.hasWinner && giveaway.entryCount > 0) {
    buttons.push(`<button class="hero-button" type="button" data-action="giveaway-pick-winner" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Pick Winner & Close Giveaway</button>`);
  }

  if (canManage && giveaway.hasWinner && giveaway.entryCount > 1) {
    buttons.push(`<button class="hero-button" type="button" data-action="giveaway-reroll-winner" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Reroll Winner</button>`);
  }

  if (canManage && !giveaway.isOpen && !giveaway.hasWinner) {
    buttons.push(`<button class="hero-button hero-button--secondary" type="button" data-action="giveaway-reopen" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Reopen Giveaway</button>`);
  }

  if (canManage && giveaway.isOpen) {
    buttons.push(`<button class="hero-button hero-button--secondary" type="button" data-action="giveaway-deactivate" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>Close Giveaway</button>`);
  }

  if (giveaway.isOpen) {
    if (!state.admin.session) {
      buttons.push('<button class="hero-button" type="button" data-section="account">Sign In to Enter</button>');
    } else if (!hasLinkedGiveawayAccess()) {
      buttons.push('<button class="hero-button" type="button" data-section="account">Claim Invite to Enter</button>');
    } else if (canEnterGiveaway(giveaway)) {
      buttons.push(`<button class="hero-button" type="button" data-action="giveaway-toggle-entry" data-giveaway-id="${escapeHtml(giveaway.id)}"${isBusy}>${escapeHtml(currentEntry ? 'Withdraw Entry' : 'Enter Giveaway')}</button>`);
    }
  }

  return buttons.join('');
}

function renderHangouts() {
  const currentEvents = getCalendarFeedItems();
  const currentMembers = getMembers();

  return `
    <section class="panel-grid panel-grid--members">
      ${renderEventSourceNotice()}
      ${renderEventComposerPanel(currentMembers)}
      ${currentEvents.length
        ? `
            <div class="event-grid event-grid--feed panel--span-full">
              ${currentEvents.map((calendarEvent) => renderEventCard(calendarEvent)).join('')}
            </div>
          `
        : renderEmptyEventPanel(
            state.eventSource === 'loading' ? 'Loading events' : 'No events posted yet',
            state.eventSource === 'loading'
              ? 'Trying to load the shared event calendar from Supabase now.'
              : 'No birthdays or shared events are showing yet.',
          )}
    </section>
  `;
}

function renderEventComposerPanel(currentMembers) {
  const editingEvent = state.admin.editingEventId
    ? getEvents().find((entry) => entry.id === state.admin.editingEventId)
    : null;

  if ((editingEvent && canEditEvent(editingEvent)) || canCreateEventPost()) {
    return renderAdminEventEditorPanel(currentMembers, { context: 'events' });
  }

  if (!state.admin.session) {
    return `
      <article class="panel panel--announcement panel--span-full">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Post an Event</p>
            <h3>Sign in to post on the shared calendar</h3>
          </div>
        </div>
        <p class="panel-lead">Members can post their own events once their login is connected to a member profile. They can then edit or deactivate only the events they created.</p>
        <div class="button-row">
          <button class="hero-button" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Post an Event</p>
          <h3>Claim a member invite first</h3>
        </div>
      </div>
      <p class="panel-lead">Ask an admin for your invite code, then claim it in Account before posting a personal event on the shared calendar.</p>
      <div class="button-row">
        <button class="hero-button" type="button" data-section="account">Open Account</button>
      </div>
    </article>
  `;
}

function renderEventCard(calendarEvent, options = {}) {
  const { showAdminActions = false } = options;
  const isBirthdayCard = Boolean(calendarEvent.isBirthday);
  const showEventActions = !isBirthdayCard && (showAdminActions || canEditEvent(calendarEvent));
  const leadText = isBirthdayCard
    ? `${calendarEvent.title}'s birthday is pulled from the member directory.`
    : (calendarEvent.details || getDefaultEventDescription(calendarEvent.eventType));
  const primaryMetaLabel = isBirthdayCard ? 'Member' : 'Host';
  const primaryMetaValue = isBirthdayCard
    ? (calendarEvent.hostName || calendarEvent.title)
    : (calendarEvent.hostName || 'Host coming soon');
  const secondaryMetaLabel = isBirthdayCard ? 'YoWorld Name' : 'Location';
  const secondaryMetaValue = isBirthdayCard
    ? (calendarEvent.inGameName || 'Not added yet')
    : (calendarEvent.locationText || 'Location coming soon');
  const footerContent = isBirthdayCard
    ? `
        <div class="button-row event-card__actions">
          ${calendarEvent.homeLink ? `<a class="hero-button hero-button--secondary" href="${escapeHtml(calendarEvent.homeLink)}" target="_blank" rel="noreferrer">Open Home Link</a>` : '<span class="muted">No home link added yet.</span>'}
        </div>
      `
    : `
        <div class="event-stats" aria-label="Event response counts">
          <div class="event-stat">
            <span>Yes</span>
            <strong>${calendarEvent.yesCount}</strong>
          </div>
          <div class="event-stat">
            <span>Maybe</span>
            <strong>${calendarEvent.maybeCount}</strong>
          </div>
          <div class="event-stat">
            <span>No</span>
            <strong>${calendarEvent.noCount}</strong>
          </div>
        </div>
        ${showEventActions
          ? `
              <div class="button-row admin-form-actions event-card__actions">
                <button class="hero-button hero-button--secondary" type="button" data-action="admin-edit-event" data-event-id="${escapeHtml(calendarEvent.id)}">Edit Event</button>
                <button class="tracker-button" type="button" data-action="admin-deactivate-event" data-event-id="${escapeHtml(calendarEvent.id)}">Deactivate Event</button>
              </div>
            `
          : ''}
      `;

  return `
    <article class="panel event-card ${isBirthdayCard ? 'event-card--birthday' : 'event-card--standard'}"${!isBirthdayCard && cleanText(calendarEvent.id) ? ` data-event-card-id="${escapeHtml(calendarEvent.id)}"` : ''}>
      <div class="panel__heading event-card__heading">
        <div class="event-title-row">
          <span class="event-type-icon ${calendarEvent.typeIndicatorClass}" aria-hidden="true">${escapeHtml(calendarEvent.typeIndicator)}</span>
          <div class="event-card__title-block">
            <p class="eyebrow">${escapeHtml(calendarEvent.eventTypeLabel)}</p>
            <h3>${escapeHtml(calendarEvent.title)}</h3>
          </div>
        </div>
        <span class="tag event-card__when">${escapeHtml(calendarEvent.whenLabel)}</span>
      </div>
      <p class="panel-lead event-card__lead">${escapeHtml(leadText)}</p>
      <div class="event-meta">
        <div class="event-meta-row">
          <strong>${escapeHtml(primaryMetaLabel)}</strong>
          <span>${escapeHtml(primaryMetaValue)}</span>
        </div>
        <div class="event-meta-row">
          <strong>${escapeHtml(secondaryMetaLabel)}</strong>
          <span>${escapeHtml(secondaryMetaValue)}</span>
        </div>
      </div>
      <div class="event-card__footer">
        ${footerContent}
      </div>
    </article>
  `;
}

function renderNotes() {
  const currentMembers = getMembers();

  return `
    <section class="panel-grid panel-grid--notes">
      <article class="panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Private</p>
            <h3>Gifted and visited tracker</h3>
          </div>
        </div>
        <div class="stack-list">
          ${currentMembers.length
            ? currentMembers
                .map(
                  (member) => `
                    <div class="tracker-row">
                      <div>
                        <strong>${escapeHtml(member.displayName)}</strong>
                        <span>${escapeHtml(member.secondaryName || member.statusText)}</span>
                      </div>
                      <div class="button-row">
                        <button class="tracker-button ${state.privateData.gifted[member.id] ? 'tracker-button--active' : ''}" type="button" data-toggle="gifted" data-member-id="${escapeHtml(member.id)}">
                          ${state.privateData.gifted[member.id] ? 'Gifted' : 'Mark Gifted'}
                        </button>
                        <button class="tracker-button ${state.privateData.visited[member.id] ? 'tracker-button--active' : ''}" type="button" data-toggle="visited" data-member-id="${escapeHtml(member.id)}">
                          ${state.privateData.visited[member.id] ? 'Visited' : 'Mark Visited'}
                        </button>
                      </div>
                    </div>
                  `,
                )
                .join('')
            : `
                <div class="list-row list-row--compact">
                  <span>${escapeHtml(state.memberSource === 'loading' ? 'Loading member tracker list...' : 'No members are available for private tracking yet.')}</span>
                </div>
              `}
        </div>
      </article>

      <article class="panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Private</p>
            <h3>Member notes</h3>
          </div>
        </div>
        <label class="notes-field" for="private-notes">These stay on this browser only.</label>
        <textarea id="private-notes" data-private-notes placeholder="Track porch visits, gift ideas, or weekly reminders here.">${state.privateData.notes}</textarea>
      </article>
    </section>
  `;
}

function renderAccount() {
  if (!hasSupabaseConfig) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Account Access</p>
          <h3>Supabase config is still missing</h3>
          <p class="panel-lead">Add the Supabase URL and anon key in src/config.js before using private accounts or staff tools.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.isReady) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Account Access</p>
          <h3>Checking your account session</h3>
          <p class="panel-lead">Loading sign-in status and staff permissions from Supabase.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.session) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminAuthPanel()}
        ${renderAccountInfoPanel()}
      </section>
    `;
  }

  return `
    <section class="panel-grid panel-grid--admin">
      ${renderAdminSessionPanel()}
      ${state.admin.isRecoveryMode ? renderPasswordRecoveryPanel() : ''}
      ${!getLinkedWishlistMember() ? renderMemberInviteClaimPanel() : ''}
      ${renderAccountInfoPanel()}
      ${hasAdminToolsAccess() ? renderAdminLaunchPanel() : ''}
    </section>
  `;
}

function renderAdmin() {
  const currentMembers = getMembers();

  if (!hasSupabaseConfig) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Admin Tools</p>
          <h3>Supabase config is still missing</h3>
          <p class="panel-lead">Add the Supabase URL and anon key in src/config.js before using staff editing tools.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.isReady) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Admin Tools</p>
          <h3>Checking your staff session</h3>
          <p class="panel-lead">Loading sign-in status and staff permissions from Supabase.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.session) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Admin Tools</p>
          <h3>Sign in first</h3>
          <p class="panel-lead">Open the Account section to create or sign in to your private login before using staff editing tools.</p>
          <div class="button-row">
            <button class="hero-button" type="button" data-section="account">Open Account</button>
          </div>
        </article>
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  if (!hasStaffProfile()) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminSessionPanel()}
        <article class="panel panel--announcement">
          <p class="eyebrow">Staff Access</p>
          <h3>This account is signed in as a member</h3>
          <p class="panel-lead">${escapeHtml(state.admin.notice || 'This account does not have a staff_permissions record, so admin tools stay locked.')}</p>
          <div class="button-row">
            <button class="hero-button" type="button" data-section="account">Open Account</button>
            <button class="hero-button hero-button--secondary" type="button" data-action="admin-refresh-session">Refresh permissions</button>
            <button class="hero-button hero-button--secondary" type="button" data-action="admin-sign-out">Sign out</button>
          </div>
        </article>
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  if (!hasAdminToolsAccess()) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminSessionPanel()}
        <article class="panel panel--announcement">
          <p class="eyebrow">Admin Tools</p>
          <h3>This staff role cannot edit live data</h3>
          <p class="panel-lead">Your account is authenticated, but it does not currently have member-management or event-management permission.</p>
        </article>
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  return `
    <section class="panel-grid panel-grid--admin">
      ${renderAdminSessionPanel()}
      ${renderAdminAnnouncementPanel()}
      ${canManageMembers() ? renderAdminEditorPanel() : ''}
      ${canManageMembers() ? renderAdminMemberInvitePanel(currentMembers) : ''}
      ${canManageEvents() ? renderAdminEventEditorPanel(currentMembers) : ''}
      ${canManageMembers() ? renderAdminMembersPanel(currentMembers) : ''}
      ${canManageEvents() ? renderAdminEventsPanel() : ''}
    </section>
  `;
}

function renderAdminAuthPanel() {
  const authForm = state.admin.authForm;

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Account Access</p>
      <h3>Create or sign in to your private account</h3>
      <p class="panel-lead">Passwords stay private. Staff editing only unlocks if the signed-in email also exists in staff_permissions. Members should create their own login here, then claim an invite code after sign-in.</p>
      ${renderAdminNotice()}
      <form class="admin-form" data-admin-auth-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Email</span>
            <input class="text-input" type="email" name="email" value="${escapeHtml(authForm.email)}" autocomplete="email" required />
          </label>
          <label class="field-group">
            <span>Password</span>
            <input class="text-input" type="password" name="password" value="${escapeHtml(authForm.password)}" autocomplete="current-password" />
            <small class="field-help">Required for Sign In and Create Account. Leave it blank when sending a reset link.</small>
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit" value="sign-in">Sign In</button>
          <button class="hero-button hero-button--secondary" type="submit" value="create-account">Create Account</button>
          <button class="hero-button hero-button--secondary" type="submit" value="send-reset-link">Send Reset Link</button>
        </div>
      </form>
    </article>
  `;
}

function renderPasswordRecoveryPanel() {
  const passwordResetForm = state.admin.passwordResetForm;
  const sessionEmail = cleanText(state.admin.session?.user?.email || '');
  const recoveryMessage = sessionEmail
    ? `Recovery link confirmed for ${sessionEmail}. Enter a new password below.`
    : 'Open the password recovery email link, then enter your new password here.';

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Password Recovery</p>
      <h3>Choose a new password</h3>
      <p class="panel-lead">${escapeHtml(recoveryMessage)}</p>
      <form class="admin-form" data-admin-password-reset-form>
        <div class="form-grid">
          <label class="field-group">
            <span>New Password</span>
            <input class="text-input" type="password" name="new_password" value="${escapeHtml(passwordResetForm.newPassword)}" autocomplete="new-password" required />
          </label>
          <label class="field-group">
            <span>Confirm Password</span>
            <input class="text-input" type="password" name="confirm_password" value="${escapeHtml(passwordResetForm.confirmPassword)}" autocomplete="new-password" required />
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">Save New Password</button>
        </div>
      </form>
    </article>
  `;
}

function renderAdminSessionPanel() {
  const staffProfile = state.admin.staffProfile;
  const sessionEmail = cleanText(state.admin.session?.user?.email || '');
  const isStaff = hasStaffProfile();
  const linkedMember = getLinkedWishlistMember();

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Account Session</p>
      <h3>${escapeHtml(staffProfile?.displayName || 'Member Account')}</h3>
      <p class="panel-lead">${escapeHtml(sessionEmail || 'No active session email found.')}</p>
      ${renderAdminNotice()}
      <div class="permission-badges">
        ${isStaff ? renderPermissionBadges(staffProfile) : '<span class="tag tag--muted">Member account</span>'}
        ${linkedMember ? `<span class="tag tag--role-helper">Member access: ${escapeHtml(linkedMember.displayName)}</span>` : ''}
      </div>
      <div class="button-row admin-form-actions">
        ${hasAdminToolsAccess() ? '<button class="hero-button" type="button" data-section="admin">Open Admin Tools</button>' : ''}
        <button class="hero-button hero-button--secondary" type="button" data-action="admin-refresh-session">Refresh permissions</button>
        <button class="hero-button hero-button--secondary" type="button" data-action="admin-sign-out">Sign Out</button>
      </div>
    </article>
  `;
}

function renderAccountInfoPanel() {
  const isSignedIn = Boolean(state.admin.session);

  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Account</p>
          <h3>${escapeHtml(isSignedIn ? 'What this login does' : 'Private member login')}</h3>
        </div>
      </div>
      <p class="panel-lead">Members create their own email/password login, then claim a private invite code from an admin. Staff permissions stay separate from normal member access.</p>
      <div class="stack-list">
        <div class="list-row list-row--compact">
          <strong>Invite claim</strong>
          <span>Admins send a one-time code that links this login to the correct member profile after sign-in.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Password privacy</strong>
          <span>Admins cannot see member passwords.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Password reset</strong>
          <span>Use Send Reset Link to recover your own password through Supabase Auth email recovery.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Member login</strong>
          <span>Create an account for private features, then claim your member invite to unlock self-service posting.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Staff editing</strong>
          <span>Only emails in staff_permissions unlock the editor.</span>
        </div>
      </div>
    </article>
  `;
}

function renderMemberInviteClaimPanel() {
  const form = state.admin.inviteClaimForm;

  return `
    <article class="panel panel--announcement">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Claim Member Access</p>
          <h3>Enter your invite code</h3>
        </div>
      </div>
      <p class="panel-lead">After you create your account, enter the invite code an admin sent you privately. The code links this login to your member profile without staff needing your personal email address in app tables.</p>
      <form class="admin-form" data-member-invite-claim-form>
        <div class="form-grid">
          <label class="field-group field-group--wide">
            <span>Invite Code</span>
            <input class="text-input invite-code-input" type="text" name="invite_code" value="${escapeHtml(form.code)}" placeholder="ABCD-EFGH-JKLM-NPQR" autocomplete="one-time-code" required />
            <small class="field-help">Codes are one-time use. Paste the code exactly as the admin sent it, then claim it once after sign-in.</small>
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">Claim Invite Code</button>
        </div>
      </form>
    </article>
  `;
}

function renderAdminLaunchPanel() {
  const liveTools = [];

  if (canManageMembers()) {
    liveTools.push('member directory');
  }

  if (canManageEvents()) {
    liveTools.push('shared event calendar');
  }

  return `
    <article class="panel panel--directory">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Staff</p>
          <h3>Admin tools are unlocked</h3>
        </div>
        <span class="tag tag--role-admin">Staff access</span>
      </div>
      <p class="panel-lead">This account can manage the live ${escapeHtml(liveTools.join(' and ') || 'staff tools')}. Open the editor when you want to add, update, deactivate, or organize shared group data.</p>
      <div class="button-row">
        <button class="hero-button" type="button" data-section="admin">Open Admin Tools</button>
      </div>
    </article>
  `;
}

function renderAdminAnnouncementPanel() {
  const form = state.admin.announcementForm;
  const isBusy = state.admin.isBusy;

  return `
    <article class="panel panel--announcement">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Dashboard Announcement</p>
          <h3>Update the message without coding</h3>
        </div>
        <span class="tag">Shared live text</span>
      </div>
      <p class="panel-lead">This message appears at the top of the dashboard for everyone using the app. Save here to update it live without editing src/data/mockData.js.</p>
      <form class="admin-form" data-admin-announcement-form>
        <div class="form-grid">
          <label class="field-group field-group--wide">
            <span>Announcement</span>
            <textarea name="announcement" class="admin-textarea" maxlength="${DASHBOARD_ANNOUNCEMENT_MAX_LENGTH}" placeholder="Write the shared announcement shown on the dashboard.">${escapeHtml(form.announcement)}</textarea>
            <small class="field-help">Visible to everyone. Keep it short enough to scan quickly from the dashboard card.</small>
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit"${isBusy ? ' disabled' : ''}>${escapeHtml(isBusy ? 'Saving...' : 'Save Announcement')}</button>
        </div>
      </form>
    </article>
  `;
}

function renderPermissionBadges(staffProfile) {
  const badges = [
    `<span class="tag ${getRoleTagClass(staffProfile.permissionRole)}">${escapeHtml(formatGroupRoleLabel(staffProfile.permissionRole))}</span>`,
    staffProfile.canManageMembers ? '<span class="tag tag--role-helper">Can manage members</span>' : '<span class="tag tag--muted">Read only</span>',
    staffProfile.canManageRoles ? '<span class="tag tag--role-admin">Can manage roles</span>' : '<span class="tag tag--muted">Roles locked</span>',
    staffProfile.canManageEvents ? '<span class="tag tag--role-event">Can manage events</span>' : '',
  ].filter(Boolean);

  return badges.join('');
}

function renderAdminEditorPanel() {
  const form = state.admin.form;
  const isEditing = Boolean(state.admin.editingMemberId);
  const editingMember = isEditing ? findMemberById(state.admin.editingMemberId) : null;
  const canManageRoles = Boolean(state.admin.staffProfile?.canManageRoles);

  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Member and Birthday Editor</p>
          <h3>${escapeHtml(isEditing ? `Edit ${editingMember?.displayName || 'member'}` : 'Add member')}</h3>
        </div>
        <span class="tag">${escapeHtml(isEditing ? 'Editing selected member' : 'New active member')}</span>
      </div>
      <p class="panel-lead">Use Facebook names as the primary label. Set the YoWorld name as the gift-confirmation name, and birthdays will flow into the dashboard and shared calendar automatically.</p>
      <form class="admin-form" data-admin-member-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Facebook Name</span>
            <input class="text-input" type="text" name="facebook_name" value="${escapeHtml(form.facebookName)}" required />
          </label>
          <label class="field-group">
            <span>YoWorld Name</span>
            <input class="text-input" type="text" name="in_game_name" value="${escapeHtml(form.inGameName)}" />
          </label>
          <label class="field-group">
            <span>House Key</span>
            <input class="text-input" type="text" name="house_key" value="${escapeHtml(form.houseKey)}" placeholder="h123456789 or APLiving-123456789" />
          </label>
          <label class="field-group">
            <span>Birthday</span>
            <input class="text-input" type="text" name="birthday_raw" value="${escapeHtml(form.birthdayRaw)}" placeholder="September 6" />
            <small class="field-help">Use the Month Day format so it shows correctly in the birthday highlights and calendar.</small>
          </label>
          <label class="field-group">
            <span>Visible Role</span>
            <select class="text-input" name="group_role" ${canManageRoles ? '' : 'disabled'}>
              ${renderRoleOptions(form.groupRole)}
            </select>
            <small class="field-help">${escapeHtml(canManageRoles ? 'Shown in the public directory.' : 'Role changes are locked for this account.')}</small>
          </label>
          <label class="field-group field-group--wide">
            <span>Notes</span>
            <textarea name="notes" class="admin-textarea" placeholder="Optional admin note or reminder for this member.">${escapeHtml(form.notes)}</textarea>
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">${escapeHtml(isEditing ? 'Save Changes' : 'Add Member')}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="admin-reset-member-form">${escapeHtml(isEditing ? 'Cancel Edit' : 'Clear Form')}</button>
        </div>
      </form>
      <p class="muted">Removing a member uses a safe deactivate action. Hard delete is intentionally disabled.</p>
    </article>
  `;
}

function renderAdminEventEditorPanel(currentMembers, options = {}) {
  const { context = 'admin' } = options;
  const form = getEventEditorFormState();
  const isEditing = Boolean(state.admin.editingEventId);
  const isEventsContext = context === 'events';
  const linkedMember = getLinkedEventMember();
  const postingMemberName = cleanText(linkedMember?.facebookName || linkedMember?.displayName);
  const canChooseHost = Boolean(canManageEvents());
  const hostName = canChooseHost
    ? cleanText(form.hostName)
    : cleanText(form.hostName) || postingMemberName;
  const panelEyebrow = isEventsContext ? 'Post an Event' : 'Event Calendar Editor';
  const panelTitle = isEventsContext
    ? (isEditing ? 'Update your event' : 'Post a new event')
    : (isEditing ? 'Edit event' : 'Add event');
  const panelTag = isEventsContext
    ? (isEditing ? 'Editing your event' : 'Shared calendar')
    : (isEditing ? 'Editing live event' : 'Shared calendar');
  const panelLead = canChooseHost
    ? (isEditing
        ? 'Staff can update this event and keep it aligned with the right active member profile.'
        : 'Staff can post or moderate shared events for any active member right from this editor.')
    : (isEditing
        ? 'This event stays linked to its original poster while you update the details.'
        : `New event posts always publish as ${postingMemberName || 'your linked member profile'} and stay editable by the person who created them.`);

  if (!isEditing && context === 'admin' && !linkedMember && !canManageEvents()) {
    return `
      <article class="panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Event Calendar Editor</p>
            <h3>Claim your member invite to post new events</h3>
          </div>
          <span class="tag">Self-owned posting</span>
        </div>
        <p class="panel-lead">New shared event posts are now locked to the logged-in member profile. Claim your member invite in Account first, then come back here to post as yourself. You can still edit or deactivate existing events below.</p>
        <div class="button-row">
          <button class="hero-button hero-button--secondary" type="button" data-section="account">Open Account</button>
        </div>
      </article>
    `;
  }

  return `
    <article class="panel ${isEventsContext ? 'panel--span-full' : ''}">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">${escapeHtml(panelEyebrow)}</p>
          <h3>${escapeHtml(panelTitle)}</h3>
        </div>
        <span class="tag">${escapeHtml(panelTag)}</span>
      </div>
      <p class="panel-lead">${escapeHtml(panelLead)}</p>
      <form class="admin-form" data-admin-event-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Event Type</span>
            <select class="text-input" name="event_type">
              ${renderEventTypeOptions(form.eventType)}
            </select>
            <small class="field-help">Pick one of the shared types or choose Custom Type to name your own.</small>
          </label>
          <label class="field-group">
            <span>Custom Event Type</span>
            <input class="text-input" type="text" name="custom_event_type" value="${escapeHtml(form.customEventType)}" placeholder="Only used when Custom Type is selected" />
            <small class="field-help">Examples: Trivia Night, Scavenger Hunt, Decorating Contest.</small>
          </label>
          <label class="field-group">
            <span>Title</span>
            <input class="text-input" type="text" name="title" value="${escapeHtml(form.title)}" required />
          </label>
          <label class="field-group">
            <span>Date</span>
            <input class="text-input" type="date" name="event_date" value="${escapeHtml(form.eventDate)}" required />
          </label>
          <label class="field-group">
            <span>Start Time</span>
            <input class="text-input" type="time" name="start_time" value="${escapeHtml(form.startTime)}" />
            <small class="field-help">Leave blank for an all-day event.</small>
          </label>
          <label class="field-group">
            <span>End Time</span>
            <input class="text-input" type="time" name="end_time" value="${escapeHtml(form.endTime)}" />
          </label>
          <label class="field-group">
            <span>Timezone Label</span>
            <input class="text-input" type="text" name="timezone" value="${escapeHtml(form.timezone)}" placeholder="ET" />
          </label>
          <label class="field-group">
            <span>Host</span>
            <input class="text-input" type="text" name="host_name" value="${escapeHtml(hostName)}" ${canChooseHost ? 'list="event-host-options" placeholder="Nova June"' : 'readonly'} />
            <small class="field-help">${escapeHtml(canChooseHost ? 'Choose the active member profile that should own this event post.' : (postingMemberName ? 'New event posts stay locked to your claimed member profile.' : 'This event keeps the original host while you edit the rest of the details.'))}</small>
          </label>
          <label class="field-group">
            <span>Location</span>
            <input class="text-input" type="text" name="location_text" value="${escapeHtml(form.locationText)}" placeholder="Party house, game room, Facebook thread, or meet-up spot" />
          </label>
          <label class="field-group">
            <span>Yes Count</span>
            <input class="text-input" type="number" min="0" name="yes_count" value="${escapeHtml(form.yesCount)}" />
          </label>
          <label class="field-group">
            <span>Maybe Count</span>
            <input class="text-input" type="number" min="0" name="maybe_count" value="${escapeHtml(form.maybeCount)}" />
          </label>
          <label class="field-group">
            <span>No Count</span>
            <input class="text-input" type="number" min="0" name="no_count" value="${escapeHtml(form.noCount)}" />
          </label>
          <label class="field-group field-group--wide">
            <span>Details</span>
            <textarea name="details" class="admin-textarea" placeholder="Describe the theme, timing, dress code, gifts, or party details.">${escapeHtml(form.details)}</textarea>
          </label>
        </div>
        ${canChooseHost
          ? `
              <datalist id="event-host-options">
                ${currentMembers
                  .map((member) => `<option value="${escapeHtml(member.facebookName || member.displayName)}"></option>`)
                  .join('')}
              </datalist>
            `
          : ''}
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">${escapeHtml(isEditing ? 'Save Event' : 'Add Event')}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="admin-reset-event-form">${escapeHtml(isEditing ? 'Cancel Edit' : 'Clear Form')}</button>
        </div>
      </form>
      <p class="muted">${escapeHtml(canChooseHost ? 'Staff can post or moderate the live shared calendar here. Old events should be deactivated instead of hard deleted.' : 'New event posts stay tied to the logged-in member account. Staff can still moderate existing events when needed.')}</p>
    </article>
  `;
}

function renderEventTypeOptions(selectedType) {
  const selectedKey = normalizeEventType(selectedType);

  return [...EVENT_TYPE_ORDER, CUSTOM_EVENT_TYPE_KEY]
    .map(
      (eventType) => `
        <option value="${eventType}" ${selectedKey === eventType ? 'selected' : ''}>${escapeHtml(
          eventType === CUSTOM_EVENT_TYPE_KEY ? 'Custom Type' : EVENT_TYPE_DETAILS[eventType].label,
        )}</option>
      `,
    )
    .join('');
}

function renderAdminMemberInvitePanel(currentMembers) {
  const form = state.admin.memberInviteForm;
  const generatedInvite = state.admin.generatedInvite;

  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Member Invite Codes</p>
          <h3>Create a claim code for a member</h3>
        </div>
        <span class="tag">Invite access</span>
      </div>
      <p class="panel-lead">Generate a one-time code for a member, send it privately, and let them sign up with their own email/password before claiming the code in Account.</p>
      ${generatedInvite ? renderGeneratedInvitePanel(generatedInvite) : ''}
      <form class="admin-form" data-admin-member-invite-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Member</span>
            <select class="text-input" name="invited_member_id" required>
              <option value="">Choose a member</option>
              ${renderWishlistMemberOptions(currentMembers, form.memberId)}
            </select>
          </label>
          <label class="field-group">
            <span>Expires In</span>
            <input class="text-input" type="number" min="1" max="${MAX_MEMBER_INVITE_EXPIRY_DAYS}" name="expires_in_days" value="${escapeHtml(form.expiresInDays)}" required />
            <small class="field-help">Choose how many days the code should stay valid before expiring automatically.</small>
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">Create Invite Code</button>
        </div>
      </form>
      ${generatedInvite ? renderGeneratedInvitePanel(generatedInvite) : ''}
      <p class="muted">Each new code revokes any older unclaimed code for that member. The plain code is shown only once after creation, so send it privately right away.</p>
    </article>
  `;
}

function renderGeneratedInvitePanel(invite) {
  return `
    <div class="invite-code-card" aria-live="polite" data-generated-invite-panel>
      <p class="eyebrow">Latest Invite Code</p>
      <strong>${escapeHtml(invite.memberName)}</strong>
      <div class="invite-code-card__row">
        <p class="invite-code-card__value">${escapeHtml(invite.code)}</p>
        <button class="hero-button hero-button--secondary" type="button" data-action="admin-copy-generated-invite">Copy Code</button>
      </div>
      <p class="field-help">Expires ${escapeHtml(formatInviteExpiryLabel(invite.expiresAt))}. Only the hashed code is stored in Supabase, so copy and send this code privately now.</p>
    </div>
  `;
}

function renderRoleOptions(selectedRole) {
  return ['member', 'admin', 'event_planner', 'moderator', 'helper']
    .map(
      (role) => `
        <option value="${role}" ${normalizeGroupRole(selectedRole) === role ? 'selected' : ''}>${escapeHtml(formatGroupRoleLabel(role))}</option>
      `,
    )
    .join('');
}

function renderAdminMembersPanel(currentMembers) {
  return `
    <article class="panel panel--span-full panel--directory">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Manage Members</p>
          <h3>Active directory</h3>
        </div>
        <span class="tag">${escapeHtml(`${currentMembers.length} active members`)}</span>
      </div>
      <div class="directory-list" role="list">
        <div class="directory-row directory-row--header" aria-hidden="true">
          <span>Facebook Name</span>
          <span>YoWorld Name</span>
          <span>Role</span>
          <span>Birthday</span>
          <span>Editor Actions</span>
        </div>
        ${currentMembers.map((member) => renderAdminMemberRow(member)).join('')}
      </div>
    </article>
  `;
}

function renderAdminMemberRow(member) {
  const isSelected = member.id === state.admin.editingMemberId;

  return `
    <article class="directory-row ${isSelected ? 'directory-row--selected' : ''}" role="listitem">
      <div class="directory-cell directory-cell--name">
        <strong>${escapeHtml(member.facebookName || member.displayName)}</strong>
        ${member.metaText ? `<span class="directory-helper">${escapeHtml(member.metaText)}</span>` : ''}
      </div>
      <div class="directory-cell">
        <span class="directory-primary">${escapeHtml(member.inGameName || 'Not added yet')}</span>
        <span class="directory-helper">${escapeHtml(member.inGameName ? 'Gift confirmation name' : 'YoWorld name not added yet.')}</span>
      </div>
      <div class="directory-cell">
        <span class="tag ${member.roleTagClass}">${escapeHtml(member.roleLabel)}</span>
      </div>
      <div class="directory-cell">
        <span class="directory-primary">${escapeHtml(member.birthdayLabel)}</span>
      </div>
      <div class="directory-cell directory-cell--actions">
        <div class="directory-actions">
          ${isSelected ? '<span class="tag tag--role-admin">Editing now</span>' : ''}
          <button class="hero-button hero-button--secondary" type="button" data-action="admin-edit-member" data-member-id="${escapeHtml(member.id)}">Edit</button>
          <button class="tracker-button" type="button" data-action="admin-deactivate-member" data-member-id="${escapeHtml(member.id)}">Deactivate</button>
        </div>
      </div>
    </article>
  `;
}

function renderAdminChecklistPanel() {
  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Next Steps</p>
          <h3>Admin checklist</h3>
        </div>
      </div>
      <div class="stack-list">
        ${adminChecklist
          .map(
            (item) => `
              <div class="list-row list-row--compact">
                <span>${item}</span>
              </div>
            `,
          )
          .join('')}
      </div>
    </article>
  `;
}

function renderAdminEventsPanel() {
  const currentEvents = getEvents();

  return `
    <article class="panel panel--span-full panel--directory">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Manage Events</p>
          <h3>Shared event calendar</h3>
        </div>
        <span class="tag">${escapeHtml(`${currentEvents.length} active events`)}</span>
      </div>
      <p class="panel-lead">These events power the Events tab for everyone in the group. Use event types to surface the right icon and vibe for each listing.</p>
      <div class="event-grid">
        ${currentEvents.length
          ? currentEvents.map((calendarEvent) => renderEventCard(calendarEvent, { showAdminActions: true })).join('')
          : `
              <div class="list-row list-row--compact">
                <span>${escapeHtml(state.eventSource === 'loading' ? 'Loading live events...' : 'No events are active yet.')}</span>
              </div>
            `}
      </div>
    </article>
  `;
}

function renderAdminNotice() {
  if (!state.admin.notice) {
    return '';
  }

  return `<p class="admin-message admin-message--${escapeHtml(state.admin.noticeTone)}">${escapeHtml(state.admin.notice)}</p>`;
}

function getMembers() {
  return state.members;
}

function getWishlists() {
  return [...state.wishlists].sort(compareWishlists);
}

function getActiveWishlists(limit = 0) {
  const activeWishlists = getWishlists().filter((wishlist) => wishlist.isActive && isWishlistCurrentWeek(wishlist.weekStartDate));
  return limit > 0 ? activeWishlists.slice(0, limit) : activeWishlists;
}

function getCurrentWeekWishlistForMember(memberId) {
  const normalizedMemberId = cleanText(memberId);

  if (!normalizedMemberId) {
    return null;
  }

  return getWishlists().find(
    (wishlist) => cleanText(wishlist.memberId) === normalizedMemberId && isWishlistCurrentWeek(wishlist.weekStartDate),
  ) || null;
}

function getWishlistEditorMembers() {
  const linkedMember = getLinkedWishlistMember();
  return canManageWishlistPosts() ? getMembers() : (linkedMember ? [linkedMember] : []);
}

function getLinkedWishlistMember() {
  return findMemberById(state.admin.memberAccount?.memberId);
}

function getLinkedGiveawayMember() {
  return getLinkedWishlistMember();
}

function getLinkedChatMember() {
  return getLinkedWishlistMember();
}

function getYoModelsManagerMember() {
  return findMemberByName('Gothicka') || null;
}

function getChatEditorMembers() {
  const linkedMember = getLinkedChatMember();
  return canModerateChatMessages() ? getMembers() : (linkedMember ? [linkedMember] : []);
}

function getGiveawayEditorMembers() {
  const linkedMember = getLinkedGiveawayMember();
  return canManageGiveawayPosts() ? getMembers() : (linkedMember ? [linkedMember] : []);
}

function hasLinkedGiveawayAccess() {
  return Boolean(getLinkedGiveawayMember());
}

function hasLinkedChatAccess() {
  return Boolean(getLinkedChatMember());
}

function canPostChatMessages() {
  return canModerateChatMessages() || hasLinkedChatAccess();
}

function isChatMessageOwner(message) {
  if (!message) {
    return false;
  }

  const linkedMember = getLinkedChatMember();
  const sessionUserId = getSessionUserId();
  const sessionEmail = cleanText(state.admin.session?.user?.email).toLowerCase();

  if (!linkedMember || (!sessionUserId && !sessionEmail)) {
    return false;
  }

  return (
    cleanText(message.senderMemberId) === cleanText(linkedMember.id)
    && (
      (sessionUserId && cleanText(message.createdByUserId) === sessionUserId)
      || (sessionEmail && cleanText(message.createdByEmail).toLowerCase() === sessionEmail)
    )
  );
}

function canDeleteChatMessage(message) {
  return canModerateChatMessages() || isChatMessageOwner(message);
}

function getChatComposerState() {
  const availableMembers = getChatEditorMembers();
  const selectedMember = findMemberById(state.admin.chatForm.memberId)
    || availableMembers[0]
    || null;

  return {
    canEdit: canPostChatMessages(),
    availableMembers,
    selectedMember,
  };
}

function ensureChatComposerState() {
  const availableMembers = getChatEditorMembers();

  if (!availableMembers.length) {
    return;
  }

  const selectedMemberId = cleanText(state.admin.chatForm.memberId);

  if (availableMembers.some((member) => member.id === selectedMemberId)) {
    return;
  }

  loadChatFormForMember(availableMembers[0].id, state.activeChatChannel);
}

function loadChatFormForMember(memberId, channelKey = state.activeChatChannel) {
  const normalizedMemberId = cleanText(memberId);
  revokeChatPreviewUrl(state.admin.chatForm.imagePreviewUrl);
  state.admin.chatForm = createEmptyChatForm(channelKey, normalizedMemberId);
}

function loadYoModelsForm() {
  revokeYoModelsPreviewUrl(state.admin.modelsForm.imagePreviewUrl);
  state.admin.modelsForm = createEmptyYoModelsForm();
}

function getWishlistEditorState() {
  const availableMembers = getWishlistEditorMembers();
  const selectedMember = findMemberById(state.admin.wishlistForm.memberId) || availableMembers[0] || null;

  return {
    canEdit: canManageWishlistPosts() || hasLinkedWishlistAccess(),
    availableMembers,
    selectedMember,
    currentWishlist: selectedMember ? getCurrentWeekWishlistForMember(selectedMember.id) : null,
  };
}

function ensureWishlistEditorState() {
  const availableMembers = getWishlistEditorMembers();

  if (!availableMembers.length) {
    return;
  }

  const selectedMemberId = cleanText(state.admin.wishlistForm.memberId);

  if (availableMembers.some((member) => member.id === selectedMemberId)) {
    return;
  }

  loadWishlistFormForMember(availableMembers[0].id);
}

function loadWishlistFormForMember(memberId) {
  const normalizedMemberId = cleanText(memberId);
  const currentWishlist = getCurrentWeekWishlistForMember(normalizedMemberId);
  revokeWishlistPreviewUrl(state.admin.wishlistForm.boardImagePreviewUrl);
  state.admin.wishlistForm = createEmptyWishlistForm(currentWishlist, normalizedMemberId);
}

function getGiveawayComposerState() {
  const availableMembers = getGiveawayEditorMembers();
  const editingGiveaway = state.admin.editingGiveawayId
    ? getGiveaways().find((entry) => entry.id === state.admin.editingGiveawayId)
    : null;
  const selectedMember = findMemberById(state.admin.giveawayForm.memberId)
    || (editingGiveaway ? findMemberById(editingGiveaway.giverMemberId) : null)
    || availableMembers[0]
    || null;

  return {
    canEdit: canManageGiveawayPosts() || hasLinkedGiveawayAccess(),
    availableMembers,
    selectedMember,
    editingGiveaway,
  };
}

function ensureGiveawayEditorState() {
  const availableMembers = getGiveawayEditorMembers();

  if (!availableMembers.length) {
    return;
  }

  const selectedMemberId = cleanText(state.admin.giveawayForm.memberId);

  if (availableMembers.some((member) => member.id === selectedMemberId)) {
    return;
  }

  loadGiveawayFormForMember(availableMembers[0].id);
}

function loadGiveawayFormForMember(memberId, giveaway = null) {
  const normalizedMemberId = cleanText(memberId);
  revokeGiveawayPreviewUrl(state.admin.giveawayForm.imagePreviewUrl);
  state.admin.giveawayForm = createEmptyGiveawayForm(giveaway, normalizedMemberId);
}

function renderWishlistSourceNotice() {
  if (state.wishlistSource === 'live') {
    return '';
  }

  let title = 'Using mock wish list data';
  let message = state.wishlistSourceMessage || getSupabaseStatus();

  if (state.wishlistSource === 'loading') {
    title = 'Loading weekly wish lists';
    message = 'The app found your Supabase config and is trying to load the live weekly wish list board now.';
  } else if (state.wishlistSource === 'restricted') {
    title = 'Wish list board is still private';
  } else if (state.wishlistSource === 'error') {
    title = 'Live wish list load failed';
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">Wishlist Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function getGiveaways() {
  return [...state.giveaways].sort(compareGiveaways);
}

function getYoModelsPosts() {
  return [...state.modelPosts]
    .filter((post) => post.isActive !== false)
    .sort(compareYoModelsPosts);
}

function getActiveChatChannel() {
  return getChatChannelDefinition(state.activeChatChannel);
}

function getChatMessages(channelKey = state.activeChatChannel) {
  const normalizedChannel = normalizeChatChannelKey(channelKey);

  return state.chatMessages
    .filter((message) => message.channelKey === normalizedChannel)
    .sort(compareChatMessages);
}

function getGiveawayEntryForMember(giveaway, memberId) {
  const normalizedMemberId = cleanText(memberId);

  if (!giveaway || !normalizedMemberId) {
    return null;
  }

  return giveaway.entries.find((entry) => cleanText(entry.entrantMemberId) === normalizedMemberId) || null;
}

function renderGiveawaySourceNotice() {
  if (state.giveawaySource === 'live') {
    return '';
  }

  let title = 'Using mock giveaway data';
  let message = state.giveawaySourceMessage || getSupabaseStatus();

  if (state.giveawaySource === 'loading') {
    title = 'Loading live giveaways';
    message = 'The app found your Supabase config and is trying to load the live giveaway board now.';
  } else if (state.giveawaySource === 'restricted') {
    title = 'Giveaways are still private';
  } else if (state.giveawaySource === 'error') {
    title = 'Live giveaways are unavailable';
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">Giveaways Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderYoModelsSourceNotice() {
  if (state.modelSource === 'live') {
    return '';
  }

  let title = 'Using demo YoModels data';
  let message = state.modelSourceMessage || getSupabaseStatus();

  if (state.modelSource === 'loading') {
    title = 'Loading YoModels';
    message = 'The app found your Supabase config and is trying to load the live YoModels posts now.';
  } else if (state.modelSource === 'restricted') {
    title = 'YoModels is still private';
  } else if (state.modelSource === 'error') {
    title = 'Live YoModels is unavailable';
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">YoModels Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderChatSourceNotice() {
  if (state.chatSource === 'live') {
    return '';
  }

  let title = 'Using demo chat data';
  let message = state.chatSourceMessage || getSupabaseStatus();

  if (state.chatSource === 'loading') {
    title = 'Loading live chat';
    message = 'The app found your Supabase config and is trying to load the live chat rooms now.';
  } else if (state.chatSource === 'restricted') {
    title = 'Chat is still private';
  } else if (state.chatSource === 'error') {
    title = 'Live chat is unavailable';
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">Chat Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function getEvents() {
  return [...state.events].sort(compareEvents);
}

function getCalendarFeedItems() {
  const birthdayEntries = getBirthdayMembers()
    .map((member) => createUpcomingBirthdayCalendarEntry(member))
    .filter(Boolean);

  return [...getEvents(), ...birthdayEntries].sort(compareCalendarItems);
}

function getBirthdayMembers() {
  return getMembers().filter((member) => member.hasBirthday).sort(compareUpcomingBirthdays);
}

function getUpcomingBirthdayMembers(limit) {
  const birthdayMembers = getBirthdayMembers();
  return birthdayMembers.length ? birthdayMembers.slice(0, limit) : getMembers().slice(0, limit);
}

function buildDashboardCalendarModel(events, birthdayMembers = []) {
  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendarItemsByDay = new Map();
  const monthEvents = events.filter((calendarEvent) => {
    const parts = parseIsoDateParts(calendarEvent.eventDate);

    if (!parts || parts.year !== year || parts.monthIndex !== monthIndex) {
      return false;
    }

    const currentEvents = calendarItemsByDay.get(parts.day) || [];
    currentEvents.push(calendarEvent);
    calendarItemsByDay.set(parts.day, currentEvents);
    return true;
  });
  const monthBirthdayEntries = birthdayMembers
    .map((member) => createBirthdayCalendarEntry(member, year))
    .filter((entry) => entry && parseIsoDateParts(entry.eventDate)?.monthIndex === monthIndex);

  monthBirthdayEntries.forEach((birthdayEntry) => {
    const parts = parseIsoDateParts(birthdayEntry.eventDate);

    if (!parts) {
      return;
    }

    const currentItems = calendarItemsByDay.get(parts.day) || [];
    currentItems.push(birthdayEntry);
    calendarItemsByDay.set(parts.day, currentItems);
  });

  calendarItemsByDay.forEach((items, dayNumber) => {
    calendarItemsByDay.set(dayNumber, [...items].sort(compareCalendarItems));
  });

  const cells = [];

  for (let blankIndex = 0; blankIndex < firstWeekday; blankIndex += 1) {
    cells.push({
      kind: 'blank',
      key: `blank-${blankIndex}`,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    cells.push({
      kind: 'day',
      key: `day-${dayNumber}`,
      dayNumber,
      isToday:
        year === today.getFullYear() &&
        monthIndex === today.getMonth() &&
        dayNumber === today.getDate(),
      calendarItems: calendarItemsByDay.get(dayNumber) || [],
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      kind: 'blank',
      key: `blank-end-${cells.length}`,
    });
  }

  return {
    monthLabel: formatMonthYearLabel(year, monthIndex),
    eventCount: monthEvents.length,
    birthdayCount: monthBirthdayEntries.length,
    calendarItemCount: monthEvents.length + monthBirthdayEntries.length,
    totalEventCount: events.length,
    cells,
  };
}

function getDashboardCalendarLeadText(calendarModel) {
  if (state.eventSource === 'loading') {
    return 'Loading live events into this month view now.';
  }

  if (state.eventSource === 'restricted') {
    return 'Live events are still private, so the home calendar is using demo data for now.';
  }

  if (state.eventSource === 'error') {
    return state.eventSourceMessage || 'Live events are unavailable right now.';
  }

  if (calendarModel.eventCount > 0 || calendarModel.birthdayCount > 0) {
    const parts = [];

    if (calendarModel.eventCount > 0) {
      parts.push(`${calendarModel.eventCount} active ${calendarModel.eventCount === 1 ? 'event' : 'events'}`);
    }

    if (calendarModel.birthdayCount > 0) {
      parts.push(`${calendarModel.birthdayCount} ${calendarModel.birthdayCount === 1 ? 'birthday' : 'birthdays'}`);
    }

    return `${parts.join(' and ')} on the calendar in ${calendarModel.monthLabel}.`;
  }

  if (calendarModel.totalEventCount > 0) {
    return `No active events or birthdays are scheduled in ${calendarModel.monthLabel} yet.`;
  }

  return 'No active events or birthdays are on the calendar yet.';
}

function buildDashboardCalendarCellTitle(cell) {
  if (cell.kind !== 'day') {
    return '';
  }

  const today = new Date();
  const dateLabel = new Date(today.getFullYear(), today.getMonth(), cell.dayNumber).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (!cell.calendarItems.length) {
    return dateLabel;
  }

  const itemLines = cell.calendarItems.map((calendarItem) => {
    if (calendarItem.isBirthday) {
      return `${calendarItem.title} birthday`;
    }

    const startTime = formatTimeLabel(calendarItem.startTime);
    return startTime ? `${calendarItem.title} at ${startTime}` : calendarItem.title;
  });

  return [dateLabel, ...itemLines].join('\n');
}

function getDashboardCalendarDetailTarget(cell) {
  if (cell.kind !== 'day' || !Array.isArray(cell.calendarItems)) {
    return null;
  }

  return cell.calendarItems.find((calendarItem) => !calendarItem.isBirthday && cleanText(calendarItem.id)) || null;
}

function getDirectoryStatusText() {
  switch (state.memberSource) {
    case 'live':
      return `Live member directory connected. ${state.members.length} active members loaded.`;
    case 'loading':
      return 'Supabase config detected. Loading live member directory...';
    case 'restricted':
      return 'Supabase is connected, but the member directory is still private.';
    case 'error':
      return state.memberSourceMessage || 'Could not load the live member directory.';
    case 'mock':
    default:
      return state.memberSourceMessage || getSupabaseStatus();
  }
}

function renderDirectoryNotice() {
  if (state.memberSource === 'live') {
    return '';
  }

  let title = 'Using mock members';
  let message = state.memberSourceMessage || getSupabaseStatus();

  if (state.memberSource === 'loading') {
    title = 'Loading live members';
    message = 'The app found your Supabase config and is trying to load the active member directory now.';
  } else if (state.memberSource === 'restricted') {
    title = 'Directory still private';
  } else if (state.memberSource === 'error') {
    title = 'Live load failed';
  }

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Directory Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderEmptyMemberPanel(title, message) {
  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Members</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderEmptyEventPanel(title, message) {
  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">Events</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderEventSourceNotice() {
  if (state.eventSource === 'live') {
    return '';
  }

  let title = 'Using demo events';
  let message = state.eventSourceMessage || getSupabaseStatus();

  if (state.eventSource === 'loading') {
    title = 'Loading shared events';
    message = 'The app found your Supabase config and is trying to load the live event calendar now.';
  } else if (state.eventSource === 'restricted') {
    title = 'Events are still private';
  } else if (state.eventSource === 'error') {
    title = 'Live events are unavailable';
  }

  return `
    <article class="panel panel--announcement panel--span-full">
      <p class="eyebrow">Events Status</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="panel-lead">${escapeHtml(message)}</p>
    </article>
  `;
}

function createDefaultAdminState() {
  const storedSession = getStoredSession();

  return {
    session: storedSession,
    staffProfile: null,
    memberAccount: null,
    isReady: false,
    isBusy: false,
    notice: '',
    noticeTone: 'muted',
    isRecoveryMode: false,
    authForm: createAdminAuthForm(storedSession),
    announcementForm: createAnnouncementForm(),
    memberInviteForm: createMemberInviteForm(),
    inviteClaimForm: createInviteClaimForm(),
    generatedInvite: null,
    passwordResetForm: createPasswordResetForm(),
    wishlistForm: createEmptyWishlistForm(),
    modelsForm: createEmptyYoModelsForm(),
    chatForm: createEmptyChatForm(CHAT_CHANNELS[0].key),
    giveawayForm: createEmptyGiveawayForm(),
    editingMemberId: '',
    form: createEmptyMemberForm(),
    editingEventId: '',
    eventForm: createEmptyEventForm(),
    editingGiveawayId: '',
  };
}

function setAdminNotice(message, tone = 'muted') {
  state.admin.notice = cleanText(message);
  state.admin.noticeTone = tone;
}

function createEmptyMemberForm(member = null) {
  return {
    facebookName: cleanText(member?.facebookName),
    inGameName: cleanText(member?.inGameName),
    houseKey: cleanText(member?.houseKey),
    birthdayRaw: cleanText(member?.birthdayRaw),
    groupRole: normalizeGroupRole(member?.groupRole),
    notes: cleanText(member?.notes),
  };
}

function createAdminAuthForm(session = null) {
  return {
    email: cleanText(session?.user?.email),
    password: '',
  };
}

function createAnnouncementForm(announcement = DEFAULT_DASHBOARD_ANNOUNCEMENT) {
  return {
    announcement: cleanText(announcement),
  };
}

function syncAnnouncementFormWithState(nextAnnouncement, previousAnnouncement = '') {
  const currentDraft = cleanText(state.admin.announcementForm?.announcement);

  if (!currentDraft || currentDraft === cleanText(previousAnnouncement)) {
    state.admin.announcementForm = createAnnouncementForm(nextAnnouncement);
  }
}

function createPasswordResetForm() {
  return {
    newPassword: '',
    confirmPassword: '',
  };
}

function createMemberInviteForm(memberId = '') {
  return {
    memberId: cleanText(memberId),
    expiresInDays: String(DEFAULT_MEMBER_INVITE_EXPIRY_DAYS),
  };
}

function createInviteClaimForm() {
  return {
    code: '',
  };
}

function createEmptyYoModelsForm() {
  return {
    themeTitle: '',
    imageFile: null,
    imagePreviewUrl: '',
    imageName: '',
    imagePath: '',
    imageMimeType: '',
  };
}

function createEmptyChatForm(channelKey = CHAT_CHANNELS[0].key, memberId = '') {
  return {
    channelKey: normalizeChatChannelKey(channelKey),
    memberId: cleanText(memberId),
    messageText: '',
    imageFile: null,
    imagePreviewUrl: '',
    imageName: '',
    imagePath: '',
    imageMimeType: '',
  };
}

function createEmptyWishlistItem(item = null, index = 0) {
  return {
    id: cleanText(item?.id) || `wishlist-slot-${index + 1}`,
    name: cleanText(item?.name || item?.itemName),
    imageUrl: sanitizeUrl(cleanText(item?.imageUrl || item?.item_image_url)),
    sourceUrl: sanitizeUrl(cleanText(item?.sourceUrl || item?.item_source_url)),
    availabilityStatus: normalizeWishlistAvailability(item?.availabilityStatus || item?.availability_status),
    isReceived: Boolean(item?.isReceived ?? item?.is_received),
    receivedFrom: cleanText(item?.receivedFrom || item?.received_from),
    sortOrder: parseNullableInt(item?.sortOrder || item?.sort_order) || index + 1,
  };
}

function createEmptyWishlistForm(wishlist = null, memberId = '') {
  const sourceItems = Array.isArray(wishlist?.items) ? wishlist.items : [];

  return {
    memberId: cleanText(memberId || wishlist?.memberId),
    boardImageFile: null,
    boardImagePreviewUrl: '',
    boardImageName: cleanText(wishlist?.imageName),
    boardImagePath: cleanText(wishlist?.imagePath),
    boardImageMimeType: cleanText(wishlist?.imageMimeType),
    summary: cleanText(wishlist?.summary),
    statusNote: cleanText(wishlist?.statusNote || wishlist?.updateNote),
    thankYouNote: cleanText(wishlist?.thankYouNote),
    items: Array.from({ length: WISHLIST_ITEM_SLOT_COUNT }, (_, index) => createEmptyWishlistItem(sourceItems[index], index)),
  };
}

function createEmptyEventForm(calendarEvent = null) {
  const eventTypeDetails = getEventTypeDetails(calendarEvent?.eventType);

  return {
    title: cleanText(calendarEvent?.title),
    eventType: eventTypeDetails.isCustom ? CUSTOM_EVENT_TYPE_KEY : eventTypeDetails.id,
    customEventType: eventTypeDetails.isCustom ? eventTypeDetails.storedValue : '',
    eventDate: cleanText(calendarEvent?.eventDate),
    startTime: normalizeEventTime(calendarEvent?.startTime),
    endTime: normalizeEventTime(calendarEvent?.endTime),
    timezone: cleanText(calendarEvent?.timezone) || DEFAULT_EVENT_TIMEZONE,
    hostName: cleanText(calendarEvent?.hostName),
    locationText: cleanText(calendarEvent?.locationText),
    yesCount: String(normalizeEventCount(calendarEvent?.yesCount)),
    maybeCount: String(normalizeEventCount(calendarEvent?.maybeCount)),
    noCount: String(normalizeEventCount(calendarEvent?.noCount)),
    details: cleanText(calendarEvent?.details),
  };
}

function createEmptyGiveawayForm(giveaway = null, memberId = '') {
  return {
    memberId: cleanText(memberId || giveaway?.giverMemberId),
    title: cleanText(giveaway?.title),
    itemText: cleanText(giveaway?.itemText),
    endsAtLocal: cleanText(giveaway?.endsAtLocal) || formatIsoDateTimeLocalInput(giveaway?.endsAt) || createDefaultGiveawayEndsAtLocal(),
    imageFile: null,
    imagePreviewUrl: '',
    imageName: cleanText(giveaway?.imageName),
    imagePath: cleanText(giveaway?.imagePath),
    imageMimeType: cleanText(giveaway?.imageMimeType),
  };
}

async function initializeAdminSession(showRefreshMessage = false) {
  state.admin.isReady = false;
  render();

  const redirectSession = await consumeAuthRedirectSession();
  const session = redirectSession.session || (await getValidSession());
  state.admin.session = session;
  state.admin.staffProfile = null;
  state.admin.memberAccount = null;
  state.admin.isRecoveryMode = Boolean(redirectSession.session && redirectSession.type === 'recovery');
  state.admin.authForm = {
    ...state.admin.authForm,
    email: state.admin.authForm.email || cleanText(session?.user?.email),
  };
  state.admin.inviteClaimForm = createInviteClaimForm();

  if (state.admin.isRecoveryMode) {
    state.admin.passwordResetForm = createPasswordResetForm();
  }

  if (session) {
    await loadStaffProfile();
    await loadCurrentMemberAccount();

    if (state.admin.isRecoveryMode) {
      state.activeSection = 'account';
      setAdminNotice('Recovery link confirmed. Choose a new password below.', 'success');
    }
  } else if (showRefreshMessage) {
    setAdminNotice('No active account session was found. Sign in again to continue.', 'muted');
  }

  if (redirectSession.error) {
    state.activeSection = 'account';
    state.admin.isRecoveryMode = false;
    setAdminNotice(redirectSession.error, 'error');
  }

  state.admin.isReady = true;
  render();
}

async function loadStaffProfile() {
  if (!state.admin.session?.user?.email) {
    state.admin.staffProfile = null;
    return;
  }

  const query = new URLSearchParams({
    select: 'email,display_name,permission_role,can_manage_members,can_manage_roles,can_manage_events,is_active,notes',
    email: `eq.${state.admin.session.user.email}`,
  }).toString();
  const response = await supabaseFetch('staff_permissions', {
    query,
    method: 'GET',
    useSession: true,
  });

  if (!response.ok) {
    state.admin.staffProfile = null;
    setAdminNotice(await getSupabaseErrorMessage(response, 'staff'), 'error');
    return;
  }

  const rows = await response.json();
  const profile = Array.isArray(rows) ? rows[0] : null;
  state.admin.staffProfile = profile ? normalizeStaffProfile(profile) : null;

  if (!hasStaffProfile()) {
    setAdminNotice('Signed in. This account can use private login features, but staff editing is still locked.', 'muted');
    return;
  }

  setAdminNotice(`Signed in as ${state.admin.staffProfile.displayName}.`, 'success');
}

async function loadCurrentMemberAccount() {
  if (!hasSupabaseConfig || !state.admin.session) {
    state.admin.memberAccount = null;
    return;
  }

  const sessionUserId = getSessionUserId();

  if (sessionUserId) {
    const authLinkQuery = new URLSearchParams({
      select: 'auth_user_id,member_id,created_at',
      auth_user_id: `eq.${sessionUserId}`,
    }).toString();
    const authLinkResponse = await supabaseFetch('member_auth_links', {
      query: authLinkQuery,
      method: 'GET',
      useSession: true,
    });

    if (authLinkResponse.ok) {
      const authLinkRows = await authLinkResponse.json();
      const authLink = Array.isArray(authLinkRows) ? authLinkRows[0] : null;

      if (authLink) {
        state.admin.memberAccount = {
          authUserId: cleanText(authLink.auth_user_id || sessionUserId),
          memberId: cleanText(authLink.member_id),
          source: 'invite',
        };
        return;
      }
    }
  }

  if (!state.admin.session?.user?.email) {
    state.admin.memberAccount = null;
    return;
  }

  const query = new URLSearchParams({
    select: 'email,member_id',
    email: `eq.${cleanText(state.admin.session.user.email).toLowerCase()}`,
  }).toString();
  const response = await supabaseFetch('member_accounts', {
    query,
    method: 'GET',
    useSession: true,
  });

  if (!response.ok) {
    state.admin.memberAccount = null;
    return;
  }

  const rows = await response.json();
  const link = Array.isArray(rows) ? rows[0] : null;

  state.admin.memberAccount = link
    ? {
        email: cleanText(link.email).toLowerCase(),
        memberId: cleanText(link.member_id),
        source: 'legacy-email',
      }
    : null;
}

function normalizeStaffProfile(profile) {
  return {
    email: cleanText(profile.email),
    displayName: cleanText(profile.display_name) || 'Staff Member',
    permissionRole: normalizeGroupRole(profile.permission_role),
    canManageMembers: Boolean(profile.can_manage_members),
    canManageRoles: Boolean(profile.can_manage_roles),
    canManageEvents: Boolean(profile.can_manage_events),
    isActive: Boolean(profile.is_active),
    notes: cleanText(profile.notes),
  };
}

async function handleAdminAuthSubmit(event) {
  if (!hasSupabaseConfig) {
    setAdminNotice('Supabase config is missing. Add it in src/config.js first.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const email = cleanText(formData.get('email')).toLowerCase();
  const password = String(formData.get('password') || '').trim();
  const mode = event.submitter?.value || 'sign-in';

  if (!email) {
    setAdminNotice('Email is required.', 'error');
    render();
    return;
  }

  if (mode !== 'send-reset-link' && !password) {
    setAdminNotice('Email and password are both required.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(
    mode === 'create-account'
      ? 'Creating your account...'
      : mode === 'send-reset-link'
        ? 'Sending your password reset link...'
        : 'Signing in...',
    'muted',
  );
  render();

  try {
    if (mode === 'send-reset-link') {
      await sendPasswordResetEmail(email, buildPasswordResetRedirectUrl());
      state.admin.authForm = {
        email,
        password: '',
      };
      setAdminNotice('Password reset link sent. Check your email, open the link in this browser, and then choose a new password here.', 'success');
    } else if (mode === 'create-account') {
      const result = await signUpWithPassword(email, password);

      if (result.session) {
        state.admin.session = result.session;
        state.admin.authForm = createAdminAuthForm(result.session);
        await loadStaffProfile();
        await loadCurrentMemberAccount();
      } else if (result.needsEmailConfirmation) {
        state.admin.session = null;
        state.admin.authForm = {
          email,
          password: '',
        };
        setAdminNotice('Account created. Check your email to confirm it, then come back and sign in.', 'success');
      } else {
        state.admin.authForm = {
          email,
          password: '',
        };
        setAdminNotice('Account created. You can sign in now.', 'success');
      }
    } else {
      state.admin.session = await signInWithPassword(email, password);
      state.admin.authForm = createAdminAuthForm(state.admin.session);
      await loadStaffProfile();
      await loadCurrentMemberAccount();
    }
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Account sign-in failed.', 'error');
  } finally {
    state.admin.isBusy = false;
    state.admin.isReady = true;
    render();
  }
}

async function handlePasswordResetSubmit(event) {
  if (!state.admin.isRecoveryMode) {
    setAdminNotice('Open the password recovery link from your email first.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const newPassword = String(formData.get('new_password') || '').trim();
  const confirmPassword = String(formData.get('confirm_password') || '').trim();

  if (!newPassword || !confirmPassword) {
    setAdminNotice('Enter and confirm your new password.', 'error');
    render();
    return;
  }

  if (newPassword.length < 6) {
    setAdminNotice('Passwords must be at least 6 characters long.', 'error');
    render();
    return;
  }

  if (newPassword !== confirmPassword) {
    setAdminNotice('The password confirmation does not match.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Saving your new password...', 'muted');
  render();

  try {
    state.admin.session = await updatePassword(newPassword);
    state.admin.isRecoveryMode = false;
    state.admin.passwordResetForm = createPasswordResetForm();
    await loadStaffProfile();
    await loadCurrentMemberAccount();
    setAdminNotice('Password updated. You are signed in with your new password.', 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not update your password.', 'error');
  } finally {
    state.admin.isBusy = false;
    state.admin.isReady = true;
    render();
  }
}

async function handleAdminAnnouncementSubmit(event) {
  if (!hasSupabaseConfig) {
    setAdminNotice('Supabase config is missing. Add it in src/config.js first.', 'error');
    render();
    return;
  }

  if (!hasAdminToolsAccess()) {
    setAdminNotice('This account does not have permission to update the dashboard announcement.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const announcement = cleanText(formData.get('announcement'));

  if (!announcement) {
    setAdminNotice('Write an announcement before saving it.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Saving the dashboard announcement...', 'muted');
  render();

  try {
    const response = await supabaseFetch('dashboard_settings', {
      method: 'POST',
      query: new URLSearchParams({ on_conflict: 'setting_key' }).toString(),
      useSession: true,
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: {
        setting_key: DASHBOARD_SETTINGS_KEY,
        announcement,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'dashboard-settings-write'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const previousAnnouncement = state.dashboardAnnouncement;
    const savedAnnouncement = cleanText(savedRow?.announcement) || announcement;

    state.dashboardAnnouncement = savedAnnouncement;
    state.dashboardAnnouncementSource = 'live';
    state.dashboardAnnouncementSourceMessage = 'Loaded the live dashboard announcement from Supabase.';
    syncAnnouncementFormWithState(savedAnnouncement, previousAnnouncement);
    setAdminNotice('Dashboard announcement saved.', 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not save the dashboard announcement.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleAdminSignOut() {
  await signOut();
  state.admin = createDefaultAdminState();
  state.admin.isReady = true;
  if (state.activeSection === 'admin') {
    state.activeSection = 'account';
  }
  setAdminNotice('Signed out.', 'muted');
  render();
}

function beginEditingMember(memberId) {
  const member = getMembers().find((entry) => entry.id === memberId);

  if (!member) {
    setAdminNotice('That member could not be found.', 'error');
    return;
  }

  state.admin.editingMemberId = member.id;
  state.admin.form = createEmptyMemberForm(member);
  setAdminNotice(`Editing ${member.facebookName || member.displayName}.`, 'muted');
}

function resetAdminEditor() {
  state.admin.editingMemberId = '';
  state.admin.form = createEmptyMemberForm();
  setAdminNotice('Member form reset.', 'muted');
}

function beginEditingEvent(eventId) {
  const calendarEvent = getEvents().find((entry) => entry.id === eventId);

  if (!calendarEvent) {
    setAdminNotice('That event could not be found.', 'error');
    return;
  }

  if (!canEditEvent(calendarEvent)) {
    setAdminNotice('You can edit only events you created unless you have event manager access.', 'error');
    return;
  }

  state.admin.editingEventId = calendarEvent.id;
  state.admin.eventForm = createEmptyEventForm(calendarEvent);
  setAdminNotice(`Editing ${calendarEvent.title}.`, 'muted');
}

function beginEditingWishlist(memberId) {
  const wishlist = getCurrentWeekWishlistForMember(memberId);

  if (!wishlist) {
    setAdminNotice('That wish list could not be found.', 'error');
    return;
  }

  if (!canEditWishlistPost(wishlist)) {
    setAdminNotice('You can update only your own wish list unless you have staff access.', 'error');
    return;
  }

  loadWishlistFormForMember(wishlist.memberId);
  setAdminNotice(`Editing ${wishlist.memberName}'s current-week wish list.`, 'muted');
}

function beginEditingGiveaway(giveawayId, options = {}) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    return;
  }

  if (!canManageGiveaway(giveaway)) {
    setAdminNotice('Only the giveaway creator or staff can edit this giveaway.', 'error');
    return;
  }

  const nextForm = createEmptyGiveawayForm(giveaway, giveaway.giverMemberId);

  if (options.reopen && !giveaway.hasWinner) {
    nextForm.endsAtLocal = createDefaultGiveawayEndsAtLocal();
  }

  revokeGiveawayPreviewUrl(state.admin.giveawayForm.imagePreviewUrl);
  state.admin.editingGiveawayId = giveaway.id;
  state.admin.giveawayForm = nextForm;
  setAdminNotice(
    options.reopen && !giveaway.hasWinner
      ? `Adjust the end time and save to reopen ${giveaway.title}.`
      : `Editing ${giveaway.title}.`,
    'muted',
  );
}

function resetAdminEventEditor() {
  state.admin.editingEventId = '';
  state.admin.eventForm = createEmptyEventForm();
  setAdminNotice('Event form reset.', 'muted');
}

function resetWishlistEditor() {
  const fallbackMember = getWishlistEditorMembers()[0] || null;
  const fallbackMemberId = cleanText(fallbackMember?.id);

  revokeWishlistPreviewUrl(state.admin.wishlistForm.boardImagePreviewUrl);
  state.admin.wishlistForm = createEmptyWishlistForm(getCurrentWeekWishlistForMember(fallbackMemberId), fallbackMemberId);
  setAdminNotice('Wish list form reset.', 'muted');
}

function resetGiveawayEditor() {
  const fallbackMember = getGiveawayEditorMembers()[0] || null;
  const fallbackMemberId = cleanText(fallbackMember?.id);

  revokeGiveawayPreviewUrl(state.admin.giveawayForm.imagePreviewUrl);
  state.admin.editingGiveawayId = '';
  state.admin.giveawayForm = createEmptyGiveawayForm(null, fallbackMemberId);
  setAdminNotice('Giveaway form reset.', 'muted');
}

function resetChatComposer() {
  const fallbackMemberId = cleanText(state.admin.chatForm.memberId || getChatComposerState().selectedMember?.id);
  revokeChatPreviewUrl(state.admin.chatForm.imagePreviewUrl);
  state.admin.chatForm = createEmptyChatForm(state.activeChatChannel, fallbackMemberId);
  setAdminNotice('Chat draft cleared.', 'muted');
}

function resetYoModelsComposer() {
  revokeYoModelsPreviewUrl(state.admin.modelsForm.imagePreviewUrl);
  state.admin.modelsForm = createEmptyYoModelsForm();
  setAdminNotice('YoModels form cleared.', 'muted');
}

function syncAdminDraftField(target) {
  if (!(target instanceof Element) || !target.name) {
    return;
  }

  if (target.closest('[data-admin-auth-form]')) {
    syncAdminDraftState('authForm', ADMIN_AUTH_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-admin-announcement-form]')) {
    syncAdminDraftState('announcementForm', ADMIN_ANNOUNCEMENT_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-admin-member-form]')) {
    syncAdminDraftState('form', ADMIN_MEMBER_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-admin-event-form]')) {
    syncAdminDraftState('eventForm', ADMIN_EVENT_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-wishlist-form]')) {
    syncWishlistDraftField(target);
    return;
  }

  if (target.closest('[data-models-form]')) {
    syncYoModelsDraftField(target);
    return;
  }

  if (target.closest('[data-chat-form]')) {
    syncChatDraftField(target);
    return;
  }

  if (target.closest('[data-giveaway-form]')) {
    syncGiveawayDraftField(target);
    return;
  }

  if (target.closest('[data-admin-member-invite-form]')) {
    syncAdminDraftState('memberInviteForm', ADMIN_MEMBER_INVITE_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-member-invite-claim-form]')) {
    syncAdminDraftState('inviteClaimForm', MEMBER_INVITE_CLAIM_FIELD_MAP, target);
    return;
  }

  if (target.closest('[data-admin-password-reset-form]')) {
    syncAdminDraftState('passwordResetForm', ADMIN_PASSWORD_RESET_FIELD_MAP, target);
  }
}

function syncAdminDraftState(stateKey, fieldMap, target) {
  const draftKey = fieldMap[target.name];

  if (!draftKey) {
    return;
  }

  state.admin[stateKey] = {
    ...state.admin[stateKey],
    [draftKey]: target.value,
  };
}

function syncWishlistDraftField(target) {
  if (!(target instanceof Element) || !target.name) {
    return;
  }

  if (target.name === 'member_id') {
    loadWishlistFormForMember(target.value);
    render();
    return;
  }

  if (target.name === 'board_image_file') {
    handleWishlistImageSelection(target);
    render();
    return;
  }

  const itemMatch = target.name.match(/^(item_name|item_image_url|item_source_url|availability_status|received_from|is_received)_(\d+)$/);

  if (itemMatch) {
    const itemIndex = Number.parseInt(itemMatch[2], 10);

    if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= state.admin.wishlistForm.items.length) {
      return;
    }

    const nextItems = [...state.admin.wishlistForm.items];
    const currentItem = nextItems[itemIndex];
    let nextValue = target.value;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      nextValue = target.checked;
    }

    switch (itemMatch[1]) {
      case 'item_name':
        nextItems[itemIndex] = { ...currentItem, name: String(nextValue) };
        break;
      case 'item_image_url':
        nextItems[itemIndex] = { ...currentItem, imageUrl: String(nextValue) };
        break;
      case 'item_source_url':
        nextItems[itemIndex] = { ...currentItem, sourceUrl: String(nextValue) };
        break;
      case 'availability_status':
        nextItems[itemIndex] = { ...currentItem, availabilityStatus: String(nextValue) };
        break;
      case 'received_from':
        nextItems[itemIndex] = { ...currentItem, receivedFrom: String(nextValue) };
        break;
      case 'is_received':
        nextItems[itemIndex] = { ...currentItem, isReceived: Boolean(nextValue) };
        break;
      default:
        return;
    }

    state.admin.wishlistForm = {
      ...state.admin.wishlistForm,
      items: nextItems,
    };
    return;
  }

  syncAdminDraftState('wishlistForm', ADMIN_WISHLIST_FIELD_MAP, target);
}

function syncGiveawayDraftField(target) {
  if (!(target instanceof Element) || !target.name) {
    return;
  }

  if (target.name === 'giver_member_id') {
    syncAdminDraftState('giveawayForm', ADMIN_GIVEAWAY_FIELD_MAP, target);
    render();
    return;
  }

  if (target.name === 'giveaway_image_file') {
    handleGiveawayImageSelection(target);
    return;
  }

  syncAdminDraftState('giveawayForm', ADMIN_GIVEAWAY_FIELD_MAP, target);
  refreshGiveawayComposerPreview();
}

function syncChatDraftField(target) {
  if (!(target instanceof Element) || !target.name) {
    return;
  }

  if (target.name === 'chat_image_file') {
    handleChatImageSelection(target);
    render();
    return;
  }

  if (target.name === 'sender_member_id') {
    syncAdminDraftState('chatForm', ADMIN_CHAT_FIELD_MAP, target);
    render();
    return;
  }

  syncAdminDraftState('chatForm', ADMIN_CHAT_FIELD_MAP, target);
}

function syncYoModelsDraftField(target) {
  if (!(target instanceof Element) || !target.name) {
    return;
  }

  if (target.name === 'models_image_file') {
    handleYoModelsImageSelection(target);
    render();
    return;
  }

  syncAdminDraftState('modelsForm', ADMIN_YOMODELS_FIELD_MAP, target);
}

function refreshGiveawayComposerPreview() {
  const previewRoot = app.querySelector('[data-giveaway-preview]');

  if (!previewRoot) {
    return;
  }

  previewRoot.innerHTML = renderGiveawayComposerPreview(getGiveawayComposerState());
}

function handleWishlistImageSelection(target) {
  const file = target instanceof HTMLInputElement && target.files ? target.files[0] : null;

  revokeWishlistPreviewUrl(state.admin.wishlistForm.boardImagePreviewUrl);

  if (!file) {
    state.admin.wishlistForm = {
      ...state.admin.wishlistForm,
      boardImageFile: null,
      boardImagePreviewUrl: '',
      boardImageName: '',
    };
    return;
  }

  try {
    validateWishlistImageFile(file);
  } catch (error) {
    state.admin.wishlistForm = {
      ...state.admin.wishlistForm,
      boardImageFile: null,
      boardImagePreviewUrl: '',
      boardImageName: '',
    };
    setAdminNotice(error instanceof Error ? error.message : 'Choose a PNG or JPEG image.', 'error');
    return;
  }

  state.admin.wishlistForm = {
    ...state.admin.wishlistForm,
    boardImageFile: file,
    boardImagePreviewUrl: URL.createObjectURL(file),
    boardImageName: file.name || 'wishlist-image',
  };
  setAdminNotice(`${file.name || 'Image'} is ready to upload.`, 'success');
}

function handleGiveawayImageSelection(target) {
  const file = target instanceof HTMLInputElement && target.files ? target.files[0] : null;

  revokeGiveawayPreviewUrl(state.admin.giveawayForm.imagePreviewUrl);

  if (!file) {
    state.admin.giveawayForm = {
      ...state.admin.giveawayForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    refreshGiveawayComposerPreview();
    return;
  }

  try {
    validateGiveawayImageFile(file);
  } catch (error) {
    state.admin.giveawayForm = {
      ...state.admin.giveawayForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    setAdminNotice(error instanceof Error ? error.message : 'Choose a PNG or JPEG image.', 'error');
    refreshGiveawayComposerPreview();
    return;
  }

  state.admin.giveawayForm = {
    ...state.admin.giveawayForm,
    imageFile: file,
    imagePreviewUrl: URL.createObjectURL(file),
    imageName: file.name || 'giveaway-image',
    imagePath: '',
    imageMimeType: file.type || '',
  };
  setAdminNotice(`${file.name || 'Image'} is ready to upload with this giveaway.`, 'success');
  refreshGiveawayComposerPreview();
}

function handleChatImageSelection(target) {
  const file = target instanceof HTMLInputElement && target.files ? target.files[0] : null;

  revokeChatPreviewUrl(state.admin.chatForm.imagePreviewUrl);

  if (!file) {
    state.admin.chatForm = {
      ...state.admin.chatForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    return;
  }

  try {
    validateChatImageFile(file);
  } catch (error) {
    state.admin.chatForm = {
      ...state.admin.chatForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    setAdminNotice(error instanceof Error ? error.message : 'Choose a supported chat image first.', 'error');
    return;
  }

  state.admin.chatForm = {
    ...state.admin.chatForm,
    imageFile: file,
    imagePreviewUrl: URL.createObjectURL(file),
    imageName: file.name || 'chat-image',
    imagePath: '',
    imageMimeType: file.type || '',
  };
  setAdminNotice(`${file.name || 'Image'} is ready to send in chat.`, 'success');
}

function handleYoModelsImageSelection(target) {
  const file = target instanceof HTMLInputElement && target.files ? target.files[0] : null;

  revokeYoModelsPreviewUrl(state.admin.modelsForm.imagePreviewUrl);

  if (!file) {
    state.admin.modelsForm = {
      ...state.admin.modelsForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    return;
  }

  try {
    validateYoModelsImageFile(file);
  } catch (error) {
    state.admin.modelsForm = {
      ...state.admin.modelsForm,
      imageFile: null,
      imagePreviewUrl: '',
      imageName: '',
      imagePath: '',
      imageMimeType: '',
    };
    setAdminNotice(error instanceof Error ? error.message : 'Choose a supported YoModels image first.', 'error');
    return;
  }

  state.admin.modelsForm = {
    ...state.admin.modelsForm,
    imageFile: file,
    imagePreviewUrl: URL.createObjectURL(file),
    imageName: file.name || 'yomodels-image',
    imagePath: '',
    imageMimeType: file.type || '',
  };
  setAdminNotice(`${file.name || 'Image'} is ready for YoModels.`, 'success');
}

function validateWishlistImageFile(file) {
  if (!file) {
    throw new Error('Choose a PNG or JPEG wish list image before saving.');
  }

  if (!WISHLIST_IMAGE_TYPES.has(file.type)) {
    throw new Error('Wish list uploads must be PNG or JPEG images.');
  }

  if (file.size > WISHLIST_IMAGE_MAX_BYTES) {
    throw new Error(`Wish list images must be ${Math.round(WISHLIST_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
  }
}

function validateGiveawayImageFile(file) {
  if (!file) {
    throw new Error('Choose a PNG or JPEG giveaway image before saving.');
  }

  if (!GIVEAWAY_IMAGE_TYPES.has(file.type)) {
    throw new Error('Giveaway uploads must be PNG or JPEG images.');
  }

  if (file.size > GIVEAWAY_IMAGE_MAX_BYTES) {
    throw new Error(`Giveaway images must be ${Math.round(GIVEAWAY_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
  }
}

function validateChatImageFile(file) {
  if (!file) {
    throw new Error('Choose an image before sending it to chat.');
  }

  if (!CHAT_IMAGE_TYPES.has(file.type)) {
    throw new Error('Chat uploads must be PNG, JPEG, or WebP images.');
  }

  if (file.size > CHAT_IMAGE_MAX_BYTES) {
    throw new Error(`Chat images must be ${Math.round(CHAT_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
  }
}

function validateYoModelsImageFile(file) {
  if (!file) {
    throw new Error('Choose an image before publishing to YoModels.');
  }

  if (!YOMODELS_IMAGE_TYPES.has(file.type)) {
    throw new Error('YoModels uploads must be PNG, JPEG, or WebP images.');
  }

  if (file.size > YOMODELS_IMAGE_MAX_BYTES) {
    throw new Error(`YoModels images must be ${Math.round(YOMODELS_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
  }
}

function revokeWishlistPreviewUrl(url) {
  if (!url || !String(url).startsWith('blob:')) {
    return;
  }

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore stale object URLs.
  }
}

function revokeGiveawayPreviewUrl(url) {
  if (!url || !String(url).startsWith('blob:')) {
    return;
  }

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore stale object URLs.
  }
}

function revokeChatPreviewUrl(url) {
  if (!url || !String(url).startsWith('blob:')) {
    return;
  }

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore stale object URLs.
  }
}

function revokeYoModelsPreviewUrl(url) {
  if (!url || !String(url).startsWith('blob:')) {
    return;
  }

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore stale object URLs.
  }
}

async function handleAdminMemberSubmit(event) {
  if (!state.admin.staffProfile?.canManageMembers) {
    setAdminNotice('This account does not have permission to manage members.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const currentMember = state.admin.editingMemberId
    ? getMembers().find((entry) => entry.id === state.admin.editingMemberId)
    : null;

  state.admin.isBusy = true;
  setAdminNotice(state.admin.editingMemberId ? 'Saving member changes...' : 'Adding member...', 'muted');
  render();

  try {
    const payload = buildMemberPayload(formData, currentMember);
    const wasEditing = Boolean(state.admin.editingMemberId);
    const response = state.admin.editingMemberId
      ? await supabaseFetch('members', {
          method: 'PATCH',
          query: new URLSearchParams({ id: `eq.${state.admin.editingMemberId}` }).toString(),
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: payload,
        })
      : await supabaseFetch('members', {
          method: 'POST',
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: payload,
        });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'write'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const savedName = cleanText(savedRow?.facebook_name) || payload.facebook_name;

    state.admin.editingMemberId = '';
    state.admin.form = createEmptyMemberForm();
    await loadLiveMembers();
    setAdminNotice(
      wasEditing ? `Saved ${savedName}.` : `${savedName} is now in the directory.`,
      'success',
    );
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not save that member.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleAdminEventSubmit(event) {
  const currentEvent = state.admin.editingEventId
    ? getEvents().find((entry) => entry.id === state.admin.editingEventId)
    : null;

  if (state.admin.editingEventId && !currentEvent) {
    setAdminNotice('That event could not be found.', 'error');
    render();
    return;
  }

  if (currentEvent && !canEditEvent(currentEvent)) {
    setAdminNotice('You can edit only events you created unless you have event manager access.', 'error');
    render();
    return;
  }

  if (!currentEvent && !canCreateEventPost()) {
    setAdminNotice('Claim your member invite or use an event manager account before posting a new event.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(state.admin.editingEventId ? 'Saving event changes...' : 'Adding event...', 'muted');
  render();

  try {
    const payload = buildEventPayload(new FormData(event.target), currentEvent);
    const wasEditing = Boolean(state.admin.editingEventId);

    const response = state.admin.editingEventId
      ? await supabaseFetch('events', {
          method: 'PATCH',
          query: new URLSearchParams({ id: `eq.${state.admin.editingEventId}` }).toString(),
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: payload,
        })
      : await supabaseFetch('events', {
          method: 'POST',
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: payload,
        });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'event-write'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const savedTitle = cleanText(savedRow?.title) || payload.title;

    state.admin.editingEventId = '';
    state.admin.eventForm = createEmptyEventForm();
    await loadLiveEvents();
    setAdminNotice(wasEditing ? `Saved ${savedTitle}.` : `${savedTitle} is now on the shared calendar.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not save that event.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleWishlistSubmit(event) {
  if (!state.admin.session) {
    setAdminNotice('Sign in first to post a weekly wish list.', 'error');
    render();
    return;
  }

  const editorState = getWishlistEditorState();

  if (!editorState.canEdit) {
    setAdminNotice('This account has not claimed a member invite yet.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const targetMemberId = canManageWishlistPosts()
    ? cleanText(formData.get('member_id'))
    : cleanText(getLinkedWishlistMember()?.id);
  const targetMember = findMemberById(targetMemberId);

  if (!targetMember) {
    setAdminNotice(canManageWishlistPosts() ? 'Choose a member before posting a wish list.' : 'Claim your member invite before posting a wish list.', 'error');
    render();
    return;
  }

  const currentWishlist = getCurrentWeekWishlistForMember(targetMember.id);
  const selectedImageFile = state.admin.wishlistForm.boardImageFile;

  if (!selectedImageFile && !currentWishlist?.imageUrl) {
    setAdminNotice('Choose a PNG or JPEG wish list image before saving.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(selectedImageFile ? 'Uploading wish list image...' : 'Saving this week\'s wish list...', 'muted');
  render();

  try {
    const imageUpload = selectedImageFile
      ? await uploadWishlistImageFile(selectedImageFile, targetMember, getCurrentWishlistWeekStartIso())
      : null;
    const payload = buildWishlistPostPayload(formData, targetMember, imageUpload, currentWishlist);
    const response = await supabaseFetch('wishlist_posts', {
      method: 'POST',
      query: new URLSearchParams({ on_conflict: 'member_id,week_start_date' }).toString(),
      useSession: true,
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'wishlist-write'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const wishlistId = cleanText(savedRow?.id);

    if (!wishlistId) {
      throw new Error('Supabase did not return the saved wish list id.');
    }

    // The image-post flow replaces the older structured item editor. Clearing old
    // item rows prevents legacy counts from lingering on updated posts.
    const deleteResponse = await supabaseFetch('wishlist_items', {
      method: 'DELETE',
      query: new URLSearchParams({ wishlist_id: `eq.${wishlistId}` }).toString(),
      useSession: true,
    });

    if (!deleteResponse.ok) {
      throw new Error(await getSupabaseErrorMessage(deleteResponse, 'wishlist-write'));
    }

    await loadLiveWishlists();
    loadWishlistFormForMember(targetMember.id);
    setAdminNotice(`${targetMember.displayName} now has an updated wish list image for this week.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not save this wish list.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleGiveawaySubmit(event) {
  if (!state.admin.session) {
    setAdminNotice('Sign in first to post a giveaway.', 'error');
    render();
    return;
  }

  const editorState = getGiveawayComposerState();
  const editingGiveaway = state.admin.editingGiveawayId
    ? getGiveaways().find((entry) => entry.id === state.admin.editingGiveawayId)
    : null;

  if (state.admin.editingGiveawayId && !editingGiveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!editorState.canEdit) {
    setAdminNotice('Claim your member invite before posting a giveaway.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const targetMemberId = state.admin.editingGiveawayId
    ? cleanText(state.admin.giveawayForm.memberId)
    : (canManageGiveawayPosts() ? cleanText(formData.get('giver_member_id')) : cleanText(getLinkedGiveawayMember()?.id));
  const targetMember = findMemberById(targetMemberId);

  if (!targetMember) {
    setAdminNotice(canManageGiveawayPosts() ? 'Choose a member before posting a giveaway.' : 'Claim your member invite before posting a giveaway.', 'error');
    render();
    return;
  }

  const selectedImageFile = state.admin.giveawayForm.imageFile;
  const wasEditing = Boolean(state.admin.editingGiveawayId);

  state.admin.isBusy = true;
  setAdminNotice(
    selectedImageFile
      ? 'Uploading giveaway image...'
      : (wasEditing ? 'Saving giveaway...' : 'Posting giveaway...'),
    'muted',
  );
  render();

  try {
    const payload = buildGiveawayPayload(formData, targetMember);
    const imageUpload = selectedImageFile
      ? await uploadGiveawayImageFile(selectedImageFile, targetMember, payload.ends_at)
      : null;
    const response = wasEditing
      ? await supabaseFetch('giveaways', {
          method: 'PATCH',
          query: new URLSearchParams({ id: `eq.${state.admin.editingGiveawayId}` }).toString(),
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: {
            ...payload,
            image_url: normalizeNullableText(imageUpload?.publicUrl || editingGiveaway?.imageUrl),
            image_path: normalizeNullableText(imageUpload?.path || editingGiveaway?.imagePath),
            image_mime_type: normalizeNullableText(imageUpload?.mimeType || editingGiveaway?.imageMimeType),
            image_name: normalizeNullableText(imageUpload?.name || editingGiveaway?.imageName),
          },
        })
      : await supabaseFetch('giveaways', {
          method: 'POST',
          useSession: true,
          headers: {
            Prefer: 'return=representation',
          },
          body: {
            ...payload,
            image_url: normalizeNullableText(imageUpload?.publicUrl),
            image_path: normalizeNullableText(imageUpload?.path),
            image_mime_type: normalizeNullableText(imageUpload?.mimeType),
            image_name: normalizeNullableText(imageUpload?.name),
          },
        });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'giveaway-write'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const savedTitle = cleanText(savedRow?.title) || payload.title;

    revokeGiveawayPreviewUrl(state.admin.giveawayForm.imagePreviewUrl);
    state.admin.editingGiveawayId = '';
    state.admin.giveawayForm = createEmptyGiveawayForm(null, cleanText(getGiveawayEditorMembers()[0]?.id));
    await loadLiveGiveaways();
    setAdminNotice(wasEditing ? `${savedTitle} was updated.` : `${savedTitle} is now live on the giveaway board.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not post that giveaway.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleYoModelsSubmit(event) {
  if (!state.admin.session) {
    setAdminNotice('Sign in first to publish to YoModels.', 'error');
    render();
    return;
  }

  if (!canManageYoModels()) {
    setAdminNotice('Only Gothicka can publish YoModels posts.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const selectedImageFile = state.admin.modelsForm.imageFile;

  state.admin.isBusy = true;
  setAdminNotice('Publishing YoModels post...', 'muted');
  render();

  try {
    const managerMember = getYoModelsManagerMember();
    const imageUpload = selectedImageFile
      ? await uploadYoModelsImageFile(selectedImageFile)
      : null;
    const payload = buildYoModelsPostPayload(formData, imageUpload);
    const response = await supabaseFetch('yomodel_posts', {
      method: 'POST',
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'models-write'));
    }

    revokeYoModelsPreviewUrl(state.admin.modelsForm.imagePreviewUrl);
    state.admin.modelsForm = createEmptyYoModelsForm();
    await loadLiveYoModels();
    setAdminNotice(`${managerMember?.displayName || 'Gothicka'} posted a new YoModels edit.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not publish that YoModels post.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleChatSubmit(event) {
  if (!state.admin.session) {
    setAdminNotice('Sign in first to post in chat.', 'error');
    render();
    return;
  }

  const editorState = getChatComposerState();
  const selectedMember = editorState.selectedMember;

  if (!selectedMember) {
    setAdminNotice(
      canModerateChatMessages()
        ? 'Choose an active member profile before posting in chat.'
        : 'Claim your member invite before posting in chat.',
      'error',
    );
    render();
    return;
  }

  const formData = new FormData(event.target);
  const selectedImageFile = state.admin.chatForm.imageFile;

  state.admin.isBusy = true;
  setAdminNotice(selectedImageFile ? 'Uploading chat image...' : 'Sending chat message...', 'muted');
  render();

  try {
    const channelKey = normalizeChatChannelKey(formData.get('channel_key'));
    const imageUpload = selectedImageFile
      ? await uploadChatImageFile(selectedImageFile, selectedMember, channelKey)
      : null;
    const payload = buildChatMessagePayload(formData, selectedMember, imageUpload);
    const response = await supabaseFetch('chat_messages', {
      method: 'POST',
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'chat-write'));
    }

    revokeChatPreviewUrl(state.admin.chatForm.imagePreviewUrl);
    state.admin.chatForm = createEmptyChatForm(channelKey, selectedMember.id);
    await loadLiveChatMessages();
    setAdminNotice(`Your message was sent to ${getChatChannelDefinition(channelKey).label}.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not send that chat message.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function deleteChatMessage(messageId) {
  const message = state.chatMessages.find((entry) => entry.id === cleanText(messageId));

  if (!message) {
    setAdminNotice('That chat message could not be found.', 'error');
    render();
    return;
  }

  if (!canDeleteChatMessage(message)) {
    setAdminNotice('Only the message sender or an admin can remove this chat message.', 'error');
    render();
    return;
  }

  if (!window.confirm(`Remove this message from ${getChatChannelDefinition(message.channelKey).label}?`)) {
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Removing chat message...', 'muted');
  render();

  try {
    const response = await supabaseFetch('chat_messages', {
      method: 'DELETE',
      query: new URLSearchParams({ id: `eq.${message.id}` }).toString(),
      useSession: true,
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'chat-delete'));
    }

    if (message.imagePath && typeof storageFetch === 'function') {
      await storageFetch(CHAT_IMAGE_BUCKET, message.imagePath, {
        method: 'DELETE',
        useSession: true,
      }).catch(() => null);
    }

    await loadLiveChatMessages();
    setAdminNotice('Chat message removed.', 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not remove that chat message.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleGiveawayEntryToggle(giveawayId) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!state.admin.session) {
    setAdminNotice('Sign in first to enter giveaways.', 'error');
    render();
    return;
  }

  const linkedMember = getLinkedGiveawayMember();

  if (!linkedMember) {
    setAdminNotice('Claim your member invite before entering giveaways.', 'error');
    render();
    return;
  }

  const currentEntry = getGiveawayEntryForMember(giveaway, linkedMember.id);

  if (!giveaway.isOpen) {
    setAdminNotice('This giveaway is already closed to new entries.', 'error');
    render();
    return;
  }

  if (!currentEntry && !canEnterGiveaway(giveaway)) {
    setAdminNotice('You cannot enter this giveaway.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(currentEntry ? 'Removing your entry...' : 'Adding your entry...', 'muted');
  render();

  try {
    if (currentEntry) {
      const response = await supabaseFetch('giveaway_entries', {
        method: 'DELETE',
        query: new URLSearchParams({ id: `eq.${currentEntry.id}` }).toString(),
        useSession: true,
      });

      if (!response.ok) {
        throw new Error(await getSupabaseErrorMessage(response, 'giveaway-entry-write'));
      }

      await loadLiveGiveaways();
      setAdminNotice(`Your entry was removed from ${giveaway.title}.`, 'success');
    } else {
      const response = await supabaseFetch('giveaway_entries', {
        method: 'POST',
        useSession: true,
        headers: {
          Prefer: 'return=representation',
        },
        body: {
          giveaway_id: giveaway.id,
          entrant_member_id: linkedMember.id,
          entrant_name_snapshot: linkedMember.facebookName || linkedMember.displayName,
          entrant_in_game_name_snapshot: linkedMember.inGameName || '',
        },
      });

      if (!response.ok) {
        throw new Error(await getSupabaseErrorMessage(response, 'giveaway-entry-write'));
      }

      await loadLiveGiveaways();
      setAdminNotice(`You entered ${giveaway.title}.`, 'success');
    }
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not update your giveaway entry.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function copyGiveawayEntrants(giveawayId) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!canManageGiveaway(giveaway)) {
    setAdminNotice('Only the giveaway creator or staff can copy entrant names.', 'error');
    render();
    return;
  }

  if (!giveaway.entryCount) {
    setAdminNotice('Add at least one entry before copying entrant names.', 'error');
    render();
    return;
  }

  try {
    await copyTextToClipboard(buildGiveawayEntrantExportText(giveaway));
    setAdminNotice(`Copied ${giveaway.entryCount} entrant names for ${giveaway.title}.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not copy the entrant list.', 'error');
  }

  render();
}

async function pickGiveawayWinner(giveawayId) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!canManageGiveaway(giveaway)) {
    setAdminNotice('Only the giveaway creator or staff can pick a winner.', 'error');
    render();
    return;
  }

  if (giveaway.hasWinner) {
    setAdminNotice('A winner has already been selected for this giveaway.', 'error');
    render();
    return;
  }

  if (!giveaway.entryCount) {
    setAdminNotice('Add at least one entry before picking a winner.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Picking a winner and closing the giveaway...', 'muted');
  render();

  try {
    const response = await supabaseFetch('rpc/pick_giveaway_winner', {
      method: 'POST',
      useSession: true,
      body: {
        p_giveaway_id: giveaway.id,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'giveaway-winner'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const winnerName = cleanText(savedRow?.winner_name_snapshot) || giveaway.winnerName || 'Winner selected';

    await loadLiveGiveaways();
    setAdminNotice(`${winnerName} was posted as the winner for ${giveaway.title}, and the giveaway is now closed.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not pick a winner for that giveaway.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function rerollGiveawayWinner(giveawayId) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!canManageGiveaway(giveaway)) {
    setAdminNotice('Only the giveaway creator or staff can reroll a winner.', 'error');
    render();
    return;
  }

  if (!giveaway.hasWinner) {
    setAdminNotice('Pick the first winner before rerolling this giveaway.', 'error');
    render();
    return;
  }

  if (giveaway.entryCount < 2) {
    setAdminNotice('Add at least two entries before rerolling the winner.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Rerolling the giveaway winner...', 'muted');
  render();

  try {
    const response = await supabaseFetch('rpc/reroll_giveaway_winner', {
      method: 'POST',
      useSession: true,
      body: {
        p_giveaway_id: giveaway.id,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'giveaway-winner'));
    }

    const rows = await response.json();
    const savedRow = Array.isArray(rows) ? rows[0] : rows;
    const winnerName = cleanText(savedRow?.winner_name_snapshot) || 'Winner selected';

    await loadLiveGiveaways();
    setAdminNotice(`${winnerName} was rerolled for ${giveaway.title}.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not reroll the winner for that giveaway.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function handleWishlistCommentSubmit(event) {
  const formData = new FormData(event.target);
  const wishlistId = cleanText(formData.get('wishlist_id'));
  const commenterName = cleanText(formData.get('commenter_name'));
  const commentText = cleanText(formData.get('comment_text'));
  const didGift = formData.get('did_gift') !== null;

  if (!wishlistId) {
    setAdminNotice('That wish list post could not be found.', 'error');
    render();
    return;
  }

  if (!commenterName) {
    setAdminNotice('Add your name before posting a gift comment.', 'error');
    render();
    return;
  }

  if (!didGift && !commentText) {
    setAdminNotice('Add a comment or check "I gifted" before posting.', 'error');
    render();
    return;
  }

  setAdminNotice('Posting gift comment...', 'muted');
  render();

  try {
    const response = await supabaseFetch('wishlist_comments', {
      method: 'POST',
      useSession: Boolean(state.admin.session),
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        wishlist_id: wishlistId,
        commenter_name: commenterName,
        comment_text: normalizeNullableText(commentText),
        did_gift: didGift,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'wishlist-comments'));
    }

    await loadLiveWishlists();
    setAdminNotice('Gift comment posted.', 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not post that gift comment.', 'error');
  } finally {
    render();
  }
}

async function handleAdminMemberInviteSubmit(event) {
  if (!canManageMembers()) {
    setAdminNotice('This account does not have permission to create member invites.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const memberId = cleanText(formData.get('invited_member_id'));
  const expiresInDays = normalizeInviteExpiryDays(formData.get('expires_in_days'));
  const targetMember = findMemberById(memberId);

  if (!targetMember) {
    setAdminNotice('Choose a member before generating an invite code.', 'error');
    render();
    return;
  }

  const inviteCode = generateInviteCode();

  state.admin.isBusy = true;
  setAdminNotice(`Generating an invite code for ${targetMember.displayName}...`, 'muted');
  render();

  try {
    const response = await supabaseFetch('rpc/create_member_invite', {
      method: 'POST',
      useSession: true,
      body: {
        p_member_id: memberId,
        p_invite_code: inviteCode,
        p_expires_in_days: expiresInDays,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'member-invite-create'));
    }

    const rows = await response.json();
    const inviteRow = Array.isArray(rows) ? rows[0] : rows;

    state.admin.memberInviteForm = createMemberInviteForm(memberId);
    state.admin.generatedInvite = {
      code: inviteCode,
      memberId,
      memberName: targetMember.displayName,
      expiresAt: cleanText(inviteRow?.expires_at),
    };
    try {
      await copyTextToClipboard(inviteCode);
      setAdminNotice(`Invite code ready for ${targetMember.displayName}. It was copied to your clipboard.`, 'success');
    } catch {
      setAdminNotice(`Invite code ready for ${targetMember.displayName}. Copy it from the panel below.`, 'success');
    }
  } catch (error) {
    state.admin.generatedInvite = null;
    setAdminNotice(error instanceof Error ? error.message : 'Could not create that invite code.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
    if (state.admin.generatedInvite) {
      scheduleScrollTo('[data-generated-invite-panel]');
    }
  }
}

async function copyGeneratedInviteCode() {
  const invite = state.admin.generatedInvite;

  if (!invite?.code) {
    setAdminNotice('There is no generated invite code to copy yet.', 'error');
    render();
    return;
  }

  try {
    await copyTextToClipboard(invite.code);
    setAdminNotice(`Copied the invite code for ${invite.memberName}.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not copy that invite code.', 'error');
  }

  render();
}

async function handleMemberInviteClaimSubmit(event) {
  if (!state.admin.session) {
    setAdminNotice('Sign in before claiming an invite code.', 'error');
    render();
    return;
  }

  const formData = new FormData(event.target);
  const inviteCode = cleanText(formData.get('invite_code'));

  if (normalizeInviteCode(inviteCode).length < MIN_MEMBER_INVITE_LENGTH) {
    setAdminNotice('Enter a valid invite code.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Claiming your member invite...', 'muted');
  render();

  try {
    const response = await supabaseFetch('rpc/claim_member_invite', {
      method: 'POST',
      useSession: true,
      body: {
        p_invite_code: inviteCode,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'member-invite-claim'));
    }

    await loadCurrentMemberAccount();

    const linkedMember = getLinkedWishlistMember();
    state.admin.inviteClaimForm = createInviteClaimForm();

    if (linkedMember) {
      loadWishlistFormForMember(linkedMember.id);
    }

    setAdminNotice(
      linkedMember
        ? `${linkedMember.displayName} is now linked to this login.`
        : 'This login is now linked to your member profile.',
      'success',
    );
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not claim that invite code.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function deactivateMember(memberId) {
  if (!state.admin.staffProfile?.canManageMembers) {
    setAdminNotice('This account does not have permission to manage members.', 'error');
    render();
    return;
  }

  const member = getMembers().find((entry) => entry.id === memberId);

  if (!member) {
    setAdminNotice('That member could not be found.', 'error');
    render();
    return;
  }

  if (!window.confirm(`Deactivate ${member.facebookName || member.displayName}? They will be removed from the live directory.`)) {
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(`Deactivating ${member.facebookName || member.displayName}...`, 'muted');
  render();

  try {
    const response = await supabaseFetch('members', {
      method: 'PATCH',
      query: new URLSearchParams({ id: `eq.${memberId}` }).toString(),
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        is_active: false,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'write'));
    }

    if (state.admin.editingMemberId === memberId) {
      state.admin.editingMemberId = '';
      state.admin.form = createEmptyMemberForm();
    }

    await loadLiveMembers();
    setAdminNotice(`${member.facebookName || member.displayName} was deactivated.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not deactivate that member.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function deactivateEvent(eventId) {
  const calendarEvent = getEvents().find((entry) => entry.id === eventId);

  if (!calendarEvent) {
    setAdminNotice('That event could not be found.', 'error');
    render();
    return;
  }

  if (!canEditEvent(calendarEvent)) {
    setAdminNotice('You can deactivate only events you created unless you have event manager access.', 'error');
    render();
    return;
  }

  if (!window.confirm(`Deactivate ${calendarEvent.title}? It will be removed from the live event calendar.`)) {
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(`Deactivating ${calendarEvent.title}...`, 'muted');
  render();

  try {
    const response = await supabaseFetch('events', {
      method: 'PATCH',
      query: new URLSearchParams({ id: `eq.${eventId}` }).toString(),
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        is_active: false,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'event-write'));
    }

    if (state.admin.editingEventId === eventId) {
      state.admin.editingEventId = '';
      state.admin.eventForm = createEmptyEventForm();
    }

    await loadLiveEvents();
    setAdminNotice(`${calendarEvent.title} was deactivated.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not deactivate that event.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function deactivateGiveaway(giveawayId) {
  const giveaway = getGiveaways().find((entry) => entry.id === cleanText(giveawayId));

  if (!giveaway) {
    setAdminNotice('That giveaway could not be found.', 'error');
    render();
    return;
  }

  if (!canManageGiveaway(giveaway)) {
    setAdminNotice('Only the giveaway creator or staff can close this giveaway.', 'error');
    render();
    return;
  }

  if (!window.confirm(`Close ${giveaway.title}? Members will still see it, but new entries will stop.`)) {
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(`Closing ${giveaway.title}...`, 'muted');
  render();

  try {
    const response = await supabaseFetch('giveaways', {
      method: 'PATCH',
      query: new URLSearchParams({ id: `eq.${giveaway.id}` }).toString(),
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        ends_at: new Date().toISOString(),
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'giveaway-write'));
    }

    await loadLiveGiveaways();
    setAdminNotice(`${giveaway.title} was closed.`, 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not close that giveaway.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

async function deactivateYoModelsPost(modelId) {
  const post = getYoModelsPosts().find((entry) => entry.id === cleanText(modelId));

  if (!post) {
    setAdminNotice('That YoModels post could not be found.', 'error');
    render();
    return;
  }

  if (!canManageYoModels()) {
    setAdminNotice('Only Gothicka can hide YoModels posts.', 'error');
    render();
    return;
  }

  if (!window.confirm(`Hide ${post.themeTitle || 'this YoModels post'}? It will be removed from the live gallery.`)) {
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice('Hiding YoModels post...', 'muted');
  render();

  try {
    const response = await supabaseFetch('yomodel_posts', {
      method: 'PATCH',
      query: new URLSearchParams({ id: `eq.${post.id}` }).toString(),
      useSession: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: {
        is_active: false,
      },
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'models-write'));
    }

    if (post.imagePath && typeof storageFetch === 'function') {
      await storageFetch(YOMODELS_IMAGE_BUCKET, post.imagePath, {
        method: 'DELETE',
        useSession: true,
      }).catch(() => null);
    }

    await loadLiveYoModels();
    setAdminNotice('YoModels post hidden.', 'success');
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Could not hide that YoModels post.', 'error');
  } finally {
    state.admin.isBusy = false;
    render();
  }
}

function buildMemberPayload(formData, currentMember) {
  const facebookName = cleanText(formData.get('facebook_name'));

  if (!facebookName) {
    throw new Error('Facebook name is required.');
  }

  const requestedRole = state.admin.staffProfile?.canManageRoles
    ? normalizeGroupRole(formData.get('group_role'))
    : normalizeGroupRole(currentMember?.groupRole);
  const birthday = parseBirthdayInput(formData.get('birthday_raw'));

  return {
    facebook_name: facebookName,
    in_game_name: normalizeNullableText(formData.get('in_game_name')),
    house_key: normalizeNullableText(formData.get('house_key')),
    birthday_raw: birthday.birthdayRaw,
    birthday_month: birthday.birthdayMonth,
    birthday_day: birthday.birthdayDay,
    is_active: true,
    notes: normalizeNullableText(formData.get('notes')),
    group_role: requestedRole || 'member',
  };
}

function buildEventPayload(formData, currentEvent = null) {
  const title = cleanText(formData.get('title'));
  const eventDate = cleanText(formData.get('event_date'));
  const eventType = resolveSubmittedEventType(formData.get('event_type'), formData.get('custom_event_type'));
  const startTime = normalizeEventTime(formData.get('start_time'));
  const endTime = normalizeEventTime(formData.get('end_time'));
  const timezone = cleanText(formData.get('timezone')) || DEFAULT_EVENT_TIMEZONE;
  const linkedMember = getLinkedEventMember();
  const canChooseHost = canManageEvents();
  const hostName = canChooseHost
    ? cleanText(formData.get('host_name'))
    : (linkedMember
        ? cleanText(linkedMember.facebookName || linkedMember.displayName)
        : cleanText(currentEvent?.hostName));
  const locationText = normalizeNullableText(formData.get('location_text'));
  const details = normalizeNullableText(formData.get('details'));
  const matchedMember = canChooseHost ? findMemberByName(hostName) : linkedMember;

  if (!title) {
    throw new Error('Event title is required.');
  }

  if (!currentEvent && !linkedMember && !canChooseHost) {
    throw new Error('Claim your member invite before posting a new event.');
  }

  if (canChooseHost && !matchedMember && !currentEvent) {
    throw new Error('Choose a valid member name for the event host.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    throw new Error('Choose a valid event date.');
  }

  if (endTime && !startTime) {
    throw new Error('Add a start time before adding an end time.');
  }

  if (startTime && endTime && endTime <= startTime) {
    throw new Error('End time must be later than the start time.');
  }

  return {
    title,
    event_type: eventType,
    event_date: eventDate,
    start_time: startTime || null,
    end_time: endTime || null,
    timezone,
    host_name: hostName || null,
    host_member_id: canChooseHost
      ? (matchedMember && isUuid(matchedMember.id) ? matchedMember.id : (isUuid(currentEvent?.hostMemberId) ? currentEvent.hostMemberId : null))
      : (isUuid(linkedMember?.id) ? linkedMember.id : null),
    location_text: locationText,
    details,
    yes_count: normalizeCountInput(formData.get('yes_count')),
    maybe_count: normalizeCountInput(formData.get('maybe_count')),
    no_count: normalizeCountInput(formData.get('no_count')),
    is_active: true,
  };
}

async function uploadWishlistImageFile(file, member, weekStartDate) {
  validateWishlistImageFile(file);

  if (typeof uploadStorageObject !== 'function') {
    throw new Error('Storage uploads are not available. Reload the app and try again.');
  }

  const objectPath = buildWishlistImageStoragePath(member.id, weekStartDate, file);
  const upload = await uploadStorageObject(WISHLIST_IMAGE_BUCKET, objectPath, file, {
    cacheControl: '3600',
  });

  return {
    path: upload.path,
    publicUrl: upload.publicUrl,
    mimeType: file.type,
    name: file.name || 'wishlist-image',
  };
}

async function uploadGiveawayImageFile(file, member, endsAtIso) {
  validateGiveawayImageFile(file);

  if (typeof uploadStorageObject !== 'function') {
    throw new Error('Storage uploads are not available. Reload the app and try again.');
  }

  const objectPath = buildGiveawayImageStoragePath(member.id, endsAtIso, file);
  const upload = await uploadStorageObject(GIVEAWAY_IMAGE_BUCKET, objectPath, file, {
    cacheControl: '3600',
  });

  return {
    path: upload.path,
    publicUrl: upload.publicUrl,
    mimeType: file.type,
    name: file.name || 'giveaway-image',
  };
}

async function uploadYoModelsImageFile(file) {
  validateYoModelsImageFile(file);

  if (typeof uploadStorageObject !== 'function') {
    throw new Error('Storage uploads are not available. Reload the app and try again.');
  }

  const objectPath = buildYoModelsImageStoragePath(file);
  const upload = await uploadStorageObject(YOMODELS_IMAGE_BUCKET, objectPath, file, {
    cacheControl: '3600',
  });

  return {
    path: upload.path,
    publicUrl: upload.publicUrl,
    mimeType: file.type,
    name: file.name || 'yomodels-image',
  };
}

async function uploadChatImageFile(file, member, channelKey) {
  validateChatImageFile(file);

  if (typeof uploadStorageObject !== 'function') {
    throw new Error('Storage uploads are not available. Reload the app and try again.');
  }

  const objectPath = buildChatImageStoragePath(member.id, channelKey, file);
  const upload = await uploadStorageObject(CHAT_IMAGE_BUCKET, objectPath, file, {
    cacheControl: '3600',
  });

  return {
    path: upload.path,
    publicUrl: upload.publicUrl,
    mimeType: file.type,
    name: file.name || 'chat-image',
  };
}

function buildWishlistImageStoragePath(memberId, weekStartDate, file) {
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const cleanBaseName = cleanText(file.name)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'wishlist';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  return `${cleanText(memberId)}/${cleanText(weekStartDate)}/${timestamp}-${cleanBaseName}.${extension}`;
}

function buildGiveawayImageStoragePath(memberId, endsAtIso, file) {
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const cleanBaseName = cleanText(file.name)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'giveaway';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const endsSegment = cleanText(endsAtIso).replace(/[^0-9]/g, '').slice(0, 12) || 'open';

  return `${cleanText(memberId)}/${endsSegment}/${timestamp}-${cleanBaseName}.${extension}`;
}

function buildYoModelsImageStoragePath(file) {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const cleanBaseName = cleanText(file.name)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'yomodels';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  return `${getCurrentMonthKey()}/${timestamp}-${cleanBaseName}.${extension}`;
}

function buildChatImageStoragePath(memberId, channelKey, file) {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const cleanBaseName = cleanText(file.name)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'chat';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  return `${cleanText(memberId)}/${normalizeChatChannelKey(channelKey)}/${timestamp}-${cleanBaseName}.${extension}`;
}

function buildWishlistPostPayload(formData, member, imageUpload = null, currentWishlist = null) {
  const summary = cleanText(formData.get('summary'));
  const statusNote = cleanText(formData.get('status_note'));
  const thankYouNote = cleanText(formData.get('thank_you_note'));
  const imageUrl = cleanText(imageUpload?.publicUrl || currentWishlist?.imageUrl);
  const imagePath = cleanText(imageUpload?.path || currentWishlist?.imagePath);
  const imageMimeType = cleanText(imageUpload?.mimeType || currentWishlist?.imageMimeType);
  const imageName = cleanText(imageUpload?.name || currentWishlist?.imageName);

  if (!imageUrl) {
    throw new Error('Choose a PNG or JPEG wish list image before saving.');
  }

  return {
    member_id: member.id,
    week_start_date: getCurrentWishlistWeekStartIso(),
    member_name_snapshot: member.facebookName || member.displayName,
    member_in_game_name_snapshot: normalizeNullableText(member.inGameName),
    house_key_snapshot: normalizeNullableText(member.houseKey),
    summary: summary || 'Weekly wish list for the current Sunday reset.',
    status_note: statusNote || 'Wish list posted for this week.',
    thank_you_note: normalizeNullableText(thankYouNote),
    board_image_url: imageUrl,
    board_image_path: normalizeNullableText(imagePath),
    board_image_mime_type: normalizeNullableText(imageMimeType),
    board_image_name: normalizeNullableText(imageName),
    is_active: true,
  };
}

function buildGiveawayPayload(formData, member) {
  const title = cleanText(formData.get('title'));
  const itemText = cleanText(formData.get('item_text'));
  const endsAtLocal = cleanText(formData.get('ends_at_local'));
  const endsAtIso = parseDateTimeLocalInputToIso(endsAtLocal);

  if (!title) {
    throw new Error('Add a title before posting the giveaway.');
  }

  if (title.length > 120) {
    throw new Error('Giveaway titles must be 120 characters or fewer.');
  }

  if (!itemText) {
    throw new Error('Add the item details before posting the giveaway.');
  }

  if (itemText.length > 2000) {
    throw new Error('Giveaway item details must be 2000 characters or fewer.');
  }

  if (!endsAtIso) {
    throw new Error('Choose a valid end date and time for the giveaway.');
  }

  if (new Date(endsAtIso).getTime() <= Date.now()) {
    throw new Error('Choose an end date and time in the future.');
  }

  return {
    giver_member_id: member.id,
    giver_name_snapshot: member.facebookName || member.displayName,
    giver_in_game_name_snapshot: member.inGameName || '',
    title,
    item_text: itemText,
    ends_at: endsAtIso,
    is_active: true,
  };
}

function buildYoModelsPostPayload(formData, imageUpload = null) {
  const themeTitle = cleanText(formData.get('theme_title'));

  if (themeTitle.length > YOMODELS_THEME_TITLE_MAX_LENGTH) {
    throw new Error(`Theme titles must be ${YOMODELS_THEME_TITLE_MAX_LENGTH} characters or fewer.`);
  }

  if (!imageUpload?.publicUrl) {
    throw new Error('Upload the YoModels picture before publishing.');
  }

  return {
    theme_title: normalizeNullableText(themeTitle),
    image_url: imageUpload.publicUrl,
    image_path: normalizeNullableText(imageUpload.path),
    image_mime_type: normalizeNullableText(imageUpload.mimeType),
    image_name: normalizeNullableText(imageUpload.name),
    is_active: true,
  };
}

function buildChatMessagePayload(formData, member, imageUpload = null) {
  const channelKey = normalizeChatChannelKey(formData.get('channel_key'));
  const messageText = cleanText(formData.get('message_text'));

  if (messageText.length > CHAT_MESSAGE_MAX_LENGTH) {
    throw new Error(`Chat messages must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer.`);
  }

  if (!messageText && !imageUpload?.publicUrl) {
    throw new Error('Add a message, an image, or both before sending chat.');
  }

  return {
    channel_key: channelKey,
    sender_member_id: member.id,
    sender_name_snapshot: member.facebookName || member.displayName,
    sender_in_game_name_snapshot: member.inGameName || '',
    message_text: normalizeNullableText(messageText),
    image_url: normalizeNullableText(imageUpload?.publicUrl),
    image_path: normalizeNullableText(imageUpload?.path),
    image_mime_type: normalizeNullableText(imageUpload?.mimeType),
    image_name: normalizeNullableText(imageUpload?.name),
  };
}

function buildWishlistItemPayloads(formData, wishlistId) {
  const payload = [];
  let outOfStoreCount = 0;

  for (let index = 0; index < WISHLIST_ITEM_SLOT_COUNT; index += 1) {
    const itemName = cleanText(formData.get(`item_name_${index}`));
    const imageUrlInput = cleanText(formData.get(`item_image_url_${index}`));
    const sourceUrlInput = cleanText(formData.get(`item_source_url_${index}`));
    const receivedFrom = cleanText(formData.get(`received_from_${index}`));
    const availabilityStatus = normalizeWishlistAvailability(formData.get(`availability_status_${index}`));
    const isReceived = formData.get(`is_received_${index}`) !== null;
    const safeImageUrl = sanitizeUrl(imageUrlInput);
    const safeSourceUrl = sanitizeUrl(sourceUrlInput);
    const hasAnyValue = Boolean(itemName || imageUrlInput || sourceUrlInput || receivedFrom || isReceived);

    if (!hasAnyValue) {
      continue;
    }

    if (!itemName) {
      throw new Error(`Item ${index + 1} needs a name before it can be saved.`);
    }

    if (imageUrlInput && !safeImageUrl) {
      throw new Error(`Item ${index + 1} has an invalid image URL.`);
    }

    if (sourceUrlInput && !safeSourceUrl) {
      throw new Error(`Item ${index + 1} has an invalid item source link.`);
    }

    if (availabilityStatus === 'out_of_store') {
      outOfStoreCount += 1;
    }

    payload.push({
      wishlist_id: wishlistId,
      sort_order: payload.length + 1,
      item_name: itemName,
      item_image_url: safeImageUrl || null,
      item_source_url: safeSourceUrl || null,
      availability_status: availabilityStatus,
      is_received: isReceived,
      received_from: normalizeNullableText(receivedFrom),
    });
  }

  if (!payload.length) {
    throw new Error('Add at least one wish list item before saving the board.');
  }

  if (outOfStoreCount > WISHLIST_OUT_OF_STORE_LIMIT) {
    throw new Error(`Only ${WISHLIST_OUT_OF_STORE_LIMIT} items can be marked out of store each week.`);
  }

  return payload;
}

function parseBirthdayInput(value) {
  const rawValue = cleanText(value);

  if (!rawValue) {
    return {
      birthdayRaw: null,
      birthdayMonth: null,
      birthdayDay: null,
    };
  }

  const { birthdayMonth: month, birthdayDay: day } = resolveBirthdayParts(rawValue);

  if (!month || Number.isNaN(day) || day < 1 || day > 31) {
    throw new Error('Birthday must look like "September 6" or be left blank.');
  }

  return {
    birthdayRaw: `${MONTH_NAMES[month]} ${day}`,
    birthdayMonth: month,
    birthdayDay: day,
  };
}

function normalizeNullableText(value) {
  const text = cleanText(value);
  return text || null;
}

async function loadLiveMembers() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const query = new URLSearchParams({
      select: '*',
      is_active: 'eq.true',
      order: 'facebook_name.asc',
    }).toString();
    const response = await supabaseFetch('members', { query, method: 'GET' });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response));
    }

    const rows = await response.json();

    state.members = normalizeSupabaseMembers(Array.isArray(rows) ? rows : []);
    state.memberSource = 'live';
    state.memberSourceMessage = `Loaded ${state.members.length} active members from Supabase.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load the live member directory.';
    state.members = normalizeMockMembers(mockMembers);
    state.memberSource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.memberSourceMessage = message;
  }

  render();
}

async function loadLiveDashboardAnnouncement() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const response = await supabaseFetch('dashboard_settings', {
      query: new URLSearchParams({
        select: 'setting_key,announcement,updated_at',
        setting_key: `eq.${DASHBOARD_SETTINGS_KEY}`,
        limit: '1',
      }).toString(),
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'dashboard-settings'));
    }

    const rows = await response.json();
    const row = Array.isArray(rows) ? rows[0] : rows;
    const previousAnnouncement = state.dashboardAnnouncement;
    const nextAnnouncement = cleanText(row?.announcement) || DEFAULT_DASHBOARD_ANNOUNCEMENT;

    state.dashboardAnnouncement = nextAnnouncement;
    state.dashboardAnnouncementSource = row ? 'live' : 'mock';
    state.dashboardAnnouncementSourceMessage = row
      ? 'Loaded the live dashboard announcement from Supabase.'
      : 'Using the bundled dashboard announcement until a live one is saved.';
    syncAnnouncementFormWithState(nextAnnouncement, previousAnnouncement);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load the dashboard announcement.';

    state.dashboardAnnouncement = DEFAULT_DASHBOARD_ANNOUNCEMENT;
    state.dashboardAnnouncementSource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.dashboardAnnouncementSourceMessage = message;
    syncAnnouncementFormWithState(DEFAULT_DASHBOARD_ANNOUNCEMENT);
  }

  render();
}

async function loadLiveEvents() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const query = new URLSearchParams({
      select: 'id,title,event_type,event_date,start_time,end_time,timezone,host_name,host_member_id,location_text,details,yes_count,maybe_count,no_count,is_active,created_by_user_id,created_by_email',
      is_active: 'eq.true',
      order: 'event_date.asc,start_time.asc.nullslast,title.asc',
    }).toString();
    const response = await supabaseFetch('events', {
      query,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'events'));
    }

    const rows = await response.json();

    state.events = normalizeSupabaseEvents(Array.isArray(rows) ? rows : []);
    state.eventSource = 'live';
    state.eventSourceMessage = `Loaded ${state.events.length} active events from Supabase.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load the shared event calendar.';
    state.events = normalizeMockEvents(mockHangouts);
    state.eventSource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.eventSourceMessage = message;
  }

  render();
}

async function loadLiveWishlists() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const postsQuery = new URLSearchParams({
      select:
        'id,member_id,week_start_date,member_name_snapshot,member_in_game_name_snapshot,house_key_snapshot,summary,status_note,thank_you_note,board_image_url,board_image_path,board_image_mime_type,board_image_name,is_active,created_at,updated_at',
      week_start_date: `eq.${getCurrentWishlistWeekStartIso()}`,
      is_active: 'eq.true',
      order: 'updated_at.desc,member_name_snapshot.asc',
    }).toString();
    const postsResponse = await supabaseFetch('wishlist_posts', {
      query: postsQuery,
      method: 'GET',
    });

    if (!postsResponse.ok) {
      throw new Error(await getSupabaseErrorMessage(postsResponse, 'wishlists'));
    }

    const wishlistRows = await postsResponse.json();
    const normalizedPosts = Array.isArray(wishlistRows) ? wishlistRows : [];
    let itemRows = [];
    let commentRows = [];

    if (normalizedPosts.length) {
      const wishlistIds = normalizedPosts
        .map((row) => cleanText(row.id))
        .filter(Boolean)
        .join(',');

      if (wishlistIds) {
        const itemsQuery = new URLSearchParams({
          select: 'id,wishlist_id,sort_order,item_name,item_image_url,item_source_url,availability_status,is_received,received_from',
          wishlist_id: `in.(${wishlistIds})`,
          order: 'wishlist_id.asc,sort_order.asc',
        }).toString();
        const itemsResponse = await supabaseFetch('wishlist_items', {
          query: itemsQuery,
          method: 'GET',
        });

        if (!itemsResponse.ok) {
          throw new Error(await getSupabaseErrorMessage(itemsResponse, 'wishlists'));
        }

        const liveItems = await itemsResponse.json();
        itemRows = Array.isArray(liveItems) ? liveItems : [];

        const commentsQuery = new URLSearchParams({
          select: 'id,wishlist_id,commenter_name,comment_text,did_gift,created_at',
          wishlist_id: `in.(${wishlistIds})`,
          is_hidden: 'eq.false',
          order: 'created_at.asc',
        }).toString();
        const commentsResponse = await supabaseFetch('wishlist_comments', {
          query: commentsQuery,
          method: 'GET',
        });

        if (!commentsResponse.ok) {
          throw new Error(await getSupabaseErrorMessage(commentsResponse, 'wishlist-comments'));
        }

        const liveComments = await commentsResponse.json();
        commentRows = Array.isArray(liveComments) ? liveComments : [];
      }
    }

    state.wishlists = normalizeSupabaseWishlists(normalizedPosts, itemRows, commentRows);
    state.wishlistSource = 'live';
    state.wishlistSourceMessage = `Loaded ${state.wishlists.length} active wish lists for this week.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load the weekly wish list board.';
    state.wishlists = normalizeMockWishlists(mockWishlists);
    state.wishlistSource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.wishlistSourceMessage = message;
  }

  render();
}

async function loadLiveGiveaways() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const giveawaysQuery = new URLSearchParams({
      select:
        'id,giver_member_id,giver_name_snapshot,giver_in_game_name_snapshot,title,item_text,image_url,image_path,image_mime_type,image_name,ends_at,winner_member_id,winner_name_snapshot,winner_in_game_name_snapshot,winner_selected_at,is_active,created_by_user_id,created_by_email,created_at,updated_at',
      is_active: 'eq.true',
      order: 'ends_at.asc,created_at.desc,title.asc',
    }).toString();
    const giveawaysResponse = await supabaseFetch('giveaways', {
      query: giveawaysQuery,
      method: 'GET',
    });

    if (!giveawaysResponse.ok) {
      throw new Error(await getSupabaseErrorMessage(giveawaysResponse, 'giveaways'));
    }

    const giveawayRows = await giveawaysResponse.json();
    const normalizedGiveaways = Array.isArray(giveawayRows) ? giveawayRows : [];
    let entryRows = [];

    if (normalizedGiveaways.length) {
      const giveawayIds = normalizedGiveaways
        .map((row) => cleanText(row.id))
        .filter(Boolean)
        .join(',');

      if (giveawayIds) {
        const entriesQuery = new URLSearchParams({
          select: 'id,giveaway_id,entrant_member_id,entrant_name_snapshot,entrant_in_game_name_snapshot,created_by_user_id,created_by_email,created_at',
          giveaway_id: `in.(${giveawayIds})`,
          order: 'giveaway_id.asc,created_at.asc',
        }).toString();
        const entriesResponse = await supabaseFetch('giveaway_entries', {
          query: entriesQuery,
          method: 'GET',
        });

        if (!entriesResponse.ok) {
          throw new Error(await getSupabaseErrorMessage(entriesResponse, 'giveaway-entries'));
        }

        const liveEntries = await entriesResponse.json();
        entryRows = Array.isArray(liveEntries) ? liveEntries : [];
      }
    }

    state.giveaways = normalizeSupabaseGiveaways(normalizedGiveaways, entryRows);
    state.giveawaySource = 'live';
    state.giveawaySourceMessage = `Loaded ${state.giveaways.length} giveaway posts from Supabase.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load the giveaway board.';
    state.giveaways = normalizeMockGiveaways(mockGiveaways, getMembers());
    state.giveawaySource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.giveawaySourceMessage = message;
  }

  render();
}

async function loadLiveYoModels() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const query = new URLSearchParams({
      select: 'id,theme_title,image_url,image_path,image_mime_type,image_name,is_active,posted_at,updated_at,created_by_user_id,created_by_email',
      is_active: 'eq.true',
      order: 'posted_at.desc',
    }).toString();
    const response = await supabaseFetch('yomodel_posts', {
      query,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'models'));
    }

    const rows = await response.json();

    state.modelPosts = normalizeSupabaseYoModelsPosts(Array.isArray(rows) ? rows : []);
    state.modelSource = 'live';
    state.modelSourceMessage = `Loaded ${state.modelPosts.length} YoModels posts from Supabase.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load YoModels.';
    state.modelPosts = normalizeMockYoModelsPosts(mockModelPosts);
    state.modelSource = /private|policy|permission|forbidden|unauthorized/i.test(message) ? 'restricted' : 'error';
    state.modelSourceMessage = message;
  }

  render();
}

async function loadLiveChatMessages() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const chatQuery = new URLSearchParams({
      select:
        'id,channel_key,sender_member_id,sender_name_snapshot,sender_in_game_name_snapshot,message_text,image_url,image_path,image_mime_type,image_name,created_by_user_id,created_by_email,created_at,updated_at',
      order: 'created_at.asc',
      limit: '240',
    }).toString();
    const response = await supabaseFetch('chat_messages', {
      query: chatQuery,
      method: 'GET',
      useSession: true,
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, 'chat'));
    }

    const rows = await response.json();
    const normalizedRows = Array.isArray(rows) ? rows : [];

    state.chatMessages = normalizeSupabaseChatMessages(normalizedRows);
    state.chatSource = 'live';
    state.chatSourceMessage = `Loaded ${state.chatMessages.length} chat messages from Supabase.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load live chat.';
    state.chatMessages = hasSupabaseConfig ? [] : initialChatMessages;
    state.chatSource = /private|policy|permission|forbidden|unauthorized|sign in/i.test(message) ? 'restricted' : 'error';
    state.chatSourceMessage = message;
  }

  render();
}

function startChatAutoRefresh() {
  if (!hasSupabaseConfig || typeof window === 'undefined') {
    return;
  }

  window.setInterval(() => {
    if (document.visibilityState === 'hidden' || state.activeSection !== 'chat' || state.chatSource !== 'live') {
      return;
    }

    void loadLiveChatMessages();
  }, CHAT_AUTO_REFRESH_MS);
}

async function getSupabaseErrorMessage(response, context = 'read') {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const payloadMessage = cleanText(payload?.message || payload?.error_description || payload?.error || '');
  const payloadHint = cleanText(payload?.hint || '');
  const payloadSummary = payloadMessage
    ? (payloadHint ? `${payloadMessage} ${payloadHint}` : payloadMessage)
    : '';

  if (response.status === 401 || response.status === 403) {
    if (context === 'dashboard-settings-write') {
      return 'This signed-in account does not have permission to update the dashboard announcement yet.';
    }

    if (context === 'dashboard-settings') {
      return 'The dashboard settings table is still private. Push supabase/migrations/20260514000500_dashboard_announcement.sql first.';
    }

    if (context === 'write') {
      return 'This signed-in account does not have permission to edit members yet.';
    }

    if (context === 'models-write') {
      return 'Only Gothicka can publish or manage YoModels posts.';
    }

    if (context === 'event-write') {
      return 'This signed-in account does not have permission to edit events yet.';
    }

    if (context === 'giveaway-write') {
      return 'This signed-in account does not have permission to post or close giveaways yet.';
    }

    if (context === 'giveaway-entry-write') {
      return 'This signed-in account does not have permission to enter or withdraw from giveaways yet.';
    }

    if (context === 'giveaway-winner') {
      return 'This signed-in account does not have permission to pick a giveaway winner yet.';
    }

    if (context === 'chat-write') {
      return 'This signed-in account does not have permission to post chat messages yet.';
    }

    if (context === 'chat-delete') {
      return 'This signed-in account does not have permission to moderate chat messages yet.';
    }

    if (context === 'staff') {
      return 'Could not read staff permissions. Run supabase/07_admin_editor_auth_policies.sql after 05_member_roles_and_permissions.sql.';
    }

    if (context === 'events') {
      return 'The events calendar is still private. Run supabase/08_events_calendar.sql when you are ready for browser reads.';
    }

    if (context === 'wishlists') {
      return 'The weekly wish list board is still private. Run supabase/11_weekly_wishlists.sql when you are ready for browser reads.';
    }

    if (context === 'giveaways' || context === 'giveaway-entries') {
      return 'The giveaway board is still private. Push supabase/migrations/20260513000100_giveaways.sql first.';
    }

    if (context === 'models') {
      return 'The YoModels board is still private. Push supabase/migrations/20260514000100_yomodels_module.sql first.';
    }

    if (context === 'chat') {
      return 'Sign in with a linked member account to load live chat. If you already did that, push supabase/migrations/20260513000400_chat_module.sql first.';
    }

    if (context === 'wishlist-write') {
      return 'This signed-in account does not have permission to edit wish lists yet.';
    }

    if (context === 'wishlist-comments') {
      return 'Gift comments are not available yet. Run supabase/13_wishlist_image_uploads_and_comments.sql when you are ready for comments.';
    }

    if (context === 'member-link') {
      return 'This signed-in account does not have permission to link member logins yet.';
    }

    if (context === 'member-invite-create') {
      return payloadSummary || 'This signed-in account does not have permission to create member invite codes yet.';
    }

    if (context === 'member-invite-claim') {
      return payloadSummary || 'Sign in to the account that should claim this invite code, then try again.';
    }

    return 'The members table is still private. Run supabase/02_enable_member_directory_read.sql when you are ready for browser reads.';
  }

  if (response.status === 404) {
    if (context === 'dashboard-settings' || context === 'dashboard-settings-write') {
      return 'The dashboard settings table is not available yet. Push supabase/migrations/20260514000500_dashboard_announcement.sql.';
    }

    if (context === 'staff') {
      return 'The staff permissions table is not available yet. Run supabase/05_member_roles_and_permissions.sql and then supabase/07_admin_editor_auth_policies.sql.';
    }

    if (context === 'events' || context === 'event-write') {
      return 'The events table is not available yet. Run supabase/08_events_calendar.sql.';
    }

    if (context === 'giveaways' || context === 'giveaway-write' || context === 'giveaway-entries' || context === 'giveaway-entry-write') {
      return 'The giveaway tables are not available yet. Push supabase/migrations/20260513000100_giveaways.sql first.';
    }

    if (context === 'models' || context === 'models-write') {
      return 'The YoModels schema is not available yet. Push supabase/migrations/20260514000100_yomodels_module.sql first.';
    }

    if (context === 'chat' || context === 'chat-write' || context === 'chat-delete') {
      return 'The chat schema is not available yet. Push supabase/migrations/20260513000400_chat_module.sql first.';
    }

    if (context === 'giveaway-winner') {
      return 'The giveaway winner picker is not available yet. Push supabase/migrations/20260513000100_giveaways.sql first.';
    }

    if (context === 'wishlist-comments') {
      return 'The gift comments table is not available yet. Run supabase/13_wishlist_image_uploads_and_comments.sql.';
    }

    if (context === 'member-invite-create') {
      return payloadSummary || 'The invite-code create endpoint could not be reached. Refresh the app and try again. If it still fails, the deployed frontend may be stale.';
    }

    if (context === 'member-invite-claim') {
      return payloadSummary || 'The invite-code claim endpoint could not be reached. Refresh the app and try again. If it still fails, the deployed frontend may be stale.';
    }

    if (context === 'wishlists' || context === 'wishlist-write' || context === 'member-link') {
      return 'The weekly wish list tables are not available yet. Run supabase/11_weekly_wishlists.sql, then supabase/13_wishlist_image_uploads_and_comments.sql.';
    }

    return 'The members table is not available yet. Run the schema SQL and confirm the table exists in Supabase.';
  }

  return payloadSummary || `Supabase returned ${response.status}.`;
}

function normalizeMockMembers(sourceMembers) {
  return sourceMembers.map((member, index) => normalizeMockMember(member, index));
}

function normalizeMockWishlists(sourceWishlists, memberDirectory = []) {
  return sourceWishlists.map((wishlist, index) => normalizeMockWishlist(wishlist, index, memberDirectory));
}

function normalizeMockYoModelsPosts(sourcePosts = []) {
  return sourcePosts.map((post, index) => normalizeMockYoModelsPost(post, index));
}

function normalizeMockChatMessages(sourceChatMessages, memberDirectory = []) {
  return sourceChatMessages.map((message, index) => normalizeMockChatMessage(message, index, memberDirectory));
}

function normalizeMockGiveaways(sourceGiveaways, memberDirectory = []) {
  return sourceGiveaways.map((giveaway, index) => normalizeMockGiveaway(giveaway, index, memberDirectory));
}

function normalizeMockChatMessage(message, index, memberDirectory = []) {
  const messageId = cleanText(message.id) || `chat-message-${index + 1}`;
  const senderName = cleanText(message.senderName || message.member || `Member ${index + 1}`);
  const matchedMember = findMemberByName(senderName, memberDirectory);

  return buildChatMessageModel(
    {
      id: messageId,
      channelKey: cleanText(message.channelKey || message.channel),
      senderMemberId: cleanText(message.senderMemberId || matchedMember?.id),
      senderName,
      senderInGameName: cleanText(message.senderInGameName || matchedMember?.inGameName),
      senderRole: cleanText(message.senderRole || matchedMember?.groupRole),
      messageText: cleanText(message.messageText || message.message),
      imageUrl: buildAssetUrl(message.imagePath || message.imageUrl),
      imagePath: cleanText(message.imagePath),
      imageMimeType: cleanText(message.imageMimeType),
      imageName: cleanText(message.imageName),
      createdAt: cleanText(message.createdAt) || new Date(Date.now() - (index + 1) * 35 * 60 * 1000).toISOString(),
      updatedAt: cleanText(message.updatedAt),
      createdByUserId: '',
      createdByEmail: '',
    },
    index,
  );
}

function normalizeMockWishlist(wishlist, index, memberDirectory = []) {
  const wishlistId = cleanText(wishlist.id) || `wishlist-${index + 1}`;
  const memberName = cleanText(wishlist.memberName || wishlist.member || `Wishlist ${index + 1}`);
  const matchedMember = findMemberByName(memberName, memberDirectory);
  const thankYouComments = Array.isArray(wishlist.thankYouTo)
    ? wishlist.thankYouTo.map((name, commentIndex) => ({
        id: `${wishlistId}-thanks-${commentIndex + 1}`,
        commenterName: cleanText(name),
        commentText: 'Gifted from this wish list.',
        didGift: true,
        createdAt: wishlist.updatedAt || '',
      }))
    : [];

  return buildWishlistModel(
    {
      id: wishlistId,
      memberId: cleanText(wishlist.memberId || matchedMember?.id),
      memberName,
      inGameName: cleanText(wishlist.inGameName || matchedMember?.inGameName),
      houseKey: cleanText(wishlist.houseKey || matchedMember?.houseKey),
      homeLink: sanitizeUrl(cleanText(wishlist.homeLink || matchedMember?.homeLink)),
      imageUrl: buildAssetUrl(wishlist.imagePath || wishlist.imageUrl),
      imagePath: cleanText(wishlist.imagePath),
      imageName: cleanText(wishlist.imageName),
      weekStartDate: cleanText(wishlist.weekStartDate) || getCurrentWishlistWeekStartIso(),
      weekLabel: cleanText(wishlist.weekLabel),
      summary: cleanText(wishlist.summary),
      statusNote: cleanText(wishlist.statusNote || wishlist.updateNote),
      thankYouNote: cleanText(wishlist.thankYouNote),
      thankYouTo: Array.isArray(wishlist.thankYouTo)
        ? wishlist.thankYouTo.map((name) => cleanText(name)).filter(Boolean)
        : [],
      lastUpdatedLabel: cleanText(wishlist.lastUpdatedLabel),
      isActive: wishlist.isActive !== false,
      items: normalizeWishlistItems(wishlist.items, wishlistId),
      comments: normalizeWishlistComments(wishlist.comments || thankYouComments, wishlistId),
      updatedAt: cleanText(wishlist.updatedAt),
      createdAt: cleanText(wishlist.createdAt),
    },
    index,
  );
}

function normalizeMockGiveaway(giveaway, index, memberDirectory = []) {
  const giveawayId = cleanText(giveaway.id) || `giveaway-${index + 1}`;
  const giverName = cleanText(giveaway.donor || giveaway.giverName || `Member ${index + 1}`);
  const winnerName = cleanText(giveaway.claimedBy || giveaway.winnerName);
  const matchedGiver = findMemberByName(giverName, memberDirectory);
  const matchedWinner = findMemberByName(winnerName, memberDirectory);
  const endsAt = winnerName
    ? new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000).toISOString();

  return buildGiveawayModel(
    {
      id: giveawayId,
      giverMemberId: cleanText(giveaway.giverMemberId || matchedGiver?.id),
      giverName,
      giverInGameName: cleanText(giveaway.giverInGameName || matchedGiver?.inGameName),
      giverHomeLink: sanitizeUrl(cleanText(giveaway.giverHomeLink || matchedGiver?.homeLink)),
      title: cleanText(giveaway.title) || `Giveaway ${index + 1}`,
      itemText: cleanText(giveaway.itemText || giveaway.note) || 'Giveaway details coming soon.',
      imageUrl: buildAssetUrl(giveaway.imagePath || giveaway.imageUrl),
      imagePath: cleanText(giveaway.imagePath),
      imageMimeType: cleanText(giveaway.imageMimeType),
      imageName: cleanText(giveaway.imageName),
      endsAt,
      winnerMemberId: cleanText(giveaway.winnerMemberId || matchedWinner?.id),
      winnerName,
      winnerInGameName: cleanText(giveaway.winnerInGameName || matchedWinner?.inGameName),
      winnerSelectedAt: winnerName ? new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() : '',
      isActive: giveaway.isActive !== false,
      entries: winnerName
        ? [
            {
              id: `${giveawayId}-entry-1`,
              entrantMemberId: cleanText(matchedWinner?.id),
              entrantName: winnerName,
              entrantInGameName: cleanText(matchedWinner?.inGameName),
              createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            },
          ]
        : [],
      createdAt: cleanText(giveaway.createdAt) || new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
      updatedAt: cleanText(giveaway.updatedAt) || new Date(Date.now() - (index + 1) * 45 * 60 * 1000).toISOString(),
      createdByUserId: '',
      createdByEmail: '',
    },
    index,
  );
}

function normalizeMockYoModelsPost(post, index) {
  const createdAt = cleanText(post.createdAt) || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString();

  return buildYoModelsPostModel(
    {
      id: cleanText(post.id) || `yomodels-post-${index + 1}`,
      themeTitle: cleanText(post.themeTitle),
      imageUrl: buildAssetUrl(post.imagePath || post.imageUrl),
      imagePath: cleanText(post.imagePath),
      imageMimeType: cleanText(post.imageMimeType),
      imageName: cleanText(post.imageName),
      postedAt: createdAt,
      updatedAt: cleanText(post.updatedAt),
      isActive: post.isActive !== false,
      createdByUserId: '',
      createdByEmail: GOTHICKA_ADMIN_EMAIL,
    },
    index,
  );
}

function normalizeMockEvents(sourceEvents) {
  return sourceEvents.map((calendarEvent, index) => normalizeMockEvent(calendarEvent, index));
}

function normalizeMockEvent(calendarEvent, index) {
  const title = cleanText(calendarEvent.title) || `Event ${index + 1}`;
  const eventTypeDetails = getEventTypeDetails(calendarEvent.eventType || calendarEvent.type);
  const eventDate = cleanText(calendarEvent.eventDate);
  const startTime = normalizeEventTime(calendarEvent.startTime);
  const endTime = normalizeEventTime(calendarEvent.endTime);
  const timezone = cleanText(calendarEvent.timezone) || DEFAULT_EVENT_TIMEZONE;

  return {
    id: cleanText(calendarEvent.id) || `event-${index + 1}`,
    title,
    eventType: eventTypeDetails.storedValue || EVENT_TYPE_DETAILS.special_event.label,
    eventTypeLabel: eventTypeDetails.label,
    typeIndicator: eventTypeDetails.indicator,
    typeIndicatorClass: eventTypeDetails.className,
    eventDate,
    startTime,
    endTime,
    timezone,
    whenLabel: cleanText(calendarEvent.when) || formatEventWhenLabel(eventDate, startTime, endTime, timezone),
    hostName: cleanText(calendarEvent.host || calendarEvent.hostName),
    hostMemberId: cleanText(calendarEvent.hostMemberId),
    createdByUserId: cleanText(calendarEvent.createdByUserId),
    createdByEmail: cleanText(calendarEvent.createdByEmail).toLowerCase(),
    locationText: cleanText(calendarEvent.locationText || calendarEvent.location),
    details: cleanText(calendarEvent.details || calendarEvent.note),
    yesCount: normalizeEventCount(calendarEvent.yes),
    maybeCount: normalizeEventCount(calendarEvent.maybe),
    noCount: normalizeEventCount(calendarEvent.no),
    isActive: calendarEvent.isActive !== false,
    sortOrder: index,
  };
}

function normalizeMockMember(member, index) {
  const facebookName = cleanText(member.facebookName || member.name) || `Member ${index + 1}`;
  const inGameName = cleanText(member.inGameName);
  const groupRole = normalizeGroupRole(member.groupRole);
  const playWindow = cleanText(member.playWindow);
  const notes = cleanText(member.notes || member.status);
  const birthdayRaw = cleanText(member.birthday);
  const birthdayParts = resolveBirthdayParts(birthdayRaw);

  return {
    id: cleanText(member.id) || createClientMemberId(facebookName),
    displayName: facebookName,
    facebookName,
    inGameName,
    secondaryName: inGameName ? `YoWorld: ${inGameName}` : 'YoWorld name not added yet.',
    homeLink: sanitizeUrl(cleanText(member.homeLink)),
    houseKey: cleanText(member.houseKey),
    birthdayRaw,
    birthdayLabel: birthdayRaw || 'Birthday not added',
    birthdayMonth: birthdayParts.birthdayMonth,
    birthdayDay: birthdayParts.birthdayDay,
    hasBirthday: Boolean(birthdayRaw),
    groupRole,
    roleLabel: formatGroupRoleLabel(groupRole),
    roleTagClass: getRoleTagClass(groupRole),
    statusText: notes || 'Member details coming soon.',
    notes,
    isActive: true,
    metaText: playWindow ? `Usually online: ${playWindow}` : 'Using mock member details.',
  };
}

function normalizeSupabaseMembers(rows) {
  return rows.map((row, index) => normalizeSupabaseMember(row, index));
}

function normalizeSupabaseWishlists(rows, itemRows, commentRows = []) {
  const itemsByWishlistId = new Map();
  const commentsByWishlistId = new Map();

  itemRows.forEach((row) => {
    const wishlistId = cleanText(row.wishlist_id);

    if (!wishlistId) {
      return;
    }

    const currentItems = itemsByWishlistId.get(wishlistId) || [];
    currentItems.push(row);
    itemsByWishlistId.set(wishlistId, currentItems);
  });

  commentRows.forEach((row) => {
    const wishlistId = cleanText(row.wishlist_id);

    if (!wishlistId) {
      return;
    }

    const currentComments = commentsByWishlistId.get(wishlistId) || [];
    currentComments.push(row);
    commentsByWishlistId.set(wishlistId, currentComments);
  });

  return rows.map((row, index) => normalizeSupabaseWishlist(
    row,
    index,
    itemsByWishlistId.get(cleanText(row.id)) || [],
    commentsByWishlistId.get(cleanText(row.id)) || [],
  ));
}

function normalizeSupabaseEvents(rows) {
  return rows.map((row, index) => normalizeSupabaseEvent(row, index));
}

function normalizeSupabaseGiveaways(rows, entryRows = []) {
  const entriesByGiveawayId = new Map();

  entryRows.forEach((row) => {
    const giveawayId = cleanText(row.giveaway_id);

    if (!giveawayId) {
      return;
    }

    const currentEntries = entriesByGiveawayId.get(giveawayId) || [];
    currentEntries.push(row);
    entriesByGiveawayId.set(giveawayId, currentEntries);
  });

  return rows.map((row, index) => normalizeSupabaseGiveaway(
    row,
    index,
    entriesByGiveawayId.get(cleanText(row.id)) || [],
  ));
}

function normalizeSupabaseYoModelsPosts(rows = []) {
  return rows.map((row, index) => normalizeSupabaseYoModelsPost(row, index));
}

function normalizeSupabaseChatMessages(rows) {
  return rows.map((row, index) => normalizeSupabaseChatMessage(row, index));
}

function normalizeSupabaseYoModelsPost(row, index) {
  return buildYoModelsPostModel(
    {
      id: cleanText(row.id) || `yomodels-live-${index + 1}`,
      themeTitle: cleanText(row.theme_title),
      imageUrl: cleanText(row.image_url),
      imagePath: cleanText(row.image_path),
      imageMimeType: cleanText(row.image_mime_type),
      imageName: cleanText(row.image_name),
      postedAt: cleanText(row.posted_at),
      updatedAt: cleanText(row.updated_at),
      isActive: row.is_active !== false,
      createdByUserId: cleanText(row.created_by_user_id),
      createdByEmail: cleanText(row.created_by_email).toLowerCase(),
    },
    index,
  );
}

function normalizeSupabaseChatMessage(row, index) {
  const fallbackMember = findMemberById(row.sender_member_id);

  return buildChatMessageModel(
    {
      id: cleanText(row.id) || `chat-live-${index + 1}`,
      channelKey: cleanText(row.channel_key),
      senderMemberId: cleanText(row.sender_member_id) || cleanText(fallbackMember?.id),
      senderName: cleanText(row.sender_name_snapshot || fallbackMember?.facebookName || fallbackMember?.displayName || `Member ${index + 1}`),
      senderInGameName: cleanText(row.sender_in_game_name_snapshot || fallbackMember?.inGameName),
      senderRole: cleanText(fallbackMember?.groupRole),
      messageText: cleanText(row.message_text),
      imageUrl: cleanText(row.image_url),
      imagePath: cleanText(row.image_path),
      imageMimeType: cleanText(row.image_mime_type),
      imageName: cleanText(row.image_name),
      createdAt: cleanText(row.created_at),
      updatedAt: cleanText(row.updated_at),
      createdByUserId: cleanText(row.created_by_user_id),
      createdByEmail: cleanText(row.created_by_email).toLowerCase(),
    },
    index,
  );
}

function normalizeSupabaseWishlist(row, index, itemRows, commentRows = []) {
  const fallbackMember = findMemberById(row.member_id);

  return buildWishlistModel(
    {
      id: cleanText(row.id) || `wishlist-live-${index + 1}`,
      memberId: cleanText(row.member_id) || cleanText(fallbackMember?.id),
      memberName: cleanText(row.member_name_snapshot || fallbackMember?.facebookName || fallbackMember?.displayName || `Wishlist ${index + 1}`),
      inGameName: cleanText(row.member_in_game_name_snapshot || fallbackMember?.inGameName),
      houseKey: cleanText(row.house_key_snapshot || fallbackMember?.houseKey),
      homeLink: buildHomeLink(cleanText(row.house_key_snapshot || fallbackMember?.houseKey)),
      imageUrl: cleanText(row.board_image_url),
      imagePath: cleanText(row.board_image_path),
      imageMimeType: cleanText(row.board_image_mime_type),
      imageName: cleanText(row.board_image_name),
      weekStartDate: cleanText(row.week_start_date),
      summary: cleanText(row.summary),
      statusNote: cleanText(row.status_note),
      thankYouNote: cleanText(row.thank_you_note),
      isActive: row.is_active !== false,
      items: normalizeWishlistItems(itemRows, cleanText(row.id) || `wishlist-live-${index + 1}`),
      comments: normalizeWishlistComments(commentRows, cleanText(row.id) || `wishlist-live-${index + 1}`),
      updatedAt: cleanText(row.updated_at),
      createdAt: cleanText(row.created_at),
    },
    index,
  );
}

function normalizeSupabaseEvent(row, index) {
  const eventTypeDetails = getEventTypeDetails(row.event_type);
  const eventDate = cleanText(row.event_date);
  const startTime = normalizeEventTime(row.start_time);
  const endTime = normalizeEventTime(row.end_time);
  const timezone = cleanText(row.timezone) || DEFAULT_EVENT_TIMEZONE;

  return {
    id: cleanText(row.id) || `event-${index + 1}`,
    title: cleanText(row.title) || `Event ${index + 1}`,
    eventType: eventTypeDetails.storedValue || EVENT_TYPE_DETAILS.special_event.label,
    eventTypeLabel: eventTypeDetails.label,
    typeIndicator: eventTypeDetails.indicator,
    typeIndicatorClass: eventTypeDetails.className,
    eventDate,
    startTime,
    endTime,
    timezone,
    whenLabel: formatEventWhenLabel(eventDate, startTime, endTime, timezone),
    hostName: cleanText(row.host_name),
    hostMemberId: cleanText(row.host_member_id),
    createdByUserId: cleanText(row.created_by_user_id),
    createdByEmail: cleanText(row.created_by_email).toLowerCase(),
    locationText: cleanText(row.location_text),
    details: cleanText(row.details),
    yesCount: normalizeEventCount(row.yes_count),
    maybeCount: normalizeEventCount(row.maybe_count),
    noCount: normalizeEventCount(row.no_count),
    isActive: row.is_active !== false,
    sortOrder: index,
  };
}

function normalizeSupabaseGiveaway(row, index, entryRows = []) {
  const fallbackGiver = findMemberById(row.giver_member_id);
  const fallbackWinner = findMemberById(row.winner_member_id);

  return buildGiveawayModel(
    {
      id: cleanText(row.id) || `giveaway-live-${index + 1}`,
      giverMemberId: cleanText(row.giver_member_id),
      giverName: cleanText(row.giver_name_snapshot || fallbackGiver?.facebookName || fallbackGiver?.displayName || `Member ${index + 1}`),
      giverInGameName: cleanText(row.giver_in_game_name_snapshot || fallbackGiver?.inGameName),
      giverHomeLink: buildHomeLink(cleanText(fallbackGiver?.houseKey)),
      title: cleanText(row.title) || `Giveaway ${index + 1}`,
      itemText: cleanText(row.item_text),
      imageUrl: cleanText(row.image_url),
      imagePath: cleanText(row.image_path),
      imageMimeType: cleanText(row.image_mime_type),
      imageName: cleanText(row.image_name),
      endsAt: cleanText(row.ends_at),
      winnerMemberId: cleanText(row.winner_member_id),
      winnerName: cleanText(row.winner_name_snapshot || fallbackWinner?.facebookName || fallbackWinner?.displayName),
      winnerInGameName: cleanText(row.winner_in_game_name_snapshot || fallbackWinner?.inGameName),
      winnerSelectedAt: cleanText(row.winner_selected_at),
      isActive: row.is_active !== false,
      entries: entryRows,
      createdAt: cleanText(row.created_at),
      updatedAt: cleanText(row.updated_at),
      createdByUserId: cleanText(row.created_by_user_id),
      createdByEmail: cleanText(row.created_by_email).toLowerCase(),
    },
    index,
  );
}

function normalizeSupabaseMember(row, index) {
  const facebookName = cleanText(row.facebook_name);
  const inGameName = cleanText(row.in_game_name);
  const displayName = facebookName || inGameName || `Member ${index + 1}`;
  const birthdayRaw = cleanText(row.birthday_raw);
  const birthdayParts = resolveBirthdayParts(birthdayRaw, row.birthday_month, row.birthday_day);
  const notes = cleanText(row.notes);
  const houseKey = cleanText(row.house_key);
  const homeLink = buildHomeLink(houseKey);
  const groupRole = normalizeGroupRole(row.group_role);

  return {
    id: cleanText(row.id) || createClientMemberId(displayName),
    displayName,
    facebookName: facebookName || displayName,
    inGameName,
    secondaryName: inGameName ? `YoWorld: ${inGameName}` : 'YoWorld name not added yet.',
    homeLink,
    houseKey,
    birthdayRaw,
    birthdayLabel: formatBirthdayLabel(birthdayRaw, birthdayParts.birthdayMonth, birthdayParts.birthdayDay),
    birthdayMonth: birthdayParts.birthdayMonth,
    birthdayDay: birthdayParts.birthdayDay,
    hasBirthday: Boolean(birthdayRaw || (birthdayParts.birthdayMonth && birthdayParts.birthdayDay)),
    groupRole,
    roleLabel: formatGroupRoleLabel(groupRole),
    roleTagClass: getRoleTagClass(groupRole),
    statusText:
      notes ||
      (groupRole !== 'member'
        ? `Role: ${formatGroupRoleLabel(groupRole)}`
        : homeLink
          ? 'Home link ready for visits and gifts.'
          : 'Home link not added yet.'),
    metaText: getMemberMetaText({ notes, homeLink, groupRole }),
    notes,
    isActive: row.is_active !== false,
  };
}

function getMemberMetaText({ notes, homeLink, groupRole }) {
  if (notes) {
    return notes;
  }

  if (groupRole && groupRole !== 'member') {
    return `Group role: ${formatGroupRoleLabel(groupRole)}`;
  }

  if (!homeLink) {
    return 'Home link not added yet.';
  }

  return '';
}

function normalizeEventTypeToken(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getPresetEventTypeKey(value) {
  switch (normalizeEventTypeToken(value)) {
    case 'birthday_party':
      return 'birthday_party';
    case 'meet_up':
    case 'meetup':
    case 'hangout':
      return 'meet_up';
    case 'game':
      return 'game';
    case 'special_event':
    case 'party':
    case 'other':
    case 'wishlist':
      return 'special_event';
    case CUSTOM_EVENT_TYPE_KEY:
      return CUSTOM_EVENT_TYPE_KEY;
    case '':
      return 'special_event';
    default:
      return CUSTOM_EVENT_TYPE_KEY;
  }
}

function formatCustomEventTypeLabel(value) {
  return cleanText(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function getCustomEventTypeIndicator(value) {
  const label = formatCustomEventTypeLabel(value);
  const match = label.match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : '*';
}

function getEventTypeDetails(value) {
  const rawValue = cleanText(value);
  const presetKey = getPresetEventTypeKey(rawValue);

  if (presetKey !== CUSTOM_EVENT_TYPE_KEY) {
    const preset = EVENT_TYPE_DETAILS[presetKey];
    return {
      id: presetKey,
      label: preset.label,
      indicator: preset.indicator,
      className: preset.className,
      isCustom: false,
      storedValue: preset.label,
    };
  }

  const label = formatCustomEventTypeLabel(rawValue);

  return {
    id: CUSTOM_EVENT_TYPE_KEY,
    label: label || 'Custom Event',
    indicator: getCustomEventTypeIndicator(label),
    className: 'event-type-icon--custom',
    isCustom: true,
    storedValue: label,
  };
}

function normalizeEventType(value) {
  return getEventTypeDetails(value).id;
}

function formatEventTypeLabel(eventType) {
  return getEventTypeDetails(eventType).label;
}

function getEventTypeIndicator(eventType) {
  return getEventTypeDetails(eventType).indicator;
}

function getEventTypeIndicatorClass(eventType) {
  return getEventTypeDetails(eventType).className;
}

function resolveSubmittedEventType(selectedEventType, customEventType) {
  if (getPresetEventTypeKey(selectedEventType) === CUSTOM_EVENT_TYPE_KEY) {
    const customLabel = formatCustomEventTypeLabel(customEventType);

    if (!customLabel) {
      throw new Error('Add a custom event type name or choose one of the built-in event types.');
    }

    return customLabel;
  }

  return getEventTypeDetails(selectedEventType).storedValue || EVENT_TYPE_DETAILS.special_event.label;
}

function formatEventWhenLabel(eventDate, startTime, endTime, timezone) {
  const dateLabel = formatEventDateLabel(eventDate);

  if (!dateLabel) {
    return 'Date coming soon';
  }

  if (!startTime) {
    return `${dateLabel} G�� All day`;
  }

  const startLabel = formatTimeLabel(startTime);
  const endLabel = formatTimeLabel(endTime);
  const timezoneLabel = cleanText(timezone);

  if (endLabel) {
    return `${dateLabel} G�� ${startLabel} - ${endLabel}${timezoneLabel ? ` ${timezoneLabel}` : ''}`;
  }

  return `${dateLabel} G�� ${startLabel}${timezoneLabel ? ` ${timezoneLabel}` : ''}`;
}

function formatEventDateLabel(eventDate) {
  const value = cleanText(eventDate);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return '';
  }

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  const date = new Date(year, month - 1, day);

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

function formatMonthYearLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getCurrentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthKeyFromValue(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return getCurrentMonthKey();
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return getCurrentMonthKey();
  }

  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabelFromKey(monthKey) {
  const match = cleanText(monthKey).match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return 'Current Month';
  }

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  return formatMonthYearLabel(year, monthIndex);
}

function parseIsoDateParts(value) {
  const match = cleanText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return {
    year,
    month,
    monthIndex: month - 1,
    day,
  };
}

function formatTimeLabel(value) {
  const normalized = normalizeEventTime(value);

  if (!normalized) {
    return '';
  }

  const [hours, minutes] = normalized.split(':').map((part) => Number.parseInt(part, 10));
  const date = new Date(2000, 0, 1, hours, minutes);

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeEventTime(value) {
  const text = cleanText(value);

  if (!text) {
    return '';
  }

  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return '';
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return '';
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function compareEvents(left, right) {
  const leftDate = cleanText(left.eventDate) || '9999-12-31';
  const rightDate = cleanText(right.eventDate) || '9999-12-31';

  if (leftDate !== rightDate) {
    return leftDate.localeCompare(rightDate);
  }

  const leftTime = normalizeEventTime(left.startTime) || '23:59';
  const rightTime = normalizeEventTime(right.startTime) || '23:59';

  if (leftTime !== rightTime) {
    return leftTime.localeCompare(rightTime);
  }

  return left.title.localeCompare(right.title) || left.sortOrder - right.sortOrder;
}

function compareCalendarItems(left, right) {
  if (Boolean(left.isBirthday) !== Boolean(right.isBirthday)) {
    return left.isBirthday ? -1 : 1;
  }

  return compareEvents(left, right);
}

function compareWishlists(left, right) {
  if (left.isActive !== right.isActive) {
    return left.isActive ? -1 : 1;
  }

  const leftWeekStart = cleanText(left.weekStartDate) || '0000-00-00';
  const rightWeekStart = cleanText(right.weekStartDate) || '0000-00-00';

  if (leftWeekStart !== rightWeekStart) {
    return rightWeekStart.localeCompare(leftWeekStart);
  }

  return left.memberName.localeCompare(right.memberName) || left.sortOrder - right.sortOrder;
}

function compareGiveaways(left, right) {
  if (left.isOpen !== right.isOpen) {
    return left.isOpen ? -1 : 1;
  }

  if (left.hasWinner !== right.hasWinner) {
    return left.hasWinner ? 1 : -1;
  }

  const leftEndsAt = cleanText(left.endsAt) || '9999-12-31T23:59:59.999Z';
  const rightEndsAt = cleanText(right.endsAt) || '9999-12-31T23:59:59.999Z';

  if (leftEndsAt !== rightEndsAt) {
    return leftEndsAt.localeCompare(rightEndsAt);
  }

  const leftCreatedAt = cleanText(left.createdAt);
  const rightCreatedAt = cleanText(right.createdAt);

  if (leftCreatedAt !== rightCreatedAt) {
    return rightCreatedAt.localeCompare(leftCreatedAt);
  }

  return left.title.localeCompare(right.title) || left.sortOrder - right.sortOrder;
}

function compareYoModelsPosts(left, right) {
  const leftPostedAt = cleanText(left.postedAt) || '0000-00-00T00:00:00.000Z';
  const rightPostedAt = cleanText(right.postedAt) || '0000-00-00T00:00:00.000Z';

  if (leftPostedAt !== rightPostedAt) {
    return rightPostedAt.localeCompare(leftPostedAt);
  }

  return left.sortOrder - right.sortOrder;
}

function compareChatMessages(left, right) {
  const leftCreatedAt = cleanText(left.createdAt) || '0000-00-00T00:00:00.000Z';
  const rightCreatedAt = cleanText(right.createdAt) || '0000-00-00T00:00:00.000Z';

  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt.localeCompare(rightCreatedAt);
  }

  return left.sortOrder - right.sortOrder;
}

function normalizeWishlistItems(items, parentId = '') {
  return Array.isArray(items)
    ? items
        .map((item, index) => normalizeWishlistItem(item, index, parentId))
        .filter((item) => Boolean(item.name || item.imageUrl || item.sourceUrl || item.receivedFrom || item.isReceived))
        .sort((left, right) => left.sortOrder - right.sortOrder)
    : [];
}

function normalizeWishlistItem(item, index, parentId = '') {
  return {
    id: cleanText(item?.id) || `${parentId || 'wishlist'}-item-${index + 1}`,
    name: cleanText(item?.item_name || item?.name),
    imageUrl: buildAssetUrl(item?.item_image_url || item?.imageUrl),
    sourceUrl: sanitizeUrl(cleanText(item?.item_source_url || item?.sourceUrl)),
    availabilityStatus: normalizeWishlistAvailability(item?.availability_status || item?.availabilityStatus),
    isReceived: Boolean(item?.is_received ?? item?.isReceived),
    receivedFrom: cleanText(item?.received_from || item?.receivedFrom),
    sortOrder: parseNullableInt(item?.sort_order || item?.sortOrder) || index + 1,
  };
}

function normalizeWishlistComments(comments, parentId = '') {
  return Array.isArray(comments)
    ? comments
        .map((comment, index) => normalizeWishlistComment(comment, index, parentId))
        .filter((comment) => Boolean(comment.commenterName && (comment.commentText || comment.didGift)))
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.sortOrder - right.sortOrder)
    : [];
}

function normalizeGiveawayEntries(entries, parentId = '') {
  return Array.isArray(entries)
    ? entries
        .map((entry, index) => normalizeGiveawayEntry(entry, index, parentId))
        .filter((entry) => Boolean(entry.entrantName))
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.sortOrder - right.sortOrder)
    : [];
}

function normalizeWishlistComment(comment, index, parentId = '') {
  const createdAt = cleanText(comment?.created_at || comment?.createdAt);

  return {
    id: cleanText(comment?.id) || `${parentId || 'wishlist'}-comment-${index + 1}`,
    commenterName: cleanText(comment?.commenter_name || comment?.commenterName) || 'Someone',
    commentText: cleanText(comment?.comment_text || comment?.commentText),
    didGift: Boolean(comment?.did_gift ?? comment?.didGift ?? true),
    createdAt,
    createdLabel: formatWishlistCommentCreatedLabel(createdAt),
    sortOrder: index,
  };
}

function normalizeGiveawayEntry(entry, index, parentId = '') {
  const createdAt = cleanText(entry?.created_at || entry?.createdAt);

  return {
    id: cleanText(entry?.id) || `${parentId || 'giveaway'}-entry-${index + 1}`,
    giveawayId: cleanText(entry?.giveaway_id || entry?.giveawayId || parentId),
    entrantMemberId: cleanText(entry?.entrant_member_id || entry?.entrantMemberId),
    entrantName: cleanText(entry?.entrant_name_snapshot || entry?.entrantName) || 'Member',
    entrantInGameName: cleanText(entry?.entrant_in_game_name_snapshot || entry?.entrantInGameName),
    createdByUserId: cleanText(entry?.created_by_user_id || entry?.createdByUserId),
    createdByEmail: cleanText(entry?.created_by_email || entry?.createdByEmail).toLowerCase(),
    createdAt,
    createdLabel: formatGiveawayEntryCreatedLabel(createdAt),
    sortOrder: index,
  };
}

function buildWishlistModel(values, index) {
  const items = normalizeWishlistItems(values.items, values.id);
  const comments = normalizeWishlistComments(values.comments, values.id);
  const thankYouTo = Array.isArray(values.thankYouTo)
    ? [...new Set(values.thankYouTo.map((name) => cleanText(name)).filter(Boolean))]
    : [];
  const giftCommenters = comments
    .filter((comment) => comment.didGift)
    .map((comment) => comment.commenterName)
    .filter(Boolean);
  const thanksPeople = [...new Set([...thankYouTo, ...items.map((item) => item.receivedFrom).filter(Boolean), ...giftCommenters])];
  const weekStartDate = cleanText(values.weekStartDate) || getCurrentWishlistWeekStartIso();
  const homeLink = sanitizeUrl(cleanText(values.homeLink)) || buildHomeLink(values.houseKey);
  const totalItems = items.length;
  const outOfStoreCount = items.filter((item) => item.availabilityStatus === 'out_of_store').length;
  const receivedCount = items.filter((item) => item.isReceived).length;
  const giftedCommentCount = comments.filter((comment) => comment.didGift).length;
  const thankYouSummary = thanksPeople.length
    ? `${thanksPeople.length} ${thanksPeople.length === 1 ? 'gifter has' : 'gifters have'} checked in`
    : cleanText(values.thankYouNote)
      ? 'Public thank-you note posted'
      : '';

  return {
    id: cleanText(values.id) || `wishlist-${index + 1}`,
    memberId: cleanText(values.memberId),
    memberName: cleanText(values.memberName) || `Wishlist ${index + 1}`,
    inGameName: cleanText(values.inGameName),
    houseKey: cleanText(values.houseKey),
    homeLink,
    imageUrl: buildAssetUrl(values.imageUrl || values.boardImageUrl),
    imagePath: cleanText(values.imagePath || values.boardImagePath),
    imageName: cleanText(values.imageName || values.boardImageName),
    imageMimeType: cleanText(values.imageMimeType || values.boardImageMimeType),
    weekStartDate,
    weekLabel: cleanText(values.weekLabel) || formatWishlistWeekLabel(weekStartDate),
    summary: cleanText(values.summary) || 'Weekly wishlist for the current Sunday reset.',
    statusNote: cleanText(values.statusNote) || 'Wishlist posted for this week.',
    updateNote: cleanText(values.statusNote) || 'Wishlist posted for this week.',
    thankYouNote: cleanText(values.thankYouNote),
    thankYouTo,
    thankYouSummary,
    lastUpdatedLabel: cleanText(values.lastUpdatedLabel) || formatWishlistLastUpdatedLabel(values.updatedAt || values.createdAt),
    updatedAt: cleanText(values.updatedAt),
    createdAt: cleanText(values.createdAt),
    isActive: values.isActive !== false,
    items,
    comments,
    commentCount: comments.length,
    giftedCommentCount,
    totalItems,
    outOfStoreCount,
    receivedCount,
    sortOrder: index,
  };
}

function buildGiveawayModel(values, index) {
  const entries = normalizeGiveawayEntries(values.entries, values.id);
  const title = cleanText(values.title) || `Giveaway ${index + 1}`;
  const giverName = cleanText(values.giverName) || `Member ${index + 1}`;
  const giverHomeLink = sanitizeUrl(cleanText(values.giverHomeLink));
  const endsAt = cleanText(values.endsAt);
  const winnerSelectedAt = cleanText(values.winnerSelectedAt);
  const winnerName = cleanText(values.winnerName);
  const isActive = values.isActive !== false;
  const isOpen = isGiveawayOpen({ isActive, endsAt, winnerSelectedAt });
  const hasWinner = Boolean(winnerName && winnerSelectedAt);
  const status = getGiveawayStatusPresentation({ isActive, isOpen, hasWinner });

  return {
    id: cleanText(values.id) || `giveaway-${index + 1}`,
    giverMemberId: cleanText(values.giverMemberId),
    giverName,
    giverInGameName: cleanText(values.giverInGameName),
    giverHomeLink,
    title,
    itemText: cleanText(values.itemText) || 'Giveaway details coming soon.',
    imageUrl: buildAssetUrl(values.imageUrl),
    imagePath: cleanText(values.imagePath),
    imageMimeType: cleanText(values.imageMimeType),
    imageName: cleanText(values.imageName),
    endsAt,
    endsLabel: formatGiveawayEndsLabel(endsAt),
    winnerMemberId: cleanText(values.winnerMemberId),
    winnerName,
    winnerInGameName: cleanText(values.winnerInGameName),
    winnerSelectedAt,
    winnerSelectedLabel: formatGiveawayWinnerLabel(winnerSelectedAt),
    isActive,
    isOpen,
    hasWinner,
    statusLabel: status.label,
    statusTagClass: status.className,
    entries,
    entryCount: entries.length,
    createdAt: cleanText(values.createdAt),
    updatedAt: cleanText(values.updatedAt),
    createdByUserId: cleanText(values.createdByUserId),
    createdByEmail: cleanText(values.createdByEmail).toLowerCase(),
    sortOrder: index,
  };
}

function buildYoModelsPostModel(values, index) {
  const postedAt = cleanText(values.postedAt) || new Date().toISOString();
  const monthKey = getMonthKeyFromValue(postedAt);

  return {
    id: cleanText(values.id) || `yomodels-post-${index + 1}`,
    themeTitle: cleanText(values.themeTitle),
    imageUrl: buildAssetUrl(values.imageUrl),
    imagePath: cleanText(values.imagePath),
    imageMimeType: cleanText(values.imageMimeType),
    imageName: cleanText(values.imageName),
    postedAt,
    updatedAt: cleanText(values.updatedAt),
    isActive: values.isActive !== false,
    createdByUserId: cleanText(values.createdByUserId),
    createdByEmail: cleanText(values.createdByEmail).toLowerCase(),
    postedLabel: formatYoModelsPostedLabel(postedAt),
    monthKey,
    monthLabel: formatMonthLabelFromKey(monthKey),
    sortOrder: index,
  };
}

function buildChatMessageModel(values, index) {
  const senderRole = normalizeGroupRole(values.senderRole);

  return {
    id: cleanText(values.id) || `chat-message-${index + 1}`,
    channelKey: normalizeChatChannelKey(values.channelKey),
    channelLabel: getChatChannelDefinition(values.channelKey).label,
    senderMemberId: cleanText(values.senderMemberId),
    senderName: cleanText(values.senderName) || `Member ${index + 1}`,
    senderInGameName: cleanText(values.senderInGameName),
    senderRole,
    senderRoleLabel: formatGroupRoleLabel(senderRole),
    senderRoleTagClass: getRoleTagClass(senderRole),
    messageText: cleanText(values.messageText),
    imageUrl: buildAssetUrl(values.imageUrl),
    imagePath: cleanText(values.imagePath),
    imageMimeType: cleanText(values.imageMimeType),
    imageName: cleanText(values.imageName),
    createdAt: cleanText(values.createdAt),
    updatedAt: cleanText(values.updatedAt),
    createdLabel: formatChatMessageCreatedLabel(values.createdAt),
    createdByUserId: cleanText(values.createdByUserId),
    createdByEmail: cleanText(values.createdByEmail).toLowerCase(),
    sortOrder: index,
  };
}

function summarizeWishlistItems(items) {
  const normalizedItems = Array.isArray(items) ? items : [];

  return normalizedItems.reduce(
    (summary, item) => {
      const hasContent = Boolean(cleanText(item?.name) || cleanText(item?.imageUrl) || cleanText(item?.sourceUrl) || cleanText(item?.receivedFrom) || item?.isReceived);

      if (!hasContent) {
        return summary;
      }

      return {
        total: summary.total + 1,
        outOfStore: summary.outOfStore + (normalizeWishlistAvailability(item?.availabilityStatus) === 'out_of_store' ? 1 : 0),
        received: summary.received + (item?.isReceived ? 1 : 0),
      };
    },
    { total: 0, outOfStore: 0, received: 0 },
  );
}

function normalizeWishlistAvailability(value) {
  return cleanText(value).toLowerCase() === 'out_of_store' ? 'out_of_store' : 'in_store';
}

function formatWishlistAvailabilityLabel(value) {
  return normalizeWishlistAvailability(value) === 'out_of_store' ? 'Out of Store' : 'In Store';
}

function getCurrentWishlistWeekStartIso(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: WISHLIST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(now);
  const year = Number.parseInt(parts.find((part) => part.type === 'year')?.value || '', 10);
  const month = Number.parseInt(parts.find((part) => part.type === 'month')?.value || '', 10);
  const day = Number.parseInt(parts.find((part) => part.type === 'day')?.value || '', 10);
  const weekdayToken = cleanText(parts.find((part) => part.type === 'weekday')?.value).slice(0, 3).toLowerCase();
  const weekdayIndex = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(weekdayToken);
  const etDate = new Date(Date.UTC(year, month - 1, day));

  etDate.setUTCDate(etDate.getUTCDate() - Math.max(weekdayIndex, 0));

  return `${etDate.getUTCFullYear()}-${String(etDate.getUTCMonth() + 1).padStart(2, '0')}-${String(etDate.getUTCDate()).padStart(2, '0')}`;
}

function isWishlistCurrentWeek(weekStartDate) {
  return cleanText(weekStartDate) === getCurrentWishlistWeekStartIso();
}

function formatWishlistWeekLabel(weekStartDate) {
  const parts = parseIsoDateParts(weekStartDate);

  if (!parts) {
    return 'Resets Sunday ET';
  }

  const date = new Date(parts.year, parts.monthIndex, parts.day);
  const label = date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  return `Week of ${label} G�� Sunday ET reset`;
}

function formatWishlistLastUpdatedLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'Updated this week';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Updated this week';
  }

  return `Updated ${parsedDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
}

function formatWishlistCommentCreatedLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'Just now';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Just now';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createDefaultGiveawayEndsAtLocal(now = new Date()) {
  const next = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  next.setMinutes(0, 0, 0);

  if (next.getHours() < 18) {
    next.setHours(18);
  }

  return formatDateTimeLocalInput(next);
}

function formatIsoDateTimeLocalInput(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return '';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return formatDateTimeLocalInput(parsedDate);
}

function formatDateTimeLocalInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseDateTimeLocalInputToIso(value) {
  const normalizedValue = cleanText(value);

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedValue)) {
    return '';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString();
}

function formatGiveawayEndsLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'End time not set';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'End time not set';
  }

  return parsedDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatGiveawayWinnerLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return '';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return `Winner posted ${parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} G�� Giveaway closed`;
}

function formatGiveawayEntryCreatedLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'Entry saved';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Entry saved';
  }

  return `Entered ${parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function formatChatMessageCreatedLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'Just now';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Just now';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatYoModelsPostedLabel(value) {
  const normalizedValue = cleanText(value);

  if (!normalizedValue) {
    return 'Posted just now';
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Posted just now';
  }

  return `Posted ${parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function formatChatMessageText(value) {
  return escapeHtml(cleanText(value)).replace(/\n/g, '<br>');
}

function groupYoModelsPostsByMonth(posts = []) {
  const groups = new Map();

  posts.forEach((post) => {
    const monthKey = cleanText(post.monthKey) || getCurrentMonthKey();
    const currentGroup = groups.get(monthKey) || {
      monthKey,
      monthLabel: formatMonthLabelFromKey(monthKey),
      posts: [],
    };
    currentGroup.posts.push(post);
    groups.set(monthKey, currentGroup);
  });

  const currentMonthKey = getCurrentMonthKey();

  return [...groups.values()]
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))
    .map((group) => ({
      ...group,
      posts: [...group.posts].sort(compareYoModelsPosts),
      isCurrentMonth: group.monthKey === currentMonthKey,
    }));
}

function isGiveawayOpen({ isActive, endsAt, winnerSelectedAt }) {
  if (!isActive || cleanText(winnerSelectedAt)) {
    return false;
  }

  const parsedDate = new Date(cleanText(endsAt));
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() > Date.now();
}

function getGiveawayStatusPresentation({ isActive, isOpen, hasWinner }) {
  if (hasWinner) {
    return {
      label: 'Winner posted',
      className: 'tag--giveaway-winner',
    };
  }

  if (isOpen) {
    return {
      label: 'Open',
      className: 'tag--muted',
    };
  }

  return {
    label: isActive ? 'Ended' : 'Closed',
    className: 'tag--giveaway-ended',
  };
}

function formatGiveawayComposerIdentity(member) {
  if (!member) {
    return 'Claim your member invite first';
  }

  const memberName = cleanText(member.facebookName || member.displayName);
  return member.inGameName ? `${memberName} G�� YoWorld: ${member.inGameName}` : memberName;
}

function formatGiveawayGiverLine(giveaway) {
  return giveaway.giverInGameName
    ? `${giveaway.giverName} G�� YoWorld: ${giveaway.giverInGameName}`
    : giveaway.giverName;
}

function normalizeChatChannelKey(value) {
  const normalizedValue = cleanText(value).toLowerCase();
  return CHAT_CHANNELS.some((channel) => channel.key === normalizedValue) ? normalizedValue : CHAT_CHANNELS[0].key;
}

function getChatChannelDefinition(value) {
  const normalizedValue = normalizeChatChannelKey(value);
  return CHAT_CHANNELS.find((channel) => channel.key === normalizedValue) || CHAT_CHANNELS[0];
}

function buildGiveawayEntrantExportText(giveaway) {
  return giveaway.entries
    .map((entry) => entry.entrantInGameName ? `${entry.entrantName} (${entry.entrantInGameName})` : entry.entrantName)
    .join('\n');
}

async function copyTextToClipboard(text) {
  const value = cleanText(text);

  if (!value) {
    throw new Error('There was nothing to copy.');
  }

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = value;
  helper.setAttribute('readonly', 'readonly');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  helper.setSelectionRange(0, helper.value.length);

  try {
    const didCopy = document.execCommand('copy');

    if (!didCopy) {
      throw new Error('Could not access the clipboard.');
    }
  } finally {
    document.body.removeChild(helper);
  }
}

function normalizeEventCount(value) {
  const parsed = Number.parseInt(value ?? 0, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function normalizeCountInput(value) {
  const text = cleanText(value);

  if (!text) {
    return 0;
  }

  const parsed = Number.parseInt(text, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error('Event RSVP counts must be zero or greater.');
  }

  return parsed;
}

function buildAssetUrl(value) {
  const rawValue = cleanText(value);

  if (!rawValue) {
    return '';
  }

  try {
    return new URL(rawValue, window.location.href).href;
  } catch {
    return '';
  }
}

function getDefaultEventDescription(eventType) {
  switch (normalizeEventType(eventType)) {
    case 'birthday_party':
      return 'A shared birthday party event for the group.';
    case 'game':
      return 'A game session for the group.';
    case 'meet_up':
      return 'A meet-up for the group to gather in game.';
    case 'special_event':
      return 'A shared special event for the group.';
    case CUSTOM_EVENT_TYPE_KEY:
    default:
      return 'A shared event for the group.';
  }
}

function findMemberByName(value, members = getMembers()) {
  const lookup = cleanText(value).toLowerCase();

  if (!lookup) {
    return null;
  }

  return members.find((member) => {
    return [member.facebookName, member.displayName, member.inGameName]
      .map((name) => cleanText(name).toLowerCase())
      .includes(lookup);
  }) || null;
}

function findMemberById(memberId) {
  const normalizedMemberId = cleanText(memberId);

  if (!normalizedMemberId) {
    return null;
  }

  return getMembers().find((member) => cleanText(member.id) === normalizedMemberId) || null;
}

function getLinkedEventMember() {
  return getLinkedWishlistMember();
}

function getEventEditorFormState() {
  const linkedMember = getLinkedEventMember();
  const canKeepCustomHost = canManageEvents();

  if (canKeepCustomHost || !linkedMember) {
    return state.admin.eventForm;
  }

  return {
    ...state.admin.eventForm,
    hostName: cleanText(state.admin.eventForm.hostName) || cleanText(linkedMember.facebookName || linkedMember.displayName),
  };
}

function scheduleScrollTo(selector) {
  window.requestAnimationFrame(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function normalizeGroupRole(value) {
  const normalized = cleanText(value).toLowerCase().replace(/[-\s]+/g, '_');

  switch (normalized) {
    case 'admin':
    case 'event_planner':
    case 'moderator':
    case 'helper':
      return normalized;
    case '':
    case 'member':
    default:
      return 'member';
  }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanText(value));
}

function formatGroupRoleLabel(role) {
  switch (normalizeGroupRole(role)) {
    case 'admin':
      return 'Admin';
    case 'event_planner':
      return 'Event Planner';
    case 'moderator':
      return 'Moderator';
    case 'helper':
      return 'Helper';
    case 'member':
    default:
      return 'Member';
  }
}

function getRoleTagClass(role) {
  switch (normalizeGroupRole(role)) {
    case 'admin':
      return 'tag--role-admin';
    case 'event_planner':
      return 'tag--role-event';
    case 'moderator':
      return 'tag--role-moderator';
    case 'helper':
      return 'tag--role-helper';
    case 'member':
    default:
      return 'tag--muted';
  }
}

function buildHomeLink(houseKey) {
  const normalizedKey = cleanText(houseKey);

  if (!normalizedKey) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedKey)) {
    return sanitizeUrl(normalizedKey);
  }

  if (/^APKitchen-/i.test(normalizedKey)) {
    return sanitizeUrl(`https://apps.facebook.com/playyoworld/?d=${encodeURIComponent(normalizedKey)}`);
  }

  return sanitizeUrl(`https://yoworld.com/?d=${encodeURIComponent(normalizedKey)}`);
}

function formatBirthdayLabel(birthdayRaw, birthdayMonth, birthdayDay) {
  const rawValue = cleanText(birthdayRaw);

  if (rawValue) {
    return rawValue;
  }

  if (birthdayMonth && birthdayDay) {
    return formatMonthDay(birthdayMonth, birthdayDay);
  }

  return 'Birthday not added';
}

function formatMonthDay(month, day) {
  const safeMonth = parseNullableInt(month);
  const safeDay = parseNullableInt(day);

  if (!safeMonth || !safeDay) {
    return 'Birthday not added';
  }

  const date = new Date(2000, safeMonth - 1, safeDay);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function resolveBirthdayParts(birthdayRaw, birthdayMonth = null, birthdayDay = null) {
  const parsedMonth = parseNullableInt(birthdayMonth);
  const parsedDay = parseNullableInt(birthdayDay);

  if (parsedMonth && parsedDay) {
    return {
      birthdayMonth: parsedMonth,
      birthdayDay: parsedDay,
    };
  }

  const rawValue = cleanText(birthdayRaw);

  if (!rawValue) {
    return {
      birthdayMonth: parsedMonth,
      birthdayDay: parsedDay,
    };
  }

  const match = rawValue.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  const month = MONTH_NAME_TO_NUMBER[cleanText(match?.[1]).toLowerCase()];
  const day = Number.parseInt(match?.[2] || '', 10);

  if (!month || Number.isNaN(day) || day < 1 || day > 31) {
    return {
      birthdayMonth: parsedMonth,
      birthdayDay: parsedDay,
    };
  }

  return {
    birthdayMonth: month,
    birthdayDay: day,
  };
}

function compareUpcomingBirthdays(left, right) {
  const leftOffset = getBirthdayOffset(left);
  const rightOffset = getBirthdayOffset(right);

  if (leftOffset !== rightOffset) {
    return leftOffset - rightOffset;
  }

  return (left.facebookName || left.displayName).localeCompare(right.facebookName || right.displayName);
}

function getBirthdayOffset(member) {
  const nextBirthday = getNextBirthdayDateValue(member);

  if (!nextBirthday) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return nextBirthday.getTime() - todayAtMidnight.getTime();
}

function createUpcomingBirthdayCalendarEntry(member) {
  const nextBirthday = getNextBirthdayDateValue(member);

  if (!nextBirthday) {
    return null;
  }

  return createBirthdayCalendarEntry(
    member,
    nextBirthday.getFullYear(),
    formatIsoDate(nextBirthday),
  );
}

function createBirthdayCalendarEntry(member, year, eventDateOverride = '') {
  const birthdayParts = resolveBirthdayParts(member?.birthdayRaw, member?.birthdayMonth, member?.birthdayDay);

  if (!member?.hasBirthday || !birthdayParts.birthdayMonth || !birthdayParts.birthdayDay) {
    return null;
  }

  const eventDate = cleanText(eventDateOverride) || buildBirthdayEventDate(year, birthdayParts.birthdayMonth, birthdayParts.birthdayDay);

  if (!eventDate) {
    return null;
  }

  const birthdayName = cleanText(member.facebookName || member.displayName || member.inGameName);

  if (!birthdayName) {
    return null;
  }

  return {
    id: `birthday-${cleanText(member.id) || createClientMemberId(birthdayName)}-${eventDate}`,
    title: birthdayName,
    eventType: EVENT_TYPE_DETAILS.birthday_party.label,
    eventTypeLabel: 'Birthday',
    typeIndicator: EVENT_TYPE_DETAILS.birthday_party.indicator,
    typeIndicatorClass: EVENT_TYPE_DETAILS.birthday_party.className,
    eventDate,
    startTime: '',
    endTime: '',
    timezone: '',
    whenLabel: formatEventDateLabel(eventDate),
    hostName: birthdayName,
    inGameName: cleanText(member.inGameName),
    hostMemberId: cleanText(member.id),
    createdByUserId: '',
    createdByEmail: '',
    locationText: '',
    homeLink: sanitizeUrl(cleanText(member.homeLink)),
    birthdayLabel: formatBirthdayLabel(member.birthdayRaw, birthdayParts.birthdayMonth, birthdayParts.birthdayDay),
    details: `${birthdayName}'s birthday.`,
    yesCount: 0,
    maybeCount: 0,
    noCount: 0,
    isActive: true,
    isBirthday: true,
    sortOrder: -1,
  };
}

function buildBirthdayEventDate(year, month, day) {
  const safeYear = parseNullableInt(year);
  const safeMonth = parseNullableInt(month);
  const safeDay = parseNullableInt(day);

  if (!safeYear || !safeMonth || !safeDay) {
    return '';
  }

  const date = new Date(safeYear, safeMonth - 1, safeDay);

  if (
    date.getFullYear() !== safeYear
    || date.getMonth() !== safeMonth - 1
    || date.getDate() !== safeDay
  ) {
    return '';
  }

  return `${safeYear}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

function getNextBirthdayDateValue(member) {
  const birthdayParts = resolveBirthdayParts(member?.birthdayRaw, member?.birthdayMonth, member?.birthdayDay);

  if (!member?.hasBirthday || !birthdayParts.birthdayMonth || !birthdayParts.birthdayDay) {
    return null;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const todayAtMidnight = new Date(currentYear, today.getMonth(), today.getDate());
  let nextBirthday = new Date(currentYear, birthdayParts.birthdayMonth - 1, birthdayParts.birthdayDay);

  if (
    nextBirthday.getFullYear() !== currentYear
    || nextBirthday.getMonth() !== birthdayParts.birthdayMonth - 1
    || nextBirthday.getDate() !== birthdayParts.birthdayDay
  ) {
    return null;
  }

  if (nextBirthday < todayAtMidnight) {
    nextBirthday = new Date(currentYear + 1, birthdayParts.birthdayMonth - 1, birthdayParts.birthdayDay);
  }

  return nextBirthday;
}

function formatIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseNullableInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function getSessionUserId() {
  return cleanText(state.admin.session?.user?.id);
}

function normalizeInviteCode(value) {
  return cleanText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeInviteExpiryDays(value) {
  const parsed = parseNullableInt(value);

  if (!parsed) {
    return DEFAULT_MEMBER_INVITE_EXPIRY_DAYS;
  }

  return Math.min(Math.max(parsed, 1), MAX_MEMBER_INVITE_EXPIRY_DAYS);
}

function generateInviteCode() {
  const segmentLength = INVITE_CODE_GROUP_SIZE * INVITE_CODE_GROUP_COUNT;
  const cryptoObject = window.crypto || window.msCrypto;
  const randomValues = new Uint32Array(segmentLength);

  if (cryptoObject?.getRandomValues) {
    cryptoObject.getRandomValues(randomValues);
  } else {
    for (let index = 0; index < randomValues.length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  const characters = Array.from(randomValues, (value) => INVITE_CODE_ALPHABET[value % INVITE_CODE_ALPHABET.length]);
  const segments = [];

  for (let index = 0; index < characters.length; index += INVITE_CODE_GROUP_SIZE) {
    segments.push(characters.slice(index, index + INVITE_CODE_GROUP_SIZE).join(''));
  }

  return segments.join('-');
}

function formatInviteExpiryLabel(value) {
  const text = cleanText(value);

  if (!text) {
    return 'soon';
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createClientMemberId(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'member';
}

function sanitizeUrl(value) {
  const rawValue = cleanText(value);

  if (!rawValue) {
    return '';
  }

  try {
    const parsed = new URL(rawValue, window.location.href);
    return /^https?:$/i.test(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function buildPasswordResetRedirectUrl() {
  const url = new URL(window.location.href);
  const authParams = [
    'access_token',
    'refresh_token',
    'expires_at',
    'expires_in',
    'token_type',
    'type',
    'error',
    'error_code',
    'error_description',
  ];

  authParams.forEach((key) => url.searchParams.delete(key));
  url.hash = '';

  return url.toString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadPrivateState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPrivateState, ...JSON.parse(stored) } : defaultPrivateState;
  } catch {
    return defaultPrivateState;
  }
}

function savePrivateState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.privateData));
}
