const {
  adminChecklist,
  dashboard,
  giveaways,
  hangouts,
  members: mockMembers,
  sections,
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
  admin: createDefaultAdminState(),
};

const app = document.querySelector('#app');

render();
void loadLiveMembers();
void initializeAdminSession();

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

  const { action, memberId } = actionButton.dataset;

  switch (action) {
    case 'admin-edit-member':
      beginEditingMember(memberId);
      render();
      return;
    case 'admin-reset-member-form':
      resetAdminEditor();
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
  }
});

function render() {
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
          ${sections
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
  const current = sections.find((section) => section.id === state.activeSection);
  return current ? current.label : 'This Week';
}

function renderSection() {
  switch (state.activeSection) {
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
            <h3>Birthdays and hangouts</h3>
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
  return `
    <section class="panel-grid panel-grid--members">
      ${hangouts
        .map(
          (hangout) => `
            <article class="panel">
              <div class="panel__heading">
                <div>
                  <p class="eyebrow">Hangout</p>
                  <h3>${hangout.title}</h3>
                </div>
                <span class="tag">${hangout.when}</span>
              </div>
              <p>Host: ${hangout.host}</p>
              <div class="stats-grid stats-grid--compact">
                <div class="stat-card">
                  <span>Yes</span>
                  <strong>${hangout.yes}</strong>
                </div>
                <div class="stat-card">
                  <span>Maybe</span>
                  <strong>${hangout.maybe}</strong>
                </div>
                <div class="stat-card">
                  <span>No</span>
                  <strong>${hangout.no}</strong>
                </div>
              </div>
            </article>
          `,
        )
        .join('')}
    </section>
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

function renderAdmin() {
  const currentMembers = getMembers();

  if (!hasSupabaseConfig) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Admin Access</p>
          <h3>Supabase config is still missing</h3>
          <p class="panel-lead">Add the Supabase URL and anon key in src/config.js before using the admin editor.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.isReady) {
    return `
      <section class="panel-grid panel-grid--admin">
        <article class="panel panel--announcement panel--span-full">
          <p class="eyebrow">Admin Access</p>
          <h3>Checking your admin session</h3>
          <p class="panel-lead">Loading sign-in status and staff permissions from Supabase.</p>
        </article>
      </section>
    `;
  }

  if (!state.admin.session) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminAuthPanel()}
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  if (!state.admin.staffProfile) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminSessionPanel()}
        <article class="panel panel--announcement">
          <p class="eyebrow">Staff Access</p>
          <h3>This account is signed in but not ready to edit</h3>
          <p class="panel-lead">${escapeHtml(state.admin.notice || 'The signed-in email is missing a readable staff_permissions record, or the staff policy SQL has not been run yet.')}</p>
          <div class="button-row">
            <button class="hero-button hero-button--secondary" type="button" data-action="admin-refresh-session">Refresh permissions</button>
            <button class="hero-button hero-button--secondary" type="button" data-action="admin-sign-out">Sign out</button>
          </div>
        </article>
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  if (!state.admin.staffProfile.canManageMembers) {
    return `
      <section class="panel-grid panel-grid--admin">
        ${renderAdminSessionPanel()}
        <article class="panel panel--announcement">
          <p class="eyebrow">Member Editing</p>
          <h3>This staff role cannot edit members</h3>
          <p class="panel-lead">Your account is authenticated, but it does not currently have member-management permission.</p>
        </article>
        ${renderAdminChecklistPanel()}
      </section>
    `;
  }

  return `
    <section class="panel-grid panel-grid--admin">
      ${renderAdminSessionPanel()}
      ${renderAdminEditorPanel()}
      ${renderAdminMembersPanel(currentMembers)}
    </section>
  `;
}

function renderAdminAuthPanel() {
  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Admin Access</p>
      <h3>Sign in to manage members</h3>
      <p class="panel-lead">Use the same email that exists in staff_permissions. If you do not have an Auth account yet, create one here first.</p>
      ${renderAdminNotice()}
      <form class="admin-form" data-admin-auth-form>
        <div class="form-grid">
          <label class="field-group">
            <span>Email</span>
            <input class="text-input" type="email" name="email" value="${escapeHtml(state.admin.session?.user?.email || 'ywa.paint@gmail.com')}" autocomplete="email" required />
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

  return `
    <article class="panel panel--announcement">
      <p class="eyebrow">Admin Session</p>
      <h3>${escapeHtml(staffProfile?.displayName || 'Signed in')}</h3>
      <p class="panel-lead">${escapeHtml(sessionEmail || 'No active session email found.')}</p>
      ${renderAdminNotice()}
      <div class="permission-badges">
        ${staffProfile ? renderPermissionBadges(staffProfile) : ''}
      </div>
      <div class="button-row admin-form-actions">
        <button class="hero-button hero-button--secondary" type="button" data-action="admin-refresh-session">Refresh permissions</button>
        <button class="hero-button hero-button--secondary" type="button" data-action="admin-sign-out">Sign Out</button>
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
          <p class="eyebrow">Member Editor</p>
          <h3>${isEditing ? 'Edit member' : 'Add member'}</h3>
        </div>
        <span class="tag">${escapeHtml(isEditing ? 'Editing active member' : 'New active member')}</span>
      </div>
      <p class="panel-lead">Use Facebook names as the primary label. Set the YoWorld name as the gift-confirmation name.</p>
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

function renderAdminNotice() {
  if (!state.admin.notice) {
    return '';
  }

  return `<p class="admin-message admin-message--${escapeHtml(state.admin.noticeTone)}">${escapeHtml(state.admin.notice)}</p>`;
}

function getMembers() {
  return state.members;
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

async function initializeAdminSession(showRefreshMessage = false) {
  state.admin.isReady = false;
  render();

  const session = await getValidSession();
  state.admin.session = session;
  state.admin.staffProfile = null;

  if (session) {
    await loadStaffProfile();
  } else if (showRefreshMessage) {
    setAdminNotice('No active admin session was found. Sign in again to edit members.', 'muted');
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

  if (!state.admin.staffProfile) {
    setAdminNotice('Signed in, but this email does not have an active staff permission record yet.', 'error');
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
  setAdminNotice(mode === 'create-account' ? 'Creating your admin auth account...' : 'Signing in...', 'muted');
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
    setAdminNotice(error instanceof Error ? error.message : 'Admin sign-in failed.', 'error');
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

async function getSupabaseErrorMessage(response, context = 'read') {
  if (response.status === 401 || response.status === 403) {
    if (context === 'write') {
      return 'This signed-in account does not have permission to edit members yet.';
    }

    if (context === 'staff') {
      return 'Could not read staff permissions. Run supabase/07_admin_editor_auth_policies.sql after 05_member_roles_and_permissions.sql.';
    }

    return 'The members table is still private. Run supabase/02_enable_member_directory_read.sql when you are ready for browser reads.';
  }

  if (response.status === 404) {
    if (context === 'staff') {
      return 'The staff permissions table is not available yet. Run supabase/05_member_roles_and_permissions.sql and then supabase/07_admin_editor_auth_policies.sql.';
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
