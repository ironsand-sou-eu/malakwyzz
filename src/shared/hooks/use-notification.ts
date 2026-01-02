import Toast from "toastify-js";

interface NotificationMsgParams {
  durationInMs?: number;
  style?: {
    [cssRule: string]: string;
  };
}

export default function useNotification() {
  const defaultSuccessStyles = {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    padding: "15px",
    background: "linear-gradient(to right, #00b09b, #96c93d)",
    maxWidth: "max-content",
  };

  function error(text: string, { durationInMs = 3000, style = defaultSuccessStyles }: NotificationMsgParams = {}) {
    Toast({
      text,
      duration: durationInMs,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      style,
    }).showToast();
  }

  function warning(text: string, { durationInMs = 3000, style = defaultSuccessStyles }: NotificationMsgParams = {}) {
    Toast({
      text,
      duration: durationInMs,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      style,
    }).showToast();
  }

  function success(text: string, { durationInMs = 3000, style = defaultSuccessStyles }: NotificationMsgParams = {}) {
    Toast({
      text,
      duration: durationInMs,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      style,
    }).showToast();
  }

  return { error, success, warning };
}
