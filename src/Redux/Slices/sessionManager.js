export const generateSessionId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel("auth_channel") : null;

export const broadcastLogin = (sessionId) => {
  if (channel) channel.postMessage({ type: "NEW_LOGIN", sessionId });
};

export const initSessionListener = (onSessionMismatch) => {
  if (!channel) return;
  const currentSessionId = localStorage.getItem("sessionId");

  channel.onmessage = (event) => {
    if (event.data?.type === "NEW_LOGIN") {
      if (event.data.sessionId !== currentSessionId) {
        onSessionMismatch();
      }
    }
  };
};
