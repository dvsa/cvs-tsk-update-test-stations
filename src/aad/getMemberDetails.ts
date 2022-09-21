import axios, { AxiosError } from 'axios';
import { URL } from 'url';
import logger from '../observability/logger';
import MemberDetails from './MemberDetails';
import config from '../config';
import getToken from './getToken';

interface MemberList{
  value: MemberDetails[]
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
  const requestUrl = new URL(`/v1.0/groups/${config.aad.groupId}/members`, aadBase).href;

  logger.info('Trying to get aad member list');
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  const response = await axios.get<MemberList>(requestUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  return response.data.value;
};
