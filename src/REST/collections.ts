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

export const getCollectionsInCollection = async (queryStringParameters: Object = {}) => {
  const response = await API.get('tba21', 'collections/getCollectionsInCollection', { queryStringParameters });
  return response.data;
};

export const getCollections = async (queryStringParameters: Object = {}) => {
  const response = await API.get('tba21', 'collections', { queryStringParameters })
  return response.data
}

/*
 * ADMIN FUNCTIONS
 */
export const adminGet = async (isContributorPath: boolean = true, queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', `${ isContributorPath ? 'contributor/collections/get' :  'admin/collections/get' }`, { queryStringParameters: queryStringParameters });
  return response.data;
};

export const adminDel = async (id: string) => {
  return await API.del('tba21', 'admin/collections', { queryStringParameters: { id } });
};
