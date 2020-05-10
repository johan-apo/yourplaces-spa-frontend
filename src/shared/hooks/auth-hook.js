import { useEffect, useState, useCallback } from "react";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, expirationDate) => {
    // previene re-render innecesario
    setToken(token);
    setUserId(uid);
    const tokenExpirationDate = // scoping solo en login!!!
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // actual time + time left to expire = time when expire
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userDta",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString, // evita la perdida de info al transformar en string, permite la conversion a Date
      })
    );
    setUserId(uid);
  }, []);

  const logout = useCallback(() => {
    // previene re-render innecesario
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date() // time when expires vs current time
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]); // solo correra cuando el componente se renderice

  return { token, login, logout, userId };
};
