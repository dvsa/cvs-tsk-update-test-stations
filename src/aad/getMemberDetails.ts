import axios, { AxiosError } from 'axios';
import { URL } from 'url';
import logger from '../observability/logger';
import MemberDetails from './MemberDetails';
import config from '../config';
import getToken from './getToken';

interface MemberList {
  value: MemberDetails[];
}

const onRejected = (error: AxiosError) => {
  // Removes bearer token from being logged in the error
  if (error && error.config && error.config.headers && error.config.headers.Authorization) {
    error.config.headers.Authorization = '[sensitive]';
  }
  return Promise.reject(error);
};

axios.interceptors.response.use((response) => response, onRejected);

export const getMemberDetails = async (): Promise<MemberDetails[]> => {
  const aadBase = config.aad.baseUrl;
  const groupIds = config.aad.groupId.includes(',') ? config.aad.groupId.split(',') : [config.aad.groupId];
  const accessToken = await getToken();

  const promiseArray = groupIds.map(async (groupId) => {
    const requestUrl = new URL(`/v1.0/groups/${groupId.trim()}/members`, aadBase).href;

    logger.info(`Trying to get aad member list for group: ${groupId.trim()}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    const response = await axios.get<MemberList>(requestUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data.value;
  });

  const results = await Promise.allSettled(promiseArray);

  const memberDetails: MemberDetails[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      memberDetails.concat(result.value);
    } else {
      logger.error(`Error getting member details: ${result.reason}`);
    }
  });

  return memberDetails;
};
