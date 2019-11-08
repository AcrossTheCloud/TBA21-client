import * as React from 'react';
import { FaCircle } from 'react-icons/fa';
import dateFromTimeYearProduced from '../utils/date-from-time-year-produced';
import { HomepageData } from '../../types/Home';

export default function HighlightItemDetails(props: { highlight: HomepageData, openModal: Function }) {
  const { highlight, openModal } = props;
  const tags = highlight.concept_tags;
  const creators = !!highlight.creators ? highlight.creators : [];

  return (
    <>
      <div
        className="title-wrapper d-flex"
        onClick={() => openModal(highlight)}
      >
        {creators && creators.length
          ? <>
              <div className="creators">
                {creators[0]}
                {creators.length > 1 ? <em>, et al.</em> : <></>}
              </div>
              <div className="d-none d-md-block dotwrap">
                <FaCircle className="dot" />
              </div>
            </>
          : null}
        <div className="title" onClick={() => openModal(highlight)}>
          {highlight.title}
        </div>
      </div>
      <div className="type" onClick={() => openModal(highlight)}>
        {highlight.item_subtype},
        {dateFromTimeYearProduced(
          highlight.time_produced,
          highlight.year_produced
        )}
      </div>
      {!!tags && tags.length ? (
        <div className="tags d-none d-lg-block">
          {tags
            .map(t => `#${t}`)
            .join(' ')
            .toString()}
        </div>
      ) : null}
    </>
  );
}
