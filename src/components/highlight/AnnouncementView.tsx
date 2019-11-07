import * as React from 'react';
import { Announcement } from '../../types/Announcement';

const AnnouncementView = (props: {
  announcements: Announcement[];
}): JSX.Element => {
  return (
    <div className="announcement pt-4 pt-lg-5">
      <div className="type">Announcement</div>
      <div className="title">{props.announcements[0].title}</div>
      <div className="description">{props.announcements[0].description}</div>
      {!!props.announcements[0].url && (
        <div>
          <a
            href={props.announcements[0].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
            <img
              className="pl-2"
              src="../../../assets/custom/more.svg"
              alt="read more"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default AnnouncementView;
