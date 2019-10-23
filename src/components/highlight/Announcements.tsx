import * as React from 'react';

export default function Announcements(news) {
  if (!news) return;
  return (
    <div className="announcement pt-4 pt-lg-5">
      <div className="type">Announcement</div>
      <div className="title">{news[0].title}</div>
      <div className="description">{news[0].description}</div>
      {!!news[0].url ? (
        <div>
          <a href={news[0].url} target="_blank" rel="noopener noreferrer">
            View
            <img src="../../../public/assets/custom/more.svg" />
          </a>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
