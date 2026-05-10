(function attachSupabaseHelpers() {
  const config = window.YAWL_CONFIG || {};
  const supabaseUrl = String(config.supabaseUrl || '').replace(/\/$/, '');
  const supabaseAnonKey = String(config.supabaseAnonKey || '');
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
  const AUTH_STORAGE_KEY = 'yawl-hub-supabase-session';

  function buildApiUrl(prefix, path, query = '') {
    const cleanPath = String(path || '').replace(/^\/+/, '');
    const normalizedQuery = query ? `?${String(query).replace(/^\?/, '')}` : '';
    return `${supabaseUrl}/${prefix}/${cleanPath}${normalizedQuery}`;
  }

  function buildRestUrl(path, query = '') {
    return buildApiUrl('rest/v1', path, query);
  }

  function buildAuthUrl(path, query = '') {
    return buildApiUrl('auth/v1', path, query);
  }

  function getStoredSession() {
    try {
      const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    if (!session) {
      clearSession();
      return null;
    }

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      return session;
    }

    return session;
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  function clearAuthRedirectStateFromUrl() {
    try {
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
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
    } catch {
      // Ignore URL cleanup failures.
    }
  }

  function getAuthRedirectParams() {
    const combinedParams = new URLSearchParams();
    const hashParams = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search || '');

    for (const [key, value] of searchParams.entries()) {
      if (!combinedParams.has(key)) {
        combinedParams.set(key, value);
      }
    }

    for (const [key, value] of hashParams.entries()) {
      if (!combinedParams.has(key)) {
        combinedParams.set(key, value);
      }
    }

    return combinedParams;
  }

  function normalizeSession(payload) {
    const accessToken = String(payload?.access_token || '');

    if (!accessToken) {
      return null;
    }

    const expiresIn = Number(payload?.expires_in || 0);
    const expiresAt = Number(payload?.expires_at || 0) || Math.floor(Date.now() / 1000) + expiresIn;

    return {
      accessToken,
      refreshToken: String(payload?.refresh_token || ''),
      expiresAt,
      user: payload?.user || null,
    };
  }

  function isSessionExpired(session, skewSeconds = 60) {
    if (!session?.accessToken || !session?.expiresAt) {
      return true;
    }

    return Number(session.expiresAt) <= Math.floor(Date.now() / 1000) + skewSeconds;
  }

  async function parseErrorMessage(response) {
    try {
      const payload = await response.json();
      return payload.message || payload.msg || payload.error_description || payload.error || `Supabase returned ${response.status}.`;
    } catch {
      return `Supabase returned ${response.status}.`;
    }
  }

  async function authFetch(path, options = {}) {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase is not configured. Add the URL and anon key in src/config.js first.');
    }

    const { query = '', headers = {}, body, ...rest } = options;
    const requestBody = body && typeof body !== 'string' ? JSON.stringify(body) : body;

    return fetch(buildAuthUrl(path, query), {
      ...rest,
      body: requestBody,
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  async function refreshSession(refreshTokenOverride) {
    const refreshToken = String(refreshTokenOverride || getStoredSession()?.refreshToken || '');

    if (!refreshToken) {
      clearSession();
      return null;
    }

    const response = await authFetch('token', {
      method: 'POST',
      query: 'grant_type=refresh_token',
      body: {
        refresh_token: refreshToken,
      },
    });

    if (!response.ok) {
      clearSession();
      throw new Error(await parseErrorMessage(response));
    }

    return saveSession(normalizeSession(await response.json()));
  }

  async function getValidSession() {
    const storedSession = getStoredSession();

    if (!storedSession) {
      return null;
    }

    if (!isSessionExpired(storedSession)) {
      return storedSession;
    }

    try {
      return await refreshSession(storedSession.refreshToken);
    } catch {
      return null;
    }
  }

  async function fetchCurrentUser(accessToken) {
    if (!accessToken) {
      return null;
    }

    let response;

    try {
      response = await authFetch('user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function consumeAuthRedirectSession() {
    const params = getAuthRedirectParams();
    const accessToken = String(params.get('access_token') || '');
    const refreshToken = String(params.get('refresh_token') || '');
    const redirectType = String(params.get('type') || '').toLowerCase();
    const errorMessage = String(params.get('error_description') || params.get('error') || '');

    if (errorMessage) {
      clearAuthRedirectStateFromUrl();
      return {
        session: null,
        type: redirectType,
        error: errorMessage,
      };
    }

    if (!accessToken || !refreshToken) {
      return {
        session: null,
        type: redirectType,
        error: '',
      };
    }

    const session = saveSession(
      normalizeSession({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: params.get('expires_at'),
        expires_in: params.get('expires_in'),
      }),
    );

    if (!session) {
      clearAuthRedirectStateFromUrl();
      return {
        session: null,
        type: redirectType,
        error: 'Could not restore the recovery session from the email link.',
      };
    }

    const user = await fetchCurrentUser(session.accessToken);
    const hydratedSession = saveSession({
      ...session,
      user: user || session.user,
    });

    clearAuthRedirectStateFromUrl();

    return {
      session: hydratedSession,
      type: redirectType,
      error: '',
    };
  }

  async function signInWithPassword(email, password) {
    const response = await authFetch('token', {
      method: 'POST',
      query: 'grant_type=password',
      body: {
        email,
        password,
      },
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return saveSession(normalizeSession(await response.json()));
  }

  async function signUpWithPassword(email, password) {
    const response = await authFetch('signup', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const payload = await response.json();
    const session = saveSession(normalizeSession(payload));

    return {
      session,
      user: payload.user || null,
      needsEmailConfirmation: !session && Boolean(payload.user),
    };
  }

  async function sendPasswordResetEmail(email, redirectTo = '') {
    const query = redirectTo
      ? new URLSearchParams({
          redirect_to: redirectTo,
        }).toString()
      : '';
    const response = await authFetch('recover', {
      method: 'POST',
      query,
      body: {
        email,
      },
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return true;
  }

  async function updatePassword(newPassword) {
    const session = await getValidSession();

    if (!session?.accessToken) {
      throw new Error('Open the password recovery link from your email first, then choose a new password here.');
    }

    const response = await authFetch('user', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: {
        password: newPassword,
      },
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    let user = null;

    try {
      user = await response.json();
    } catch {
      user = null;
    }

    return saveSession({
      ...session,
      user: user || session.user,
    });
  }

  async function signOut() {
    const session = getStoredSession();

    if (session?.accessToken) {
      await authFetch('logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).catch(() => null);
    }

    clearSession();
    return null;
  }

  async function supabaseFetch(path, options = {}) {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase is not configured. Add the URL and anon key in src/config.js first.');
    }

    const { query = '', headers = {}, accessToken = '', useSession = false, body, ...rest } = options;
    const requestBody = body && typeof body !== 'string' ? JSON.stringify(body) : body;
    const session = useSession ? await getValidSession() : null;
    const bearerToken = accessToken || session?.accessToken || supabaseAnonKey;

    return fetch(buildRestUrl(path, query), {
      ...rest,
      body: requestBody,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  function getSupabaseStatus() {
    return hasSupabaseConfig
      ? 'Supabase config detected. Ready to connect shared data.'
      : 'Using mock data until src/config.js contains the Supabase URL and anon key.';
  }

  window.YAWL_SUPABASE = {
    AUTH_STORAGE_KEY,
    supabaseUrl,
    supabaseAnonKey,
    hasSupabaseConfig,
    buildRestUrl,
    buildAuthUrl,
    getStoredSession,
    getValidSession,
    clearSession,
    refreshSession,
    signInWithPassword,
    signUpWithPassword,
    consumeAuthRedirectSession,
    sendPasswordResetEmail,
    signOut,
    supabaseFetch,
    updatePassword,
    getSupabaseStatus,
  };

})();
