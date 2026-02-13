import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async (accepted: boolean) => {
      const data = { accepted };
      const validated = api.response.create.input.parse(data);
      const res = await apiRequest("POST", api.response.create.path, validated);
      return api.response.create.responses[201].parse(await res.json());
    },
  });
}
