"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: "18px",
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid rgba(103, 232, 249, 0.16)",
          boxShadow: "0 24px 60px -28px rgba(15, 23, 42, 0.55)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#f8fafc",
          },
        },
        error: {
          iconTheme: {
            primary: "#fb7185",
            secondary: "#f8fafc",
          },
        },
      }}
    />
  );
}
