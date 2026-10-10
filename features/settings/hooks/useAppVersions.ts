import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appVersionsApi, AppPlatform, AppVersionPolicyInput } from "../api";

const KEY = ["app-versions"] as const;

/** Update policy of both mobile platforms (needs VIEW_SETTINGS). */
export function useAppVersions() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await appVersionsApi.getAll()).data,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Installs per app version; refreshed on focus (devices register all day). */
export function useAppVersionStats() {
  return useQuery({
    queryKey: [...KEY, "stats"],
    queryFn: async () => (await appVersionsApi.getStats()).data,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateAppVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      platform: AppPlatform;
      data: AppVersionPolicyInput;
    }) => (await appVersionsApi.update(vars.platform, vars.data)).data,
    // Policies and the required/optional split of the stats both change.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

/** Pushes "a new version is available" to the platform (SEND_NOTIFICATION). */
export function useAnnounceAppUpdate() {
  return useMutation({
    mutationFn: (platform: AppPlatform) => appVersionsApi.announce(platform),
  });
}
