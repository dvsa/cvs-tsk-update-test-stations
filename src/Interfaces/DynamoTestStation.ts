import { DynamicsTestStation } from './DynamicsTestStation';

interface DynamoTestStation {
  testStationId: string;
  testStationAccessNotes: string;
  testStationAddress: string;
  testStationContactNumber: string;
  testStationEmails: string;
  testStationGeneralNotes: string;
  testStationLongitude: string;
  testStationLatitude: string;
  testStationName: string;
  testStationPNumber: string;
  testStationPostcode: string;
  testStationStatus: string;
  testStationTown: string;
  testStationType: string;
}

const TestStationType = new Map<number, string>([
  [147160000, 'ATF'],
  [147160001, 'IVA & ATF'],
  [147160002, 'IVA'],
]);

const TestStationStatus = new Map<number, string>([
  [147160000, 'Pending'],
  [147160001, 'Active'],
  [147160002, 'Suspended'],
  [147160003, 'Termination Requested'],
  [147160004, 'Terminated'],
]);

function createDynamoTestStation(obj: DynamicsTestStation): DynamoTestStation {
  return {
    testStationId: obj.accountid,
    testStationAccessNotes: null,
    testStationAddress: obj.address1_line1 + obj.address1_line2,
    testStationContactNumber: obj.telephone1,
    testStationEmails: obj.emailaddress1,
    testStationGeneralNotes: obj.dvsa_openingtimes || null,
    testStationLongitude: obj.address1_longitude,
    testStationLatitude: obj.address1_latitude,
    testStationName: obj.name,
    testStationPNumber: obj.dvsa_premisecodes,
    testStationPostcode: obj.address1_postalcode,
    testStationStatus: TestStationStatus.get(obj.dvsa_accountstatus),
    testStationTown: obj.address1_city,
    testStationType: TestStationType.get(obj.dvsa_testfacilitytype),
  };
}

export { DynamoTestStation, createDynamoTestStation };
