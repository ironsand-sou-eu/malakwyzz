import Toast from "toastify-js";

interface NotificationMsgParams {
  durationInMs?: number;
  style?: {
    [cssRule: string]: string;
  };
}

export default function useNotification() {
  function baseToast({ durationInMs, style, text }: NotificationMsgParams & { text: string }) {
    Toast({
      close: true,
      duration: durationInMs,
      gravity: "bottom",
      offset: { x: 0, y: 100 },
      position: "right",
      stopOnFocus: true,
      style: { maxWidth: "100%", padding: "15px", ...style },
      text,
    }).showToast();
  }

  function error(text: string, { durationInMs = 3000, style }: NotificationMsgParams = {}) {
    baseToast({
      durationInMs,
      style: { background: "var(--bg-error)", ...style },
      text,
    });
  }

  function success(text: string, { durationInMs = 3000, style }: NotificationMsgParams = {}) {
    baseToast({
      durationInMs,
      style: { background: "var(--bg-success)", ...style },
      text,
    });
  }

  function warning(text: string, { durationInMs = 3000, style }: NotificationMsgParams = {}) {
    baseToast({
      durationInMs,
      style: { background: "var(--bg-warning)", ...style },
      text,
    });
  }

  return { error, success, warning };
}
