import * as React from 'react';
import { HomepageData } from '../../types/Home';
import dateFromTimeYearProduced from '../utils/date-from-time-year-produced';
import AudioPreview from '../layout/audio/AudioPreview';

const FeedAudioPreview = (props: {
  feedItem: HomepageData;
  openModal?: Function;
}): JSX.Element => {
  const { feedItem, openModal } = props;
  const {
    id,
    count,
    item_subtype,
    title,
    file,
    creators,
    year_produced,
    time_produced
  } = feedItem;

  const isCollection = !!count;

  const audioProp = {
    title,
    id,
    url: file.url,
    date: dateFromTimeYearProduced(time_produced, year_produced),
    creators,
    item_subtype,
    isCollection
  };

  return (
    <>
      {!!count && count > 0 ? (
        <div
          onClick={() =>
            typeof openModal === 'function' ? openModal(feedItem) : false
          }
        >
          <AudioPreview noClick data={audioProp} />
        </div>
      ) : (
        <AudioPreview data={audioProp} />
      )}
    </>
  );
};

export default FeedAudioPreview;
