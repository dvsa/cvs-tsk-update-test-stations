export default interface IMemberDetails {
  /** The type this member details object, such as '#microsoft.graph.user'.
   * From the docs:
   * A group can have users, organizational contacts, devices, service principals and other groups as members
   */
  '@odata.type': MemberType | string;

  /** Unique identifier */
  id: string;

  businessPhones: string[] | null;
  displayName: string | null;
  givenName: string | null;
  jobTitle: string | null;
  mail: string | null;
  mobilePhone: string | null;
  officeLocation: string | null;
  preferredLanguage: string | null;
  surname: string | null;
  userPrincipalName: string | null;
}

export enum MemberType {
  User = '#microsoft.graph.user',
}
