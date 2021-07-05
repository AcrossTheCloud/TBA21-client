import React, { FC } from "react";
import { Link } from "react-router-dom";
import { storyURL } from "urls";
import { WP_REST_API_EmbeddedTerms } from "./StoryList";

type StoryItemProps = {
  slug: string;
  title: string;
  author: string;
  body: string;
  date: string;
  tags: WP_REST_API_EmbeddedTerms;
  categories: WP_REST_API_EmbeddedTerms;
  imageURL: string;
  setSelectedCategoryIds: Function;
  setSelectedTagIds: Function;
};

const StoryItem: FC<StoryItemProps> = ({
  slug,
  title,
  author,
  body,
  date,
  tags,
  categories,
  imageURL,
  setSelectedCategoryIds,
  setSelectedTagIds,
}) => (
  <div className="stories-item">
    <Link to={storyURL(slug)}>
      <div>
        <div
          className="stories-item__title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <div className="stories-item-content">
          <div className="stories-item-content__image">
            <Blob src={imageURL} />
          </div>
          <div className="stories-item-content__texts">
            <p className="stories-item__author">{author}</p>
            <div
              className="stories-item__body"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      </div>
    </Link>
    <div className="stories-item-meta">
      <div>
        <span>Essay</span> ~ <span>{date}</span>
      </div>
      {tags.length > 0 ? (
        <div>
          Keyword tags:{" "}
          {tags.map((tag, idx) => (
            <span
              key={tag.id}
              onClick={() => setSelectedTagIds(tag.id)}
              className="stories-item-link"
            >
              {tag.name}
              {idx === tags.length - 1 ? null : <span>, </span>}
            </span>
          ))}
        </div>
      ) : null}
      {categories.length > 0 ? (
        <div>
          Concept tags:{" "}
          {categories.map((category, idx) => (
            <span
              key={category.id}
              onClick={() => {
                setSelectedCategoryIds(category.id);
              }}
              className="stories-item-link"
            >
              {category.name}
              {idx === categories.length - 1 ? null : <span>, </span>}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const Blob = ({ src }) => {
  return (
    <svg
      preserveAspectRatio="xMinYMin meet"
      width="100%"
      height="100%"
      viewBox="0 0 183 187"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M83.0351 0.0619523C110.274 -0.859365 137.37 8.447 155.654 31.2145C175.415 55.8202 188.648 89.6376 180.613 121.563C172.905 152.186 144.808 167.91 118.403 179.223C95.3347 189.106 70.2979 190.363 48.0335 178.364C25.6922 166.323 9.17233 144.077 3.03175 117.044C-3.32247 89.0693 0.0420799 58.8215 15.6846 35.9489C31.6326 12.6295 56.9193 0.945295 83.0351 0.0619523Z"
        fill={`url(#${src}pattern)`}
      />
      <defs>
        <pattern
          id={`${src}pattern`}
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref={`#${src}`}
            transform="translate(-0.270479) scale(0.000430075)"
          />
        </pattern>
        <image
          id={src}
          width="3583"
          height="2376"
          xlinkHref={src}
          preserveAspectRatio="xMidYMid meet"
        />
      </defs>
    </svg>
  );
};

export default StoryItem;
