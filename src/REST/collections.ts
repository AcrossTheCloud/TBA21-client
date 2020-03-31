import { API } from 'aws-amplify';
import { TopoJSON } from 'topojson-specification';

export const getById = async (id: string) => {
  const response = await API.get('tba21', 'collections/getById', { queryStringParameters: { id } });
  return response.data;
};

export const getItemsInCollection = async (queryStringParameters: Object = {}) => {
  const response = await API.get('tba21', 'collections/getItemsInCollection', { queryStringParameters });
  return response.data;
};

export const getCollectionByUuid = async (uuid: string) => {
  const response = await API.get('tba21', 'collections/getByPerson', { queryStringParameters: { uuid } });
  return response.data;
};

/*
 * ADMIN FUNCTIONS
 */
export const adminGet = async (isContributorPath: boolean, queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', `${ isContributorPath ? 'contributor/collections/get' :  'admin/collections/get' }`, { queryStringParameters: queryStringParameters });
  return response.data;
};

export const adminDel = async (id: string) => {
  return await API.del('tba21', 'admin/collections', { queryStringParameters: { id } });
};
