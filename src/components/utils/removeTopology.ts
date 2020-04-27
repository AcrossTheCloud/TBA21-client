import { Item } from '../../types/Item';
import { Collection } from '../../types/Collection';

export function removeTopology(data: any, type?: 'item' | 'collection'): Item[] | Collection[] { // tslint:disable-line: no-any
  const geometries = data.objects.output.geometries;
  const response: Item[] | Collection[] = geometries.map( e => e.properties );

  // Add the type to the data
  if (type) {
    response.forEach(i => Object.assign(i, { __typename: type }));
  }

  return response;
}
