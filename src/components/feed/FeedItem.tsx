import * as React from 'react';
import { Col } from 'reactstrap';

import { HomepageData } from '../../types/Home';
import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';
import FeedAudioPreview from './FeedAudioPreview';

import { DetailPreview } from '../utils/DetailPreview';

const colSize = (fileType: string): number => {
  switch (fileType) {
    case 'Audio':
      return 12;

    case 'Video':
      return 8;

    default:
      return 4;
  }
};

const FeedItem = (props: {
  item: HomepageData;
  loadCount: number;
  onOpenModal: Function;
  onLoad: (count: number) => void;
}): JSX.Element => {
  const { item, onOpenModal, onLoad, loadCount } = props;
  const { file, item_type } = item;

  if (!file) return <></>;

  return (
    <Col lg={colSize(!!file ? file.type : '')} className="pt-4">
      {item_type === itemType.Audio || file.type === FileTypes.Audio ? (
        <FeedAudioPreview feedItem={item} openModal={() => onOpenModal(item)} />
      ) : (
        <div onClick={() => onOpenModal(item)}>
          <DetailPreview data={item} onLoad={() => onLoad(loadCount - 1)} />
        </div>
      )}
    </Col>
  );
};

export default FeedItem;
