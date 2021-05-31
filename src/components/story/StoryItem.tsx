import React from "react";
import { Link } from "react-router-dom";

const StoryItem = ({
  slug,
  title,
  author,
  body,
  date,
  tags,
  categories,
  imageURL,
}) => (
  <div className="stories-item">
    <div className="stories-item-content">
      <div className="stories-item-content__texts">
        <Link to={`/story/${slug}`} className="stories-item__title">
          {title}
        </Link>
        <p className="stories-item__author">{author}</p>
        <div
          className="stories-item__body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
      <div className="stories-item-content__image">
        <Blob src={imageURL} />
      </div>

      {/* <div className="stories-item-content__image">
        <img src="https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg"></img>
      </div> */}
    </div>
    <div className="stories-item-meta">
      <div>
        <span>Essay</span> ~ <span>{date}</span>
      </div>
      {tags.length > 0 ? (
        <div>
          Concept tags:{" "}
          {tags.map((tag, idx) => (
            <>
              <Link className="stories-item-link" to={`/stories/tag/${tag}`}>
                {tag}
              </Link>
              {idx === tags.length - 1 ? null : <span>, </span>}
            </>
          ))}
        </div>
      ) : null}
      {categories.length > 0 ? (
        <div>
          Concept categories:{" "}
          {categories.map((category, idx) => (
            <>
              <Link
                className="stories-item-link"
                to={`/stories/tag/${category}`}
              >
                {category}
              </Link>
              {idx === categories.length - 1 ? null : <span>, </span>}
            </>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const Blob = ({ src }) => {
  return (
    <svg
      preserveAspectRatio="xMinyMin meet"
      width="183"
      height="187"
      viewBox="0 0 183 187"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M83.0351 0.0619523C110.274 -0.859365 137.37 8.447 155.654 31.2145C175.415 55.8202 188.648 89.6376 180.613 121.563C172.905 152.186 144.808 167.91 118.403 179.223C95.3347 189.106 70.2979 190.363 48.0335 178.364C25.6922 166.323 9.17233 144.077 3.03175 117.044C-3.32247 89.0693 0.0420799 58.8215 15.6846 35.9489C31.6326 12.6295 56.9193 0.945295 83.0351 0.0619523Z"
        fill="url(#pattern0)"
      />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0"
            transform="translate(-0.270479) scale(0.000430075)"
          />
        </pattern>
        <image id="image0" width="3583" height="2376" xlinkHref={src} />
      </defs>
    </svg>
  );
};

export default StoryItem;
