import axios, { AxiosError } from 'axios';
import { URL } from 'url';
import config from '../config';
import logger from '../observability/logger';
import IMemberDetails, { MemberType } from './IMemberDetails';
import getToken from './getToken';

interface MemberList {
  value: IMemberDetails[];
}

const onRejected = (error: AxiosError) => {
  // Removes bearer token from being logged in the error
  if (error && error.config && error.config.headers && error.config.headers.Authorization) {
    error.config.headers.Authorization = '[sensitive]';
  }
  return Promise.reject(error);
};

axios.interceptors.response.use((response) => response, onRejected);

export const getMemberDetails = async (): Promise<IMemberDetails[]> => {
  const aadBase = config.aad.baseUrl;
  const groupIds = config.aad.groupId.includes(',') ? config.aad.groupId.split(',') : [config.aad.groupId];

  const accessToken = await getToken();

  const promiseArray = groupIds.map(async (groupId) => {
    const requestUrl = new URL(
      `/v1.0/groups/${groupId.trim()}/members?$count=true&$filter=accountEnabled eq true`,
      aadBase,
    ).href;

    logger.info(`Trying to get aad member list for group: ${groupId.trim()}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    const response = await axios.get<MemberList>(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}`, ConsistencyLevel: 'eventual' },
    });
    return response.data.value;
  });

  const results = await Promise.allSettled(promiseArray);

  let memberDetails = results.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      acc = [...acc, ...result.value];
    } else {
      logger.error(`Error getting member details: ${result.reason}`);
    }
    return acc;
  }, [] as IMemberDetails[]);

  // filter the members by type if a type is specified
  if (config.aad.filterGroupToUsersOnly) {
    memberDetails = memberDetails.filter((member) => member['@odata.type'] === MemberType.User);
  } else {
    // ensure we only return members we can actually use
    //  they need an id and either a mail or a userPrincipalName
    memberDetails = memberDetails.filter((member) => member.id && (member.mail || member.userPrincipalName));
  }

  // return the unique members by id
  return memberDetails.filter((member, index, self) => index === self.findIndex((m) => m.id === member.id));
};
