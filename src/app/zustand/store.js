import { create } from "zustand";
import { devtools } from "zustand/middleware";
export const useStore = create(
  devtools(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      fieldErrors: {},
      isAuth: false,
      rateLimitInfo: null, // ✅ Rate limit bilgisi

      clearErrors: () => set({ error: null, fieldErrors: {} }),
      setFieldErrors: (errors) => set({ fieldErrors: errors }),

      userRegister: async ({ email, password, honeypot, website, router }) => {
        console.log("Registering user:", email);

        set({ loading: true, error: null, fieldErrors: {} });

        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              confirmPassword: password,
              // ✅ Honeypot verilerini gönder
              middleName: honeypot || "",
              profileUrl: website || "",
            }),
          });

          // Rate limit bilgilerini al
          const rateLimitInfo = {
            limit: parseInt(res.headers.get("X-RateLimit-Limit") || "0"),
            remaining: parseInt(
              res.headers.get("X-RateLimit-Remaining") || "0"
            ),
            resetTime: res.headers.get("X-RateLimit-Reset"),
          };

          set({ rateLimitInfo });

          const data = await res.json();

          if (!res.ok) {
            // Field-specific errors
            if (data.fieldErrors) {
              set({ fieldErrors: data.fieldErrors });
            }

            // ✅ Rate limit error özel işlemi
            if (res.status === 429) {
              const retryAfter = res.headers.get("Retry-After");
              throw new Error(
                `Çok fazla kayıt denemesi. ${retryAfter} saniye sonra tekrar deneyin.`
              );
            }

            throw new Error(data?.error || data?.message || "Kayıt başarısız");
          }

          // Başarılı kayıt
          console.log("Registration successful:", data.message);
          router.push("/login?message=" + encodeURIComponent(data.message));

          set({
            error: null,
            fieldErrors: {},
            loading: false,
          });
        } catch (err) {
          console.error("Registration error:", err);
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      userLogin: async ({ email, password, router, rememberMe = false }) => {
        set({ loading: true, error: null, fieldErrors: {} });

        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, rememberMe }),
            credentials: "include", // Cookie'ler için
          });

          const data = await res.json();

          if (!res.ok) {
            // Field-specific errors varsa onları set et
            if (data.fieldErrors) {
              set({ fieldErrors: data.fieldErrors });
            }

            throw new Error(data?.error || data?.message || "Giriş başarısız");
          }

          // Başarılı login
          set({
            user: data.user,
            isAuth: true,
            error: null,
            fieldErrors: {},
          });

          router.push("/dashboard");
        } catch (err) {
          console.error("Login error:", err);
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      userLogout: async (router) => {
        console.log("Logout initiated");

        set({ loading: true, error: null });

        try {
          const res = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            console.warn("Logout API failed, but continuing with cleanup");
          }

          // State'i temizle
          set({
            user: null,
            isAuth: false,
            loading: false,
            error: null,
            fieldErrors: {},
          });

          // Browser storage temizle
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");

            // Manuel cookie temizleme
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          }

          router.push("/login");
          console.log("Logout successful");
        } catch (err) {
          console.error("Logout error:", err);

          // Hata olsa bile temizlik yap
          set({
            user: null,
            isAuth: false,
            loading: false,
            error: null,
            fieldErrors: {},
          });

          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          }

          router.push("/login");
        }
      },

      userCheck: async () => {
        set({ loading: true, error: null });

        try {
          const res = await fetch("/api/auth/profile", {
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.error === "No Token" || res.status === 401) {
              // Token yoksa state'i temizle
              set({
                user: null,
                isAuth: false,
                loading: false,
                error: null,
              });
              return;
            }
            throw new Error(data?.error || "Kullanıcı bilgileri alınamadı");
          }

          set({
            user: data,
            isAuth: true,
            error: null,
          });
        } catch (err) {
          console.error("User check error:", err);
          set({
            user: null,
            isAuth: false,
            error: null, // User check hatalarını gösterme
          });
        } finally {
          set({ loading: false });
        }
      },

      // State'i manuel temizleme
      clearAuth: () => {
        set({
          user: null,
          isAuth: false,
          error: null,
          fieldErrors: {},
          loading: false,
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      },

      // Utility functions
      getCurrentUser: () => get().user,
      isAuthenticated: () => get().isAuth && get().user !== null,
      isLoading: () => get().loading,
      getErrors: () => ({
        general: get().error,
        fields: get().fieldErrors,
      }),
    }),
    {
      name: "auth-store",
    }
  )
);
