export const generateSessionId = () => crypto.randomUUID();

const channel = new BroadcastChannel("auth_channel");

export const broadcastLogin = (sessionId) => {
  channel.postMessage({ type: "NEW_LOGIN", sessionId });
};

export const initSessionListener = (onSessionMismatch) => {
  const currentSessionId = localStorage.getItem("sessionId");

  channel.onmessage = (event) => {
    if (event.data?.type === "NEW_LOGIN") {
      if (event.data.sessionId !== currentSessionId) {
        onSessionMismatch();
      }
    }
  };
};
