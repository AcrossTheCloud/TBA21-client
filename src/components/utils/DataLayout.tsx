import React from 'react'
import { Col } from 'reactstrap';
import { Item, itemType } from 'types/Item';
import { Collection } from 'types/Collection';

import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { dateFromTimeYearProduced } from '../../actions/home';
import { getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../utils/removeTopology';
import { DetailPreview } from '../utils/DetailPreview';

const DataLayout = (props: { data: Item | Collection, itemModalToggle?: Function, collectionModalToggle?: Function, firstItem?: boolean }): JSX.Element => {
  let response: JSX.Element = <></>;
  if (props.data) {
    if (props.data.__typename === 'item') {
      const data = props.data as Item;

      if (data.item_type === itemType.Audio || (data.file && data.file.type === FileTypes.Audio)) {
        const date = dateFromTimeYearProduced(data.time_produced, data.year_produced);
        response = (
            <AudioPreview
                data={{
                  id: data.id,
                  url: data.file.url,
                  title: data.title ? data.title : '',
                  creators: data.creators ? data.creators : undefined,
                  item_subtype: data.item_subtype ? data.item_subtype : undefined,
                  date: date,
                  isCollection: data.__typename !== 'item'
                }}
                noClick={data.__typename !== 'item'}
            />
        );
      } else {
        response = (
            <DetailPreview
              data={data}
              modalToggle={typeof props.itemModalToggle === 'function' ? props.itemModalToggle : undefined}
              firstItem={props.firstItem}
            />
        );
      }
    } else if (props.data.__typename === 'collection') {
      const data = props.data as Collection;

      if (data.file && data.id) {
        getCollectionsInCollection({id: data.id, limit: 1000, offset: 0}).then(collectionResponse => {
          const collections = [...removeTopology(collectionResponse, 'collection')] as Collection[];
          data.collections = collections.map((collectionItem) => collectionItem.id) as string[];
        });
        getItemsInCollection({id: data.id, limit: 1000, offset: 0}).then(itemResponses => {
          const items = [...removeTopology(itemResponses, 'item')] as Item[];
          data.items = items.map((itemItem) => itemItem.id) as string[];
        });

        response = (
            <DetailPreview
                modalToggle={() => typeof props.collectionModalToggle === 'function' ? props.collectionModalToggle(data) : undefined}
                data={{
                  file: data.file,
                  id: data.id,
                  title: data.title ? data.title : '',
                  s3_key: '',
                  year_produced: data.year_produced ? data.year_produced : '',
                  time_produced: data.time_produced ? data.time_produced : '',
                  creators: data.creators ? data.creators : [],
                  regions: data.regions ? data.regions : [],
                  // tslint:disable-next-line:no-any
                  items: data.items as any || [],
                  // tslint:disable-next-line:no-any
                  collections: data.collections as any || [],
                  // Collection specific
                  count: data.count ? data.count : 0,
                  type: data.type ? data.type : undefined,
                  concept_tags: [],
                  keyword_tags: [],
                  oa_highlight_order: data.oa_highlight_order ? data.oa_highlight_order : 0

                }}
            />
        );
      }
    }
  }

  return (
    <Col
        md={!!props.data && !!props.data.file && (props.data.file.type === 'Audio' || props.firstItem) ? '12' : '4'}
        className="pt-4"
    >
      {response}
    </Col>
  );
};

export default DataLayout
