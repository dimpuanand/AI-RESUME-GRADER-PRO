/**
 * Custom modern toast notification trigger system.
 * Fires a lightweight window CustomEvent that any component can listen to.
 */

export interface ToastMessage {
  message: string;
  type: "success" | "error" | "info" | "warning";
  id: string;
}

export function showToast(message: string, type: "success" | "error" | "info" | "warning" = "info") {
  const event = new CustomEvent("app-toast", {
    detail: {
      message,
      type,
      id: Math.random().toString(36).substring(2, 9),
    },
  });
  window.dispatchEvent(event);
}

// Global window declarations for typescript safety
declare global {
  interface WindowEventMap {
    "app-toast": CustomEvent<Omit<ToastMessage, "">>;
  }
}
