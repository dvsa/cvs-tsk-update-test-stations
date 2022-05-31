import axios from 'axios-observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { getToken } from './getToken';
import { DynamicsTestStation } from './DynamicsTestStation';
import { DynamicsConnection } from './DynamicsConnection';
import config from '../config';
import logger from '../observability/logger';

const { ceRoleId, ceBaseUrl } = config.crm;

const onRejected = (error: AxiosError) => {
  // Removes bearer token from being logged in the error
  if (error && error.config && error.config.headers) {
    delete error.config.headers;
  }
  return Promise.reject(error);
};

const getModifiedTestStations = async (requestUrl: string): Promise<DynamicsTestStation[]> => {
  logger.debug('getModifiedTestStations starting.');
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  interface AccountsFormat {
    value: DynamicsTestStation[];
  }
  return lastValueFrom(
    axios.get<AccountsFormat>(requestUrl).pipe(
      map((data) => data.data.value),
    ),
  );
};

const getReportRecipientEmails = async (): Promise<DynamicsConnection[]> => {
  logger.debug('getReportRecipientEmails starting.');
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  interface ConnectionsFormat {
    value: DynamicsConnection[];
  }
  const requestUrl = `${ceBaseUrl}/connections?$select=_record2id_value&$expand=record1id_account($select=accountid,accountnumber),record2id_contact($select=emailaddress1)&$filter=_record2roleid_value%20eq%${ceRoleId}%20and%20statuscode%20eq%201`;

  return lastValueFrom(
    axios.get<ConnectionsFormat>(requestUrl).pipe(
      map((data) => data.data.value),
    ),
  );
};

export {
  getModifiedTestStations,
  onRejected,
  getReportRecipientEmails,
};
