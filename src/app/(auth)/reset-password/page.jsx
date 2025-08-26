"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useResetPassword from "@/hooks/useResetPassword";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

// Create a separate component that uses useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const { loading, resetPassword, error } = useResetPassword();

  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showSecondPass, setShowSecondPass] = useState(false);

  // ✅ Client-side validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // ✅ Strong password validation
  const validatePasswordClient = (passwordValue) => {
    if (!passwordValue.trim()) return null;

    const errors = [];

    if (passwordValue.length < 8) {
      errors.push("En az 8 karakter olmalı");
    }
    if (!/[A-Z]/.test(passwordValue)) {
      errors.push("En az 1 büyük harf içermeli");
    }
    if (!/[a-z]/.test(passwordValue)) {
      errors.push("En az 1 küçük harf içermeli");
    }
    if (!/\d/.test(passwordValue)) {
      errors.push("En az 1 rakam içermeli");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)) {
      errors.push("En az 1 özel karakter içermeli (!@#$%^&* vb.)");
    }

    return errors.length > 0 ? errors : null;
  };

  // ✅ Confirm password validation
  const validateConfirmPasswordClient = (confirmValue, originalPassword) => {
    if (!confirmValue.trim()) return null;

    if (confirmValue !== originalPassword) {
      return "Şifreler eşleşmiyor!";
    }
    return null;
  };

  // ✅ Password change handler with validation
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    // Real-time validation
    const passwordErrors = validatePasswordClient(passwordValue);
    setFieldErrors((prev) => ({
      ...prev,
      password: passwordErrors,
    }));

    // Re-validate confirm password if it exists
    if (secondPassword) {
      const confirmError = validateConfirmPasswordClient(
        secondPassword,
        passwordValue
      );
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  // ✅ Confirm password change handler with validation
  const handleConfirmPasswordChange = (e) => {
    const confirmValue = e.target.value;
    setSecondPassword(confirmValue);

    // Real-time validation
    const confirmError = validateConfirmPasswordClient(confirmValue, password);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: confirmError,
    }));
  };

  // ✅ Field touch handler
  const handleFieldTouch = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // ✅ Validation state helpers
  const getPasswordValidationState = () => {
    if (!password) return "neutral";
    if (fieldErrors.password) return "error";
    return "success";
  };

  const getConfirmPasswordValidationState = () => {
    if (!secondPassword) return "neutral";
    if (fieldErrors.confirmPassword) return "error";
    return "success";
  };

  // ✅ Form validation check
  const isFormValid = () => {
    const hasErrors = Object.values(fieldErrors).some(
      (error) => error !== null
    );
    const hasEmptyFields = !password.trim() || !secondPassword.trim();
    return !hasErrors && !hasEmptyFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Final validation before submit
    const passwordErrors = validatePasswordClient(password);
    const confirmError = validateConfirmPasswordClient(
      secondPassword,
      password
    );

    if (passwordErrors || confirmError) {
      setFieldErrors({
        password: passwordErrors,
        confirmPassword: confirmError,
      });
      return;
    }

    // Clear any previous client-side errors
    setFieldErrors({});

    await resetPassword({ password, token, router });
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="flex justify-center items-center">
        <h1 className="text-6xl text-center font-family-marcellus tracking-wide text-amber-700">
          Cruffin
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-semibold text-center">
          Yeni Şifre Belirle
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* ✅ Password Input with validation styling */}
        <div className="relative">
          <Input
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Yeni Şifre (min 8 karakter)"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleFieldTouch("password")}
            required
            autoComplete="new-password"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onDrag={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onSelect={(e) => e.preventDefault()}
            className={`w-full px-4 py-2 border rounded pr-10 ${
              getPasswordValidationState() === "error"
                ? "border-red-300 focus:border-red-500"
                : getPasswordValidationState() === "success"
                ? "border-green-300 focus:border-green-500"
                : "focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity ${
              getPasswordValidationState() === "error"
                ? "text-red-400"
                : getPasswordValidationState() === "success"
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        {/* ✅ Password error display */}
        {fieldErrors.password && (
          <div className="mt-2 space-y-1">
            {fieldErrors.password.map((error, index) => (
              <p key={index} className="text-red-500 text-sm">
                • {error}
              </p>
            ))}
          </div>
        )}

        {/* ✅ Confirm Password Input with validation styling */}
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showSecondPass ? "text" : "password"}
            placeholder="Şifre Teyit"
            value={secondPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => handleFieldTouch("confirmPassword")}
            required
            autoComplete="new-password"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onDrag={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onSelect={(e) => e.preventDefault()}
            className={`w-full px-4 py-2 border rounded pr-10 ${
              getConfirmPasswordValidationState() === "error"
                ? "border-red-300 focus:border-red-500"
                : getConfirmPasswordValidationState() === "success"
                ? "border-green-300 focus:border-green-500"
                : "focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowSecondPass((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity ${
              getConfirmPasswordValidationState() === "error"
                ? "text-red-400"
                : getConfirmPasswordValidationState() === "success"
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            {showSecondPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        {/* ✅ Confirm password error display */}
        {fieldErrors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}

        {/* ✅ Submit button with validation-based disable */}
        <Button
          type="submit"
          className={`w-full p-2 rounded transition-all duration-300 ease-in-out ${
            isFormValid() && !loading
              ? "hover:cursor-pointer hover:bg-primary/90"
              : "cursor-not-allowed bg-gray-300 text-gray-500 hover:bg-gray-300"
          }`}
          disabled={loading || !isFormValid()}
        >
          {loading ? "Gönderiliyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  );
}

// Main component that wraps ResetPasswordForm with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
