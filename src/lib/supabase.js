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
    signOut,
    supabaseFetch,
    getSupabaseStatus,
  };
})();
