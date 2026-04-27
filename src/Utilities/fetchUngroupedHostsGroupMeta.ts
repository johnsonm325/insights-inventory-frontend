import { ApiGroupGetGroupListGroupTypeEnum } from '@redhat-cloud-services/host-inventory-client/ApiGroupGetGroupList';
import { getGroupList } from '../api/hostInventoryApiTyped';

export type UngroupedHostsGroupMeta = { id: string; hostCount?: number };

export async function fetchUngroupedHostsGroupMeta(): Promise<
  UngroupedHostsGroupMeta | undefined
> {
  const data = await getGroupList({
    groupType: ApiGroupGetGroupListGroupTypeEnum.UngroupedHosts,
    page: 1,
    perPage: 1,
  });
  const first = data?.results?.[0];
  if (!first?.id) return undefined;
  return {
    id: first.id,
    hostCount:
      typeof first.host_count === 'number' ? first.host_count : undefined,
  };
}
