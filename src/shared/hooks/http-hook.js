/* -------------------------------------------------------------------------- */
/*                          CUSTOM HOOK PARA FETCHING                         */
/* -------------------------------------------------------------------------- */

import { useState, useCallback, useRef, useEffect } from "react";
/**
 * useState maneja state del custom hook
 * useCallback evita re-render innecesario o loops infinitos
 * useRef evita la perdida de datos al desmontar el componente
 * useEffect aplica cleanup cuando el componente se desmonte
 */

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  // no se reiniciara a pesar de que el componente que usa esta funcion se monta una y otra vez
  const activeHttpRequest = useRef([])

  const sendRequest = useCallback(
    // recibe url endpoint, metodo pred GET, body pred NULL, headers pred OBJETO VACIO
    async (url, method = "GET", body = null, headers = {}) => {
      // al iniciar se define loading como true
      setIsLoading(true);
      // The AbortController interface represents a controller object that allows you to abort one or more Web requests as and when desired.
      const httpAbortCtrl = new AbortController()
      // ingresa httpAbortCtrl dentro del array activeHttpRequest
      activeHttpRequest.current.push(httpAbortCtrl)
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          // Returns a AbortSignal object instance, which can be used to communicate with/abort a DOM request.
          signal: httpAbortCtrl.signal
        });
        // parses the response (a Promise) as json
        const responseData = await response.json();
        // una vez terminado el request y obtenido un response, elimina el controller empleado
        activeHttpRequest.current = activeHttpRequest.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl)
        
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        // termina la operacion de fetching
        setIsLoading(false);
        return responseData;
      } catch (err) {
        // err.message esta vinculado con el http-error en el backend
        setError(err.message);
        setIsLoading(false);
        throw err
      }
    },
    []
  );

  const clearError = () => {
    setError(null)
  }

  // se ejecuta la funcion antes de montarse y despues de desmontarse, hace cleanup
  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abort())
    }
  }, [])
  /**
   * isLoading: state de carga
   * error: ,
   * sendRequest: ,
   * clearError: 
   */
  return { isLoading, error, sendRequest, clearError };
};
