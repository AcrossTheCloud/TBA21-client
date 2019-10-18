import { API } from 'aws-amplify';
import { TopoJSON } from 'topojson-specification';

export const getItems = async (queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', `items/get`, { queryStringParameters });
  return response.data;
};
export const getItem = async (queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', `items/getItem`, { queryStringParameters });
  return response.data;
};

/*
 * ADMIN FUNCTIONS
 */
export const adminGetItems = async (queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', `admin/items`, { queryStringParameters });
  return response.data;
};

export const adminGetItem = async (isContributorPath: boolean = false, queryStringParameters: {s3Key: string}): Promise<TopoJSON> => {
  const response = await API.get('tba21', (isContributorPath ? 'contributor/items/getItem' : 'admin/items/getItemNC'), { queryStringParameters });
  return response.data;
};

/*
 * CONTRIBUTOR FUNCTIONS
 */
export const contributorGetByPerson = async (queryStringParameters: Object = {}): Promise<TopoJSON> => {
  const response = await API.get('tba21', 'contributor/items/getByPerson', { queryStringParameters });
  return response.data;
};
