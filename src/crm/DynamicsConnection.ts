interface DynamicsConnection {
  '@odata.etag': string;
  _record2id_value: string;
  connectionid: string;
  record1id_account: {
    accountid: string;
    accountnumber: string;
  };
  record2id_contact: {
    emailaddress1: string;
    contactid: string;
  };
}
export { DynamicsConnection };
