import * as React from 'react';
import { FaPlay } from 'react-icons/fa';

import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';
import { FileStaticPreview } from '../utils/DetailPreview';
import HighlightItemDetails from './HighlightItemDetails';
import FeedAudioPreview from '../feed/FeedAudioPreview';
import { HomepageData } from '../../types/Home';

export default function HighlightPreview(props: { highlight: HomepageData, openModal: Function, index: number }) {
  const { highlight, openModal } = props;

  if (!highlight.file) { return <></>; }

  return (
    <div className="detailPreview">
      {highlight.item_type === itemType.Audio ||
      highlight.file.type === FileTypes.Audio ? (
        <FeedAudioPreview
          feedItem={highlight}
          openModal={() => openModal(highlight)}
        />
      ) : (
        <>
          <FileStaticPreview file={highlight.file} />
          <HighlightItemDetails
            highlight={highlight}
            openModal={openModal}
          />
        </>
      )}
      {highlight.file.type === FileTypes.Video && (
        <div className="middle">
          <FaPlay />
        </div>
      )}
    </div>
  );
}
