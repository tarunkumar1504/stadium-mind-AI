/**
 * @file AuthContext.jsx
 * @description Authentication context provider for StadiumPulse AI.
 *
 * Responsibilities:
 *  - Maintain JWT token and current user state.
 *  - Attach Authorization header to every outgoing request via an Axios interceptor.
 *  - Auto-logout when the server returns 401 (expired / revoked token).
 *  - Expose login, register, logout helpers and isAuthenticated flag.
 *
 * @module AuthContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Singleton Axios instance – configured once at module load time
// ---------------------------------------------------------------------------

/**
 * Strips trailing slashes / whitespace and removes a trailing "/api" segment
 * so callers can safely prefix every path with "/api/...".
 *
 * @param {string} raw - Raw URL from environment variable.
 * @returns {string} Cleaned base URL.
 */
function sanitizeBaseUrl(raw = '') {
  return raw.trim().replace(/\/+$|\s+$/g, '').replace(/\/api$/i, '');
}

/** Pre-configured Axios instance shared across the whole app. */
const api = axios.create({
  baseURL: sanitizeBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 15_000, // 15 s – avoids hanging requests
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Centralised error shaping
// ---------------------------------------------------------------------------

/**
 * Extracts a human-readable error message from an Axios error.
 *
 * @param {import('axios').AxiosError} err - The caught Axios error.
 * @returns {{ success: false, message: string }}
 */
function buildErrorResponse(err) {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.errors?.[0]?.msg ||
    err?.message ||
    'An unexpected error occurred. Please try again.';
  return { success: false, message };
}

// ---------------------------------------------------------------------------
// Context definition
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null}  user            - Authenticated user object or null.
 * @property {string}       token           - Raw JWT string (empty when logged out).
 * @property {boolean}      loading         - True while the initial /me fetch is running.
 * @property {boolean}      isAuthenticated - Convenience flag derived from user.
 * @property {Function}     login           - Async login helper.
 * @property {Function}     register        - Async register helper.
 * @property {Function}     logout          - Clears local auth state.
 */

/** @type {React.Context<AuthContextValue>} */
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wraps the component tree with authentication state and helpers.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Keep a ref so the interceptor always sees the latest logout without
  // re-registering the interceptor on every render.
  const logoutRef = useRef(null);

  // ------------------------------------------------------------------
  // logout – defined before interceptor registration
  // ------------------------------------------------------------------

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    // Clear the Authorization header immediately
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // Sync ref on every render (no performance cost, no stale closure)
  logoutRef.current = logout;

  // ------------------------------------------------------------------
  // Axios interceptors – registered once on mount
  // ------------------------------------------------------------------

  useEffect(() => {
    // Request interceptor – attach the latest token from storage
    const reqId = api.interceptors.request.use((config) => {
      const stored = localStorage.getItem('token');
      if (stored) {
        config.headers['Authorization'] = `Bearer ${stored}`;
      } else {
        delete config.headers['Authorization'];
      }
      return config;
    });

    // Response interceptor – auto-logout on 401 Unauthorized
    const resId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logoutRef.current?.();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup on unmount
    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, []); // deliberately empty – interceptors must run only once

  // ------------------------------------------------------------------
  // Fetch current user on token change
  // ------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        // Interceptor handles 401; other errors just clear loading
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    // Abort stale updates when token changes rapidly
    return () => {
      cancelled = true;
    };
  }, [token]);

  // ------------------------------------------------------------------
  // Auth helpers
  // ------------------------------------------------------------------

  /**
   * Authenticates a user with email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: true } | { success: false, message: string }>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      const { token: accessToken, user: userInfo } = data;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setUser(userInfo);
      return { success: true };
    } catch (err) {
      return buildErrorResponse(err);
    }
  }, []);

  /**
   * Registers a new user account.
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} role
   * @returns {Promise<{ success: true } | { success: false, message: string }>}
   */
  const register = useCallback(async (username, email, password, role) => {
    try {
      const { data } = await api.post('/api/auth/register', {
        username,
        email,
        password,
        role,
      });
      const { token: accessToken, user: userInfo } = data;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setUser(userInfo);
      return { success: true };
    } catch (err) {
      return buildErrorResponse(err);
    }
  }, []);

  // ------------------------------------------------------------------
  // Memoised context value – only re-creates when dependencies change
  // ------------------------------------------------------------------

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  /** React node(s) that will have access to the auth context. */
  children: PropTypes.node.isRequired,
};

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Custom hook to consume AuthContext.
 * Throws a descriptive error when used outside of AuthProvider.
 *
 * @returns {AuthContextValue}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
};

// Export the pre-configured Axios instance for use elsewhere in the app.
export { api };
