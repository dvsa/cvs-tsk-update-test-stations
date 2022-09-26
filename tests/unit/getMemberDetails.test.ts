import { Axios } from 'axios';
import config from '../../src/config';
import { getMemberDetails } from '../../src/aad/getMemberDetails';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* eslint-disable no-var */
var mockAxios: Axios;
var mockToken:jest.Mock;
var mockAxiosGet:jest.Mock;
/* eslint-enable no-var */

jest.mock('../../src/aad/getToken', () => {
  mockToken = jest.fn().mockResolvedValue('testToken');
  return mockToken;
});

jest.mock('axios', () => {
  mockAxiosGet = jest.fn().mockResolvedValue({ data: { value: {} } });
  mockAxios = <Axios><unknown>{
    interceptors: {
      response: { use: jest.fn() },
    },
    defaults: { headers: { common: { Authorization: '' } } },
    get: mockAxiosGet,
  };
  return mockAxios;
});

describe('getMemberDetails', () => {
  beforeEach(() => {
    config.aad.groupId = 'testGroup';
    config.aad.baseUrl = 'https://test';
    mockAxios.defaults.headers.common.Authorization = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getToken', async () => {
    await getMemberDetails();
    expect(mockToken).toBeCalledTimes(1);
  });

  it('should get details from the correct url', async () => {
    await getMemberDetails();
    expect(mockAxiosGet).toBeCalledWith('https://test/v1.0/groups/testGroup/members', { headers: { Authorization: 'Bearer testToken' } });
  });
});
