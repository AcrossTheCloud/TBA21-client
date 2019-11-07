import * as React from 'react';
import { FaPlay } from 'react-icons/fa';

import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';
import { FileStaticPreview } from '../utils/DetailPreview';
import HighlightItemDetails from './HighlightItemDetails';
import FeedAudioPreview from '../feed/FeedAudioPreview';

export default function HighlightPreview(highlight, onOpenModal, index) {
  if (!highlight.file) return <></>;
  return (
    <div className="detailPreview">
      {highlight.item_type === itemType.Audio ||
      highlight.file.type === FileTypes.Audio ? (
        <FeedAudioPreview
          feedItem={highlight}
          openModal={() => onOpenModal(highlight)}
        />
      ) : (
        [
          <FileStaticPreview file={highlight.file} />,
          <HighlightItemDetails index={index} />
        ]
      )}
      {highlight.file.type === FileTypes.Video && (
        <div className="middle">
          <FaPlay />
        </div>
      )}
    </div>
  );
}
