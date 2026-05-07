window.YAWL_DATA = {
  sections: [
    { id: 'dashboard', label: 'This Week' },
    { id: 'members', label: 'Members' },
    { id: 'birthdays', label: 'Birthdays' },
    { id: 'giveaways', label: 'Giveaways' },
    { id: 'hangouts', label: 'Hangouts' },
    { id: 'notes', label: 'My Notes' },
    { id: 'account', label: 'Account' },
  ],

  members: [
    {
      id: 'ember',
      name: 'Ember Bloom',
      inGameName: 'Ember Bloom YW',
      groupRole: 'member',
      homeLink: 'https://example.com/home/ember-bloom',
      birthday: 'May 9',
      playWindow: 'Evenings ET',
      status: 'Needs porch gifts',
    },
    {
      id: 'lark',
      name: 'Lark Wisp',
      inGameName: 'LarkWisp',
      groupRole: 'event_planner',
      homeLink: 'https://example.com/home/lark-wisp',
      birthday: 'May 15',
      playWindow: 'Afternoons PT',
      status: 'Collects floral decor',
    },
    {
      id: 'nova',
      name: 'Nova June',
      inGameName: 'NovaJune',
      groupRole: 'moderator',
      homeLink: 'https://example.com/home/nova-june',
      birthday: 'May 22',
      playWindow: 'Weekends only',
      status: 'Hosting the next hangout',
    },
    {
      id: 'sol',
      name: 'Sol Harbor',
      inGameName: 'SolHarbor',
      groupRole: 'helper',
      homeLink: 'https://example.com/home/sol-harbor',
      birthday: 'June 2',
      playWindow: 'Mornings CT',
      status: 'Prefers mystery gifts',
    },
  ],

  dashboard: {
    weekLabel: 'Week of May 5',
    announcement:
      'Wishlist uploads open Sunday night. Admins will manage member records, home links, and shared boards for v1.',
    facebookThreadUrl: '',
    stats: [
      { label: 'Wishlists posted', value: '14 / 39' },
      { label: 'Birthdays soon', value: '2' },
      { label: 'Open giveaways', value: '6' },
      { label: 'Hangout RSVPs', value: '11' },
    ],
    wishlistHighlights: [
      { member: 'Ember Bloom', detail: 'Garden swing set, peach lanterns, heart mailbox' },
      { member: 'Lark Wisp', detail: 'Tea cart, ivy arch, spring windows' },
      { member: 'Nova June', detail: 'Stage lights, ballroom rugs, silver stools' },
    ],
  },

  giveaways: [
    {
      id: 'g1',
      title: 'Spring Patio Bundle',
      donor: 'Lark Wisp',
      claimedBy: '',
      note: 'First claim wins. Admin can clear if plans change.',
    },
    {
      id: 'g2',
      title: 'Golden Vanity',
      donor: 'Nova June',
      claimedBy: 'Ember Bloom',
      note: 'Claimed and pending drop-off.',
    },
    {
      id: 'g3',
      title: 'Cottage Window Set',
      donor: 'Sol Harbor',
      claimedBy: '',
      note: 'Perfect for storybook themes.',
    },
  ],

  hangouts: [
    {
      id: 'h1',
      title: 'Garden Glow Hangout',
      when: 'Saturday, 7:00 PM ET',
      yes: 7,
      maybe: 3,
      no: 1,
      host: 'Nova June',
    },
  ],

  adminChecklist: [
    'Run 05_member_roles_and_permissions.sql to add visible member roles and the staff-permissions table.',
    'Run 06_gothicka_admin_access.sql to register Gothicka as the first admin staff record.',
    'Run 07_admin_editor_auth_policies.sql so signed-in staff can read their profile and edit allowed member roles.',
    'Use the Account tab to create or sign in to the matching Supabase Auth account before editing members.',
    'Keep private notes and gifted or visited tracking local-only.',
  ],
};
