import { AxiosResponse } from 'axios';
import { DynamicsConnections } from '../../../src/crm/DynamicsConnections';
// import { DynamicsConnections } from '../../../src/crm/DynamicsConnections';

export const MOCK_DYNAMICS_CONNECTIONS_RESPONSE: AxiosResponse[] = [
  {
    data: {
      value: [
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email@email.co.uk',
            contactid: 'string',
          },
        },
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email2@email.co.uk',
            contactid: 'string',
          },
        },
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email3@email.co.uk',
            contactid: 'string',
          },
        },
      ],
    },
    status: 200,
    statusText: 'Ok',
    headers: {
      Authorization: '',
    },
    config: {},
  },
  {
    data: {
      value: [
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email@email.co.uk',
            contactid: 'string',
          },
        },
      ],
    },
    status: 200,
    statusText: 'Ok',
    headers: {
      Authorization: '',
    },
    config: {},
  },
  {
    data: {
      value: [
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email@email.co.uk',
            contactid: 'string',
          },
        },
        <DynamicsConnections>{
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email2@email.co.uk',
            contactid: 'string',
          },
        },
      ],
    },
    status: 200,
    statusText: 'Ok',
    headers: {
      Authorization: '',
    },
    config: {},
  },

];
