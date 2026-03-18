import { TOKEN_KEY } from "../utils/constants";

let navigateFn = null;
let logoutCallbackFn = null;

export function setNavigate(fn) {
  navigateFn = fn;
}

/**
 * Registra o callback de logout do AuthContext para que
 * o interceptor de 401 limpe o estado React (não apenas localStorage).
 */
export function setLogoutCallback(fn) {
  logoutCallbackFn = fn;
}

export function setupInterceptors(client) {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const isLoginRoute = config.url?.includes("/auth/login");

      if (token && !isLoginRoute) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const isLoginRoute = error.config?.url?.includes("/auth/login");

        if (!isLoginRoute) {
          if (logoutCallbackFn) {
            logoutCallbackFn();
          }

          if (navigateFn) {
            navigateFn("/login", { replace: true });
          }
        }
      }

      return Promise.reject(error);
    }
  );
}
