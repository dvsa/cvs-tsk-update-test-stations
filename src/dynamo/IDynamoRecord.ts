export default interface IDynamoRecord {
  /** The reference data resource type - for Testers this alway ResourceType.User */
  resourceType: string;

  /** The Active Directory object identifier (GUID) */
  resourceKey: string;

  /** The user's display name */
  name?: string;

  /** The user's email address */
  email?: string;

  /** The time at which this record will expire */
  ttl?: number;
}

export enum ResourceType {
  User = 'USER',
}
