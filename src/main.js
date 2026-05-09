const {
  adminChecklist,
  dashboard,
  giveaways,
  hangouts: mockHangouts,
  members: mockMembers,
  sections: baseSections,
} = window.YAWL_DATA;
const {
  getStoredSession,
  getSupabaseStatus,
  getValidSession,
  hasSupabaseConfig,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  supabaseFetch,
} = window.YAWL_SUPABASE;
const facebookGroupUrl = sanitizeUrl(String(window.YAWL_CONFIG.facebookGroupUrl || ''));
const facebookThreadUrl = sanitizeUrl(String(dashboard.facebookThreadUrl || ''));
const yoKeysWidgetUrl = sanitizeUrl(String(window.YAWL_CONFIG.yoKeysWidgetUrl || ''));

const STORAGE_KEY = 'yawl-hub-private-tracker';
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
const EVENT_TYPE_DETAILS = {
  hangout: { label: 'Hangout', indicator: 'H', className: 'event-type-icon--hangout' },
  party: { label: 'Party', indicator: 'P', className: 'event-type-icon--party' },
  wishlist: { label: 'Wishlist', indicator: 'W', className: 'event-type-icon--wishlist' },
  game: { label: 'Game', indicator: 'G', className: 'event-type-icon--game' },
  meetup: { label: 'Meet Up', indicator: 'M', className: 'event-type-icon--meetup' },
  other: { label: 'Special Event', indicator: '+', className: 'event-type-icon--other' },
};
const DEFAULT_EVENT_TIMEZONE = cleanText(window.YAWL_CONFIG.defaultEventTimezone || 'ET') || 'ET';

const defaultPrivateState = {
  notes: '',
  gifted: {},
  visited: {},
};

const state = {
  activeSection: 'dashboard',
  privateData: loadPrivateState(),
  members: normalizeMockMembers(mockMembers),
  memberSource: hasSupabaseConfig ? 'loading' : 'mock',
  memberSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading live member directory...' : getSupabaseStatus(),
  events: normalizeMockEvents(mockHangouts),
  eventSource: hasSupabaseConfig ? 'loading' : 'mock',
  eventSourceMessage: hasSupabaseConfig ? 'Supabase config detected. Loading shared events...' : getSupabaseStatus(),
  admin: createDefaultAdminState(),
};

const app = document.querySelector('#app');

render();
void loadLiveMembers();
void loadLiveEvents();
void initializeAdminSession();

window.addEventListener('focus', () => {
  if (!hasSupabaseConfig) {
    return;
  }

  void loadLiveMembers();
  void loadLiveEvents();
});

app.addEventListener('click', async (event) => {
  const navButton = event.target.closest('[data-section]');
  if (navButton) {
    state.activeSection = navButton.dataset.section;
    render();
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

  const { action, memberId, eventId } = actionButton.dataset;

  switch (action) {
    case 'admin-edit-member':
      beginEditingMember(memberId);
      render();
      return;
    case 'admin-reset-member-form':
      resetAdminEditor();
      render();
      return;
    case 'admin-edit-event':
      beginEditingEvent(eventId);
      render();
      return;
    case 'admin-reset-event-form':
      resetAdminEventEditor();
      render();
      return;
    case 'admin-refresh-session':
      await initializeAdminSession(true);
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
    default:
      return;
  }
});

app.addEventListener('input', (event) => {
  if (event.target.matches('[data-private-notes]')) {
    state.privateData = {
      ...state.privateData,
      notes: event.target.value,
    };

    savePrivateState();
  }
});

app.addEventListener('submit', async (event) => {
  if (event.target.matches('[data-admin-auth-form]')) {
    event.preventDefault();
    await handleAdminAuthSubmit(event);
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
        <p class="eyebrow">Admin-managed v1</p>
        <h2>${getSectionTitle()}</h2>
      </div>
      <div class="hero__actions">
        ${renderHeaderLinks()}
        <button class="hero-button hero-button--secondary" type="button" data-section="notes">Private Tracker</button>
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
  const visibleSections = [...baseSections];

  if (hasAdminToolsAccess()) {
    visibleSections.push({ id: 'admin', label: 'Admin Tools' });
  }

  return visibleSections;
}

function ensureValidActiveSection() {
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

function hasAdminToolsAccess() {
  return canManageMembers() || canManageEvents();
}

function renderSection() {
  switch (state.activeSection) {
    case 'account':
      return renderAccount();
    case 'members':
      return renderMembers();
    case 'birthdays':
      return renderBirthdays();
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

  return `
    <section class="panel-grid panel-grid--dashboard">
      <article class="panel panel--announcement panel--feature">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Announcement</p>
            <h3>Weekly headquarters</h3>
          </div>
          <span class="tag">${dashboard.weekLabel}</span>
        </div>
        <p class="panel-lead">${dashboard.announcement}</p>
        <div class="button-row">
          ${facebookGroupUrl ? `<a class="hero-button" href="${facebookGroupUrl}" target="_blank" rel="noreferrer">Open Group</a>` : ''}
          ${facebookThreadUrl ? `<a class="hero-button hero-button--secondary" href="${facebookThreadUrl}" target="_blank" rel="noreferrer">Weekly Thread</a>` : ''}
          ${yoKeysWidgetUrl ? `<a class="hero-button hero-button--secondary" href="${yoKeysWidgetUrl}" target="_blank" rel="noreferrer">Launch YoKeys</a>` : ''}
          <button class="hero-button hero-button--secondary" type="button" data-section="notes">Private Tracker</button>
        </div>
      </article>

      <article class="stats-grid">
        ${dashboard.stats
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

      <article class="panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Wishlist Gallery</p>
            <h3>Current highlights</h3>
          </div>
        </div>
        <div class="wish-grid">
          ${dashboard.wishlistHighlights
            .map(
              (item) => `
                <div class="wish-card">
                  <p class="wish-card__name">${item.member}</p>
                  <p>${item.detail}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      </article>

      ${renderLaunchpadPanel()}

      <article class="panel">
        <div class="panel__heading">
          <div>
            <p class="eyebrow">Upcoming</p>
            <h3>Birthdays and events</h3>
          </div>
        </div>
        <div class="stack-list">
          ${upcomingMembers.length
            ? upcomingMembers
                .map(
                  (member) => `
                    <div class="list-row">
                      <div>
                        <strong>${escapeHtml(member.displayName)}</strong>
                        <span>${escapeHtml(member.secondaryName || member.statusText)}</span>
                      </div>
                      <span>${escapeHtml(member.birthdayLabel)}</span>
                    </div>
                  `,
                )
                .join('')
            : `
                <div class="list-row list-row--compact">
                  <span>${escapeHtml(state.memberSource === 'loading' ? 'Loading live member birthdays...' : 'No member birthdays available yet.')}</span>
                </div>
              `}
        </div>
      </article>
    </section>
  `;
}

function renderLaunchpadPanel() {
  const tiles = [
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
    renderSectionLaunchTile(
      'Private',
      'Gift Tracker',
      'Mark visits, keep private notes, and stay organized without sharing personal tracking data.',
      'notes',
      'Open notes',
      '',
    ),
    renderSectionLaunchTile(
      'Directory',
      'Member Homes',
      'Browse home links quickly, then jump into your gifting route without leaving the main hub.',
      'members',
      'View members',
      '',
    ),
  ].filter(Boolean);

  return `
    <article class="panel panel--launchpad">
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

function renderMembers() {
  const currentMembers = getMembers();

  return `
    <section class="panel-grid panel-grid--directory-page">
      ${renderDirectoryNotice()}
      ${currentMembers.length
        ? renderMemberDirectoryPanel(currentMembers)
        : renderEmptyMemberPanel(
            state.memberSource === 'loading' ? 'Loading members' : 'No members yet',
            state.memberSource === 'loading'
              ? 'Trying to load the live member directory from Supabase.'
              : 'Import members into Supabase or keep using the mock data until the directory is ready.',
          )}
    </section>
  `;
}

function renderMemberDirectoryPanel(currentMembers) {
  return `
    <article class="panel panel--directory">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Directory</p>
          <h3>Facebook-first member list</h3>
        </div>
        <span class="tag">${escapeHtml(`${currentMembers.length} active members`)}</span>
      </div>
      <p class="panel-lead">Facebook names lead each row. Use the YoWorld name as confirmation before sending gifts.</p>
      <div class="directory-list" role="list">
        ${renderMemberDirectoryHeader()}
        ${currentMembers.map((member) => renderMemberDirectoryRow(member)).join('')}
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
  return `
    <section class="panel-grid panel-grid--members">
      ${giveaways
        .map(
          (item) => `
            <article class="panel">
              <div class="member-card__header">
                <div>
                  <p class="eyebrow">Giveaway</p>
                  <h3>${item.title}</h3>
                </div>
                <span class="tag ${item.claimedBy ? 'tag--muted' : ''}">${item.claimedBy ? 'Claimed' : 'Open'}</span>
              </div>
              <p>Posted by ${item.donor}</p>
              <p class="muted">${item.note}</p>
              <p class="claim-row">
                ${item.claimedBy ? `Claimed by ${item.claimedBy}` : 'Available for a member claim flow later.'}
              </p>
            </article>
          `,
        )
        .join('')}
    </section>
  `;
}

function renderHangouts() {
  const currentEvents = getEvents();

  return `
    <section class="panel-grid panel-grid--members">
      ${renderEventSourceNotice()}
      ${currentEvents.length
        ? currentEvents.map((calendarEvent) => renderEventCard(calendarEvent)).join('')
        : renderEmptyEventPanel(
            state.eventSource === 'loading' ? 'Loading events' : 'No events posted yet',
            state.eventSource === 'loading'
              ? 'Trying to load the shared event calendar from Supabase now.'
              : 'No hangouts, parties, games, or meet ups have been added yet.',
          )}
    </section>
  `;
}

function renderEventCard(calendarEvent, options = {}) {
  const { showAdminActions = false } = options;

  return `
    <article class="panel event-card">
      <div class="panel__heading">
        <div class="event-title-row">
          <span class="event-type-icon ${calendarEvent.typeIndicatorClass}" aria-hidden="true">${escapeHtml(calendarEvent.typeIndicator)}</span>
          <div>
            <p class="eyebrow">${escapeHtml(calendarEvent.eventTypeLabel)}</p>
            <h3>${escapeHtml(calendarEvent.title)}</h3>
          </div>
        </div>
        <span class="tag">${escapeHtml(calendarEvent.whenLabel)}</span>
      </div>
      <p class="panel-lead">${escapeHtml(calendarEvent.details || getDefaultEventDescription(calendarEvent.eventType))}</p>
      <div class="event-meta">
        <div class="event-meta-row">
          <strong>Host</strong>
          <span>${escapeHtml(calendarEvent.hostName || 'Host coming soon')}</span>
        </div>
        <div class="event-meta-row">
          <strong>Location</strong>
          <span>${escapeHtml(calendarEvent.locationText || 'Location coming soon')}</span>
        </div>
      </div>
      ${calendarEvent.eventLink ? `<div class="button-row event-links"><a class="hero-button hero-button--secondary" href="${calendarEvent.eventLink}" target="_blank" rel="noreferrer">Open Event Link</a></div>` : ''}
      <div class="stats-grid stats-grid--compact event-stats">
        <div class="stat-card">
          <span>Yes</span>
          <strong>${calendarEvent.yesCount}</strong>
        </div>
        <div class="stat-card">
          <span>Maybe</span>
          <strong>${calendarEvent.maybeCount}</strong>
        </div>
        <div class="stat-card">
          <span>No</span>
          <strong>${calendarEvent.noCount}</strong>
        </div>
      </div>
      ${showAdminActions
        ? `
            <div class="button-row admin-form-actions">
              <button class="hero-button hero-button--secondary" type="button" data-action="admin-edit-event" data-event-id="${escapeHtml(calendarEvent.id)}">Edit Event</button>
              <button class="tracker-button" type="button" data-action="admin-deactivate-event" data-event-id="${escapeHtml(calendarEvent.id)}">Deactivate Event</button>
            </div>
          `
        : ''}
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
      ${canManageMembers() ? renderAdminEditorPanel() : ''}
      ${canManageEvents() ? renderAdminEventEditorPanel(currentMembers) : ''}
      ${canManageMembers() ? renderAdminMembersPanel(currentMembers) : ''}
      ${canManageEvents() ? renderAdminEventsPanel() : ''}
    </section>
  `;
}

function renderAdminAuthPanel() {
  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Account Access</p>
      <h3>Create or sign in to your private account</h3>
      <p class="panel-lead">Passwords stay private. Staff editing only unlocks if the signed-in email also exists in staff_permissions.</p>
      ${renderAdminNotice()}
      <form class="admin-form" data-admin-auth-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Email</span>
            <input class="text-input" type="email" name="email" value="${escapeHtml(state.admin.session?.user?.email || '')}" autocomplete="email" required />
          </label>
          <label class="field-group">
            <span>Password</span>
            <input class="text-input" type="password" name="password" autocomplete="current-password" required />
          </label>
        </div>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit" value="sign-in">Sign In</button>
          <button class="hero-button hero-button--secondary" type="submit" value="create-account">Create Account</button>
        </div>
      </form>
    </article>
  `;
}

function renderAdminSessionPanel() {
  const staffProfile = state.admin.staffProfile;
  const sessionEmail = cleanText(state.admin.session?.user?.email || '');
  const isStaff = hasStaffProfile();

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Account Session</p>
      <h3>${escapeHtml(staffProfile?.displayName || 'Member Account')}</h3>
      <p class="panel-lead">${escapeHtml(sessionEmail || 'No active session email found.')}</p>
      ${renderAdminNotice()}
      <div class="permission-badges">
        ${isStaff ? renderPermissionBadges(staffProfile) : '<span class="tag tag--muted">Member account</span>'}
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
      <p class="panel-lead">Members can create their own login without sharing a password with admins. Staff permissions stay separate from normal account creation.</p>
      <div class="stack-list">
        <div class="list-row list-row--compact">
          <strong>Password privacy</strong>
          <span>Admins cannot see member passwords.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Member login</strong>
          <span>Create an account for private features and future saved preferences.</span>
        </div>
        <div class="list-row list-row--compact">
          <strong>Staff editing</strong>
          <span>Only emails in staff_permissions unlock the editor.</span>
        </div>
      </div>
    </article>
  `;
}

function renderAdminLaunchPanel() {
  const liveTools = [];

  if (canManageMembers()) {
    liveTools.push('member directory and birthdays');
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
  const canManageRoles = Boolean(state.admin.staffProfile?.canManageRoles);

  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Member and Birthday Editor</p>
          <h3>${isEditing ? 'Edit member' : 'Add member'}</h3>
        </div>
        <span class="tag">${escapeHtml(isEditing ? 'Editing active member' : 'New active member')}</span>
      </div>
      <p class="panel-lead">Use Facebook names as the primary label. Set the YoWorld name as the gift-confirmation name and add birthdays here for the shared birthday board.</p>
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
            <small class="field-help">Use the Month Day format so it shows correctly on the birthdays page.</small>
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

function renderAdminEventEditorPanel(currentMembers) {
  const form = state.admin.eventForm;
  const isEditing = Boolean(state.admin.editingEventId);

  return `
    <article class="panel">
      <div class="panel__heading">
        <div>
          <p class="eyebrow">Event Calendar Editor</p>
          <h3>${isEditing ? 'Edit event' : 'Add event'}</h3>
        </div>
        <span class="tag">${escapeHtml(isEditing ? 'Editing live event' : 'Shared calendar')}</span>
      </div>
      <p class="panel-lead">Add hangouts, parties, wishlist nights, games, and meet ups here. The event type controls the icon shown next to the event title.</p>
      <form class="admin-form" data-admin-event-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Event Type</span>
            <select class="text-input" name="event_type">
              ${renderEventTypeOptions(form.eventType)}
            </select>
            <small class="field-help">This drives the icon indicator next to the event title.</small>
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
            <input class="text-input" type="text" name="host_name" value="${escapeHtml(form.hostName)}" list="event-host-options" placeholder="Nova June" />
          </label>
          <label class="field-group">
            <span>Location</span>
            <input class="text-input" type="text" name="location_text" value="${escapeHtml(form.locationText)}" placeholder="Party house, game room, Facebook thread, or meet-up spot" />
          </label>
          <label class="field-group">
            <span>Event Link</span>
            <input class="text-input" type="url" name="event_link" value="${escapeHtml(form.eventLink)}" placeholder="Optional Facebook thread or event link" />
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
        <datalist id="event-host-options">
          ${currentMembers
            .map((member) => `<option value="${escapeHtml(member.facebookName || member.displayName)}"></option>`)
            .join('')}
        </datalist>
        <div class="button-row admin-form-actions">
          <button class="hero-button" type="submit">${escapeHtml(isEditing ? 'Save Event' : 'Add Event')}</button>
          <button class="hero-button hero-button--secondary" type="button" data-action="admin-reset-event-form">${escapeHtml(isEditing ? 'Cancel Edit' : 'Clear Form')}</button>
        </div>
      </form>
      <p class="muted">Event planners and admins can manage the live shared calendar here. Old events should be deactivated instead of hard deleted.</p>
    </article>
  `;
}

function renderEventTypeOptions(selectedType) {
  return Object.keys(EVENT_TYPE_DETAILS)
    .map(
      (eventType) => `
        <option value="${eventType}" ${normalizeEventType(selectedType) === eventType ? 'selected' : ''}>${escapeHtml(formatEventTypeLabel(eventType))}</option>
      `,
    )
    .join('');
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

function getEvents() {
  return [...state.events].sort(compareEvents);
}

function getBirthdayMembers() {
  return getMembers().filter((member) => member.hasBirthday).sort(compareUpcomingBirthdays);
}

function getUpcomingBirthdayMembers(limit) {
  const birthdayMembers = getBirthdayMembers();
  return birthdayMembers.length ? birthdayMembers.slice(0, limit) : getMembers().slice(0, limit);
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
  return {
    session: getStoredSession(),
    staffProfile: null,
    isReady: false,
    isBusy: false,
    notice: '',
    noticeTone: 'muted',
    editingMemberId: '',
    form: createEmptyMemberForm(),
    editingEventId: '',
    eventForm: createEmptyEventForm(),
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

function createEmptyEventForm(calendarEvent = null) {
  return {
    title: cleanText(calendarEvent?.title),
    eventType: normalizeEventType(calendarEvent?.eventType),
    eventDate: cleanText(calendarEvent?.eventDate),
    startTime: normalizeEventTime(calendarEvent?.startTime),
    endTime: normalizeEventTime(calendarEvent?.endTime),
    timezone: cleanText(calendarEvent?.timezone) || DEFAULT_EVENT_TIMEZONE,
    hostName: cleanText(calendarEvent?.hostName),
    locationText: cleanText(calendarEvent?.locationText),
    eventLink: cleanText(calendarEvent?.eventLink),
    yesCount: String(normalizeEventCount(calendarEvent?.yesCount)),
    maybeCount: String(normalizeEventCount(calendarEvent?.maybeCount)),
    noCount: String(normalizeEventCount(calendarEvent?.noCount)),
    details: cleanText(calendarEvent?.details),
  };
}

async function initializeAdminSession(showRefreshMessage = false) {
  state.admin.isReady = false;
  render();

  const session = await getValidSession();
  state.admin.session = session;
  state.admin.staffProfile = null;

  if (session) {
    await loadStaffProfile();
  } else if (showRefreshMessage) {
    setAdminNotice('No active account session was found. Sign in again to continue.', 'muted');
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

  if (!email || !password) {
    setAdminNotice('Email and password are both required.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(mode === 'create-account' ? 'Creating your account...' : 'Signing in...', 'muted');
  render();

  try {
    if (mode === 'create-account') {
      const result = await signUpWithPassword(email, password);

      if (result.session) {
        state.admin.session = result.session;
        await loadStaffProfile();
      } else if (result.needsEmailConfirmation) {
        state.admin.session = null;
        setAdminNotice('Account created. Check your email to confirm it, then come back and sign in.', 'success');
      } else {
        setAdminNotice('Account created. You can sign in now.', 'success');
      }
    } else {
      state.admin.session = await signInWithPassword(email, password);
      await loadStaffProfile();
    }
  } catch (error) {
    setAdminNotice(error instanceof Error ? error.message : 'Account sign-in failed.', 'error');
  } finally {
    state.admin.isBusy = false;
    state.admin.isReady = true;
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

  state.admin.editingEventId = calendarEvent.id;
  state.admin.eventForm = createEmptyEventForm(calendarEvent);
  setAdminNotice(`Editing ${calendarEvent.title}.`, 'muted');
}

function resetAdminEventEditor() {
  state.admin.editingEventId = '';
  state.admin.eventForm = createEmptyEventForm();
  setAdminNotice('Event form reset.', 'muted');
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
  if (!canManageEvents()) {
    setAdminNotice('This account does not have permission to manage events.', 'error');
    render();
    return;
  }

  state.admin.isBusy = true;
  setAdminNotice(state.admin.editingEventId ? 'Saving event changes...' : 'Adding event...', 'muted');
  render();

  try {
    const payload = buildEventPayload(new FormData(event.target));
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
  if (!canManageEvents()) {
    setAdminNotice('This account does not have permission to manage events.', 'error');
    render();
    return;
  }

  const calendarEvent = getEvents().find((entry) => entry.id === eventId);

  if (!calendarEvent) {
    setAdminNotice('That event could not be found.', 'error');
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

function buildEventPayload(formData) {
  const title = cleanText(formData.get('title'));
  const eventDate = cleanText(formData.get('event_date'));
  const eventType = normalizeEventType(formData.get('event_type'));
  const startTime = normalizeEventTime(formData.get('start_time'));
  const endTime = normalizeEventTime(formData.get('end_time'));
  const timezone = cleanText(formData.get('timezone')) || DEFAULT_EVENT_TIMEZONE;
  const hostName = cleanText(formData.get('host_name'));
  const locationText = normalizeNullableText(formData.get('location_text'));
  const details = normalizeNullableText(formData.get('details'));
  const eventLinkRaw = cleanText(formData.get('event_link'));
  const eventLink = eventLinkRaw ? sanitizeUrl(eventLinkRaw) : '';
  const matchedMember = findMemberByName(hostName);

  if (!title) {
    throw new Error('Event title is required.');
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

  if (eventLinkRaw && !eventLink) {
    throw new Error('Event link must be a valid http or https URL.');
  }

  return {
    title,
    event_type: eventType,
    event_date: eventDate,
    start_time: startTime || null,
    end_time: endTime || null,
    timezone,
    host_name: hostName || null,
    host_member_id: matchedMember && isUuid(matchedMember.id) ? matchedMember.id : null,
    location_text: locationText,
    details,
    event_link: eventLink || null,
    yes_count: normalizeCountInput(formData.get('yes_count')),
    maybe_count: normalizeCountInput(formData.get('maybe_count')),
    no_count: normalizeCountInput(formData.get('no_count')),
    is_active: true,
  };
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

  const match = rawValue.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  const month = MONTH_NAME_TO_NUMBER[cleanText(match?.[1]).toLowerCase()];
  const day = Number.parseInt(match?.[2] || '', 10);

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

async function loadLiveEvents() {
  if (!hasSupabaseConfig) {
    return;
  }

  try {
    const query = new URLSearchParams({
      select: 'id,title,event_type,event_date,start_time,end_time,timezone,host_name,host_member_id,location_text,details,event_link,yes_count,maybe_count,no_count,is_active',
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

async function getSupabaseErrorMessage(response, context = 'read') {
  if (response.status === 401 || response.status === 403) {
    if (context === 'write') {
      return 'This signed-in account does not have permission to edit members yet.';
    }

    if (context === 'event-write') {
      return 'This signed-in account does not have permission to edit events yet.';
    }

    if (context === 'staff') {
      return 'Could not read staff permissions. Run supabase/07_admin_editor_auth_policies.sql after 05_member_roles_and_permissions.sql.';
    }

    if (context === 'events') {
      return 'The events calendar is still private. Run supabase/08_events_calendar.sql when you are ready for browser reads.';
    }

    return 'The members table is still private. Run supabase/02_enable_member_directory_read.sql when you are ready for browser reads.';
  }

  if (response.status === 404) {
    if (context === 'staff') {
      return 'The staff permissions table is not available yet. Run supabase/05_member_roles_and_permissions.sql and then supabase/07_admin_editor_auth_policies.sql.';
    }

    if (context === 'events' || context === 'event-write') {
      return 'The events table is not available yet. Run supabase/08_events_calendar.sql.';
    }

    return 'The members table is not available yet. Run the schema SQL and confirm the table exists in Supabase.';
  }

  try {
    const payload = await response.json();
    return payload.message || payload.error_description || payload.error || `Supabase returned ${response.status}.`;
  } catch {
    return `Supabase returned ${response.status}.`;
  }
}

function normalizeMockMembers(sourceMembers) {
  return sourceMembers.map((member, index) => normalizeMockMember(member, index));
}

function normalizeMockEvents(sourceEvents) {
  return sourceEvents.map((calendarEvent, index) => normalizeMockEvent(calendarEvent, index));
}

function normalizeMockEvent(calendarEvent, index) {
  const title = cleanText(calendarEvent.title) || `Event ${index + 1}`;
  const eventType = normalizeEventType(calendarEvent.eventType || calendarEvent.type);
  const eventDate = cleanText(calendarEvent.eventDate);
  const startTime = normalizeEventTime(calendarEvent.startTime);
  const endTime = normalizeEventTime(calendarEvent.endTime);
  const timezone = cleanText(calendarEvent.timezone) || DEFAULT_EVENT_TIMEZONE;

  return {
    id: cleanText(calendarEvent.id) || `event-${index + 1}`,
    title,
    eventType,
    eventTypeLabel: formatEventTypeLabel(eventType),
    typeIndicator: getEventTypeIndicator(eventType),
    typeIndicatorClass: getEventTypeIndicatorClass(eventType),
    eventDate,
    startTime,
    endTime,
    timezone,
    whenLabel: cleanText(calendarEvent.when) || formatEventWhenLabel(eventDate, startTime, endTime, timezone),
    hostName: cleanText(calendarEvent.host || calendarEvent.hostName),
    locationText: cleanText(calendarEvent.locationText || calendarEvent.location),
    details: cleanText(calendarEvent.details || calendarEvent.note),
    eventLink: sanitizeUrl(cleanText(calendarEvent.eventLink || calendarEvent.link)),
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

  return {
    id: cleanText(member.id) || createClientMemberId(facebookName),
    displayName: facebookName,
    facebookName,
    inGameName,
    secondaryName: inGameName ? `YoWorld: ${inGameName}` : 'YoWorld name not added yet.',
    homeLink: sanitizeUrl(cleanText(member.homeLink)),
    houseKey: cleanText(member.houseKey),
    birthdayRaw: cleanText(member.birthday),
    birthdayLabel: cleanText(member.birthday) || 'Birthday not added',
    birthdayMonth: null,
    birthdayDay: null,
    hasBirthday: Boolean(cleanText(member.birthday)),
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

function normalizeSupabaseEvents(rows) {
  return rows.map((row, index) => normalizeSupabaseEvent(row, index));
}

function normalizeSupabaseEvent(row, index) {
  const eventType = normalizeEventType(row.event_type);
  const eventDate = cleanText(row.event_date);
  const startTime = normalizeEventTime(row.start_time);
  const endTime = normalizeEventTime(row.end_time);
  const timezone = cleanText(row.timezone) || DEFAULT_EVENT_TIMEZONE;

  return {
    id: cleanText(row.id) || `event-${index + 1}`,
    title: cleanText(row.title) || `Event ${index + 1}`,
    eventType,
    eventTypeLabel: formatEventTypeLabel(eventType),
    typeIndicator: getEventTypeIndicator(eventType),
    typeIndicatorClass: getEventTypeIndicatorClass(eventType),
    eventDate,
    startTime,
    endTime,
    timezone,
    whenLabel: formatEventWhenLabel(eventDate, startTime, endTime, timezone),
    hostName: cleanText(row.host_name),
    locationText: cleanText(row.location_text),
    details: cleanText(row.details),
    eventLink: sanitizeUrl(cleanText(row.event_link)),
    yesCount: normalizeEventCount(row.yes_count),
    maybeCount: normalizeEventCount(row.maybe_count),
    noCount: normalizeEventCount(row.no_count),
    isActive: row.is_active !== false,
    sortOrder: index,
  };
}

function normalizeSupabaseMember(row, index) {
  const facebookName = cleanText(row.facebook_name);
  const inGameName = cleanText(row.in_game_name);
  const displayName = facebookName || inGameName || `Member ${index + 1}`;
  const birthdayRaw = cleanText(row.birthday_raw);
  const birthdayMonth = parseNullableInt(row.birthday_month);
  const birthdayDay = parseNullableInt(row.birthday_day);
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
    birthdayLabel: formatBirthdayLabel(birthdayRaw, birthdayMonth, birthdayDay),
    birthdayMonth,
    birthdayDay,
    hasBirthday: Boolean(birthdayRaw || (birthdayMonth && birthdayDay)),
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

function normalizeEventType(value) {
  const normalized = cleanText(value).toLowerCase().replace(/[-\s]+/g, '_');

  switch (normalized) {
    case 'hangout':
    case 'party':
    case 'wishlist':
    case 'game':
    case 'meetup':
    case 'other':
      return normalized;
    default:
      return 'other';
  }
}

function formatEventTypeLabel(eventType) {
  return EVENT_TYPE_DETAILS[normalizeEventType(eventType)]?.label || EVENT_TYPE_DETAILS.other.label;
}

function getEventTypeIndicator(eventType) {
  return EVENT_TYPE_DETAILS[normalizeEventType(eventType)]?.indicator || EVENT_TYPE_DETAILS.other.indicator;
}

function getEventTypeIndicatorClass(eventType) {
  return EVENT_TYPE_DETAILS[normalizeEventType(eventType)]?.className || EVENT_TYPE_DETAILS.other.className;
}

function formatEventWhenLabel(eventDate, startTime, endTime, timezone) {
  const dateLabel = formatEventDateLabel(eventDate);

  if (!dateLabel) {
    return 'Date coming soon';
  }

  if (!startTime) {
    return `${dateLabel} • All day`;
  }

  const startLabel = formatTimeLabel(startTime);
  const endLabel = formatTimeLabel(endTime);
  const timezoneLabel = cleanText(timezone);

  if (endLabel) {
    return `${dateLabel} • ${startLabel} - ${endLabel}${timezoneLabel ? ` ${timezoneLabel}` : ''}`;
  }

  return `${dateLabel} • ${startLabel}${timezoneLabel ? ` ${timezoneLabel}` : ''}`;
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

function getDefaultEventDescription(eventType) {
  switch (normalizeEventType(eventType)) {
    case 'party':
      return 'A shared party event for the group.';
    case 'wishlist':
      return 'A wishlist-focused event for posting, gifting, or checking updates.';
    case 'game':
      return 'A game session for the group.';
    case 'meetup':
      return 'A meet-up for the group to gather in game.';
    case 'hangout':
      return 'A casual hangout event for the group.';
    case 'other':
    default:
      return 'A shared event for the group.';
  }
}

function findMemberByName(value) {
  const lookup = cleanText(value).toLowerCase();

  if (!lookup) {
    return null;
  }

  return getMembers().find((member) => {
    return [member.facebookName, member.displayName, member.inGameName]
      .map((name) => cleanText(name).toLowerCase())
      .includes(lookup);
  }) || null;
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

function compareUpcomingBirthdays(left, right) {
  const leftOffset = getBirthdayOffset(left);
  const rightOffset = getBirthdayOffset(right);

  if (leftOffset !== rightOffset) {
    return leftOffset - rightOffset;
  }

  return (left.facebookName || left.displayName).localeCompare(right.facebookName || right.displayName);
}

function getBirthdayOffset(member) {
  if (!member.hasBirthday || !member.birthdayMonth || !member.birthdayDay) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const todayAtMidnight = new Date(currentYear, today.getMonth(), today.getDate());
  let nextBirthday = new Date(currentYear, member.birthdayMonth - 1, member.birthdayDay);

  if (nextBirthday < todayAtMidnight) {
    nextBirthday = new Date(currentYear + 1, member.birthdayMonth - 1, member.birthdayDay);
  }

  return nextBirthday.getTime() - todayAtMidnight.getTime();
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
