import React from "react";
import { Link } from "react-router-dom";

const StoryItem = ({ slug, title, author, body, date, tags, categories }) => (
  <div className="stories-item">
    <Link to={`/story/${slug}`} className="stories-item__title">
      {title}
    </Link>
    <p className="stories-item__author">{author}</p>
    <div
      className="stories-item__body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
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
              {idx == tags.length - 1 ? null : <span>, </span>}
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
              {idx == categories.length - 1 ? null : <span>, </span>}
            </>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

export default StoryItem;
