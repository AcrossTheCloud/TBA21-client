import { Item } from '../../types/Item';
import { Collection } from '../../types/Collection';

export function removeTopology(data: any): Item[] | Collection[] { // tslint:disable-line: no-any
  const geometries = data.objects.output.geometries;
  return geometries.map( e => e.properties );
}
