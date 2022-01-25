import axios from 'axios-observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { getToken } from './getToken';
import { DynamicsTestStation } from '../Interfaces/DynamicsTestStation';

import { DynamoTestStation, createDynamoTestStation } from '../Interfaces/DynamoTestStation';

const onRejected = (error: AxiosError) => {
  // Removes bearer token from being logged in the error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete error?.config?.headers;
  return Promise.reject(error);
};

const getTestStationEntities = async (requestUrl: string): Promise<DynamoTestStation[]> => {
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  interface ApiFormat {
    value: DynamicsTestStation[]
  }

  return lastValueFrom(
    axios.get<ApiFormat>(requestUrl).pipe(
      map((data) => data.data),
      map((data: ApiFormat) => data.value.map((obj) => createDynamoTestStation(obj))),
    ),
  );
};

export { getTestStationEntities, onRejected };
