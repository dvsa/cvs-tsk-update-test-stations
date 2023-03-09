import { Axios, AxiosError, AxiosRequestHeaders } from 'axios';
import config from '../../src/config';
import { getMemberDetails } from '../../src/aad/getMemberDetails';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* tslint:disable */
var mockAxios: Axios;
var mockAxiosOnReject: jest.Mock;
var mockToken: jest.Mock;
var mockAxiosGet: jest.Mock;
/* tslint:enable */

jest.mock('../../src/aad/getToken', () => {
  mockToken = jest.fn().mockResolvedValue('testToken');
  return mockToken;
});

jest.mock('axios', () => {
  mockAxiosGet = jest.fn().mockResolvedValue({ data: { value: {} } });
  mockAxiosOnReject = jest.fn();
  mockAxios = {
    interceptors: {
      response: { use: mockAxiosOnReject },
    },
    defaults: { headers: { common: { Authorization: '' } } },
    get: mockAxiosGet,
  } as unknown as Axios;
  return mockAxios;
});

const error: AxiosError = {
  name: 'AxiosError',
  message: 'TestError',
  config: {
    headers: {
      Authorization: 'test',
    } as AxiosRequestHeaders,
  },
  isAxiosError: true,
  toJSON: () => ({
    name: 'name',
  }),
};

describe('getMemberDetails', () => {
  describe('axiosInterceptorOnReject', () => {
    it('should remove headers on reject', async () => {
      let hitCatch = false;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await mockAxiosOnReject.mock.calls[0][1](error);
      } catch (_error) {
        hitCatch = true;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(_error.config.headers.Authorization).toEqual('[sensitive]');
      } finally {
        expect(hitCatch).toBeTruthy();
      }
    });
  });

  beforeEach(() => {
    config.aad.groupId = 'testGroup';
    config.aad.baseUrl = 'https://test';
    mockAxios.defaults.headers.common.Authorization = '12345';
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
    expect(mockAxiosGet).toBeCalledWith('https://test/v1.0/groups/testGroup/members', {
      headers: { Authorization: 'Bearer testToken' },
    });
  });

  it('should get details from the correct urls if multiple groups given', async () => {
    config.aad.groupId = 'testGroup1, testGroup2, testGroup3, testGroup4, testGroup5, testGroup6';
    await getMemberDetails();
    expect(mockAxiosGet).toBeCalledTimes(6);
    expect(mockAxiosGet).toHaveBeenLastCalledWith('https://test/v1.0/groups/testGroup6/members', {
      headers: { Authorization: 'Bearer testToken' },
    });
  });
});
