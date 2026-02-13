import { useMutation } from "@tanstack/react-query";

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async (accepted: boolean) => {
      // Static site: no backend - optionally persist to localStorage
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "valentine-response",
          JSON.stringify({ accepted, timestamp: new Date().toISOString() })
        );
      }
      return { id: 1, accepted, timestamp: new Date() };
    },
  });
}
