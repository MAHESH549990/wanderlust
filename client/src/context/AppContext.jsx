import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mapToken, setMapToken] = useState("");
  const [notice, setNotice] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    api("/api/bootstrap").then((data) => {
      setUser(data.user);
      setMapToken(data.mapToken);
      const message = data.success?.[0] || data.error?.[0];
      if (message) setNotice({ message, type: data.error?.length ? "error" : "success" });
    }).catch(() => {}).finally(() => setSessionLoading(false));
  }, []);

  const notify = useCallback((message, type = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 4200);
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    mapToken,
    sessionLoading,
    notice,
    notify,
  }), [user, mapToken, sessionLoading, notice, notify]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
