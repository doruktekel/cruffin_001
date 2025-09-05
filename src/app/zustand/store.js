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
      rateLimitInfo: null,

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
            // ✅ Email kayıtlı hatası özel kontrolü
            if (res.status === 400 && data.error?.includes("email adresi")) {
              // Rate limit bilgisini temizle çünkü bu geçerli bir hata
              set({ rateLimitInfo: null });

              // Field-specific errors set et
              const emailFieldError = data.fieldErrors?.email || [data.error];
              set({
                fieldErrors: {
                  email: Array.isArray(emailFieldError)
                    ? emailFieldError[0]
                    : emailFieldError,
                },
              });

              throw new Error(data.error);
            }

            // Diğer field-specific errors
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

          // ✅ Başarılı kayıt - rate limit bilgisini temizle
          set({
            error: null,
            fieldErrors: {},
            loading: false,
            rateLimitInfo: null, // Başarılı işlemde temizle
          });

          console.log("Registration successful:", data.message);
          router.push("/login?message=" + encodeURIComponent(data.message));
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
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.fieldErrors) {
              set({ fieldErrors: data.fieldErrors });
            }
            throw new Error(data?.error || data?.message || "Giriş başarısız");
          }

          // ✅ Başarılı login - tüm hata bilgilerini temizle
          set({
            user: data.user,
            isAuth: true,
            error: null,
            fieldErrors: {},
            rateLimitInfo: null, // Login'de de temizle
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

          if (!res.ok) {
            console.warn("Logout API failed, but continuing with cleanup");
          }

          // ✅ State'i tamamen temizle
          set({
            user: null,
            isAuth: false,
            loading: false,
            error: null,
            fieldErrors: {},
            rateLimitInfo: null, // Logout'ta da temizle
          });

          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          }

          router.push("/login");
          console.log("Logout successful");
        } catch (err) {
          console.error("Logout error:", err);

          set({
            user: null,
            isAuth: false,
            loading: false,
            error: null,
            fieldErrors: {},
            rateLimitInfo: null,
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
            error: null,
          });
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Manuel state temizleme
      clearAuth: () => {
        set({
          user: null,
          isAuth: false,
          error: null,
          fieldErrors: {},
          loading: false,
          rateLimitInfo: null, // Rate limit bilgisini de temizle
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      },

      // ✅ Rate limit bilgisini manuel temizleme
      clearRateLimit: () => {
        set({ rateLimitInfo: null });
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
