import { useState, useEffect, useCallback } from "react";

async function sendHttpRequest(url, config) {
  const response = await fetch(url, config);

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Something went wrong, Request Failed");
  }

  return resData;
}

export default function useHttp(url, config, initialData) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState();

  const sendRequest = useCallback(
    async function sendRequest(data) {
      setIsLoading(true);
      try {
        const resData = await sendHttpRequest(url, { ...config, body: data });
        setData(resData);
      } catch (error) {
        setError(error.message || "Something went wrong");
      }
      setIsLoading(false);
    },
    [url, config]
  );

  useEffect(() => {
    if (!config || (config && (config.method === "GET" || !config.method))) {
      // specific to this app where we send get request everytime the hook is used
      sendRequest();
    }
  }, [sendRequest, config]);

  function clearData() {
    setData(initialData);
  }

  return { isLoading, data, error, sendRequest, clearData };
}
