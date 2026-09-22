import { cookies } from "next/headers";
import { getServerUserFromToken, checkUserPermission } from "@/lib/auth";
import { getStoreSettings, DEFAULT_SETTINGS } from "@/shared/api/settings";
import { Permissions } from "@/features/roles/types";
import { User } from "@/types";

export interface MaintenanceState {
  isMaintenance: boolean;
  canBypassMaintenance: boolean;
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const user = token ? getServerUserFromToken(token) : null;

  const canBypassMaintenance = checkUserPermission(user as User, [
    Permissions.UPDATE_SETTINGS,
    Permissions.VIEW_SETTINGS,
    Permissions.ACCESS_DASHBOARD,
  ]);

  const settings = (await getStoreSettings()) || DEFAULT_SETTINGS;
  const isMaintenance = settings.maintenanceMode === true;

  return { isMaintenance, canBypassMaintenance };
}
