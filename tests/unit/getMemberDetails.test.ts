import { Axios, AxiosError, AxiosRequestHeaders } from 'axios';
import IMemberDetails, { MemberType } from '../../src/aad/IMemberDetails';
import { getMemberDetails } from '../../src/aad/getMemberDetails';
import config from '../../src/config';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* tslint:disable */
var mockAxios: Axios;
var mockAxiosOnReject: jest.Mock;
var mockToken: jest.Mock;
var mockAxiosGet: jest.Mock;
/* tslint:enable */

const generateUser = (id: string, mail?: string, userPrincipalName?: string) =>
  ({
    '@odata.type': MemberType.User,
    id,
    mail: mail || `${id}@example.com`,
    userPrincipalName: userPrincipalName || `${id}@example-test.com`,
  } as IMemberDetails);

jest.mock('../../src/aad/getToken', () => {
  mockToken = jest.fn().mockResolvedValue('testToken');
  return mockToken;
});

jest.mock('axios', () => {
  mockAxiosGet = jest.fn().mockResolvedValue({ data: { value: [{}] } });
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
    expect(mockAxiosGet).toBeCalledWith(
      'https://test/v1.0/groups/testGroup/members?$count=true&$filter=accountEnabled%20eq%20true',
      {
        headers: { Authorization: 'Bearer testToken', ConsistencyLevel: 'eventual' },
      },
    );
  });

  it('should get details from the correct urls if multiple groups given', async () => {
    config.aad.groupId = 'testGroup1, testGroup2, testGroup3, testGroup4, testGroup5, testGroup6';
    await getMemberDetails();
    expect(mockAxiosGet).toBeCalledTimes(6);
    expect(mockAxiosGet).toHaveBeenLastCalledWith(
      'https://test/v1.0/groups/testGroup6/members?$count=true&$filter=accountEnabled%20eq%20true',
      {
        headers: { Authorization: 'Bearer testToken', ConsistencyLevel: 'eventual' },
      },
    );
  });

  it('should return a distinct list of members by id if the same member is in multiple groups', async () => {
    config.aad.groupId = 'testGroup1, testGroup2';
    mockAxiosGet.mockResolvedValueOnce({
      data: { value: [generateUser('1-inGroup1'), generateUser('2-inBothGroups')] },
    });
    mockAxiosGet.mockResolvedValueOnce({
      data: { value: [generateUser('2-inBothGroups'), generateUser('3-inGroup2')] },
    });
    const result = await getMemberDetails();
    expect(result).toHaveLength(3);
  });

  it('should filter out members that are not users', async () => {
    config.aad.groupId = 'testGroup1';
    const members = [
      generateUser('a62188fb-a6dc-4a8a-8882-c155130d6a56'),
      { id: '07299098-5955-4de0-be5f-cba7337f30de', '@odata.type': '#microsoft.graph.device' },
      generateUser('7a86586e-8eb5-46a0-b3a1-f957b03aa7af'),
    ];

    mockAxiosGet.mockResolvedValueOnce({
      data: { value: members },
    });

    const result = await getMemberDetails();
    expect(result).toHaveLength(2);
  });
});
