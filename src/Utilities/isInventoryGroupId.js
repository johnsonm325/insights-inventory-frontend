const STANDARD_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Some environments return 32-char hex group ids without dashes (NonStrictUUID). */
const HEX32 = /^[0-9a-f]{32}$/i;

/* True for UUID / 32-char hex tokens only — these are sent as host list `group_id` (not name filters). */
export const isInventoryGroupId = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  (STANDARD_UUID.test(value) || HEX32.test(value));
