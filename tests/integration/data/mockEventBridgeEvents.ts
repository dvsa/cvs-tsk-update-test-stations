import config from '../../../src/config';
import { DynamoTestStation } from '../../../src/crm/DynamoTestStation';
import { Entries } from '../../../src/eventbridge/Entries';
import { EventEntry } from '../../../src/eventbridge/EventEntry';

export const GetExpectedEvent = (i: number): Entries => {
  switch (i) {
    case 1:
      return <Entries>{
        Entries: [
          <EventEntry>{
            Source: config.aws.eventBusSource,
            Detail: JSON.stringify(<DynamoTestStation>{
              testStationId: 'SITE-1-id',
              testStationAccessNotes: null,
              testStationAddress: 'SITE-1 address 1, SITE-1 address 2',
              testStationContactNumber: 'SITE-1 telephone',
              testStationEmails: ['email@email.co.uk', 'email2@email.co.uk', 'email3@email.co.uk'],
              testStationGeneralNotes: 'SITE-1 opening times',
              testStationLongitude: '1',
              testStationLatitude: '1',
              testStationName: 'SITE-1 name',
              testStationPNumber: 'SITE-1',
              testStationPostcode: 'SITE-1 postcode',
              testStationStatus: 'active',
              testStationTown: 'SITE-1 city',
              testStationType: 'atf',
            }),
            DetailType: 'CVS ATF Test Station',
            EventBusName: config.aws.eventBusName,
            Time: new Date(),
          },
        ],
      };
    case 2:
      return <Entries>{
        Entries: [
          <EventEntry>{
            Source: config.aws.eventBusSource,
            Detail: JSON.stringify(<DynamoTestStation>{
              testStationId: 'SITE-2-id',
              testStationAccessNotes: null,
              testStationAddress: 'SITE-2 address 1, SITE-2 address 2',
              testStationContactNumber: 'SITE-2 telephone',
              testStationEmails: ['email@email.co.uk'],
              testStationGeneralNotes: 'SITE-2 opening times',
              testStationLongitude: '2',
              testStationLatitude: '2',
              testStationName: 'SITE-2 name',
              testStationPNumber: 'SITE-2',
              testStationPostcode: 'SITE-2 postcode',
              testStationStatus: 'pending',
              testStationTown: 'SITE-2 city',
              testStationType: 'gvts',
            }),
            DetailType: 'CVS ATF Test Station',
            EventBusName: config.aws.eventBusName,
            Time: new Date(),
          },
        ],
      };
    case 3:
      return <Entries>{
        Entries: [
          <EventEntry>{
            Source: config.aws.eventBusSource,
            Detail: JSON.stringify(<DynamoTestStation>{
              testStationId: 'SITE-3-id',
              testStationAccessNotes: null,
              testStationAddress: 'SITE-3 address 1, SITE-3 address 2',
              testStationContactNumber: 'SITE-3 telephone',
              testStationEmails: ['email@email.co.uk', 'email2@email.co.uk'],
              testStationGeneralNotes: 'SITE-3 opening times',
              testStationLongitude: '3',
              testStationLatitude: '3',
              testStationName: 'SITE-3 name',
              testStationPNumber: 'SITE-3',
              testStationPostcode: 'SITE-3 postcode',
              testStationStatus: 'suspended',
              testStationTown: 'SITE-3 city',
              testStationType: 'potf',
            }),
            DetailType: 'CVS ATF Test Station',
            EventBusName: config.aws.eventBusName,
            Time: new Date(),
          },
        ],
      };
    default:
      return <Entries>{};
  }
};
