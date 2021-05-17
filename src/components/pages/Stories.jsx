import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from 'react-router-dom';
import "styles/components/stories.scss";

const BlogItem = ({ title, author, body, date, tags, categories }) => (
  <div className="stories-item">
    <p className="stories-item__title">{title}</p>
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
        
              <Link className='stories-item-link' to={`/stories/tag/${tag}`}>{tag}</Link> 
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
              <Link className='stories-item-link' to={`/stories/tag/${category}`}>{category}</Link> 
              {idx == categories.length - 1 ? null : <span>, </span>}
            </>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

// TODO: fetch author, category, and tag into redux and map it together with selector
const Stories = () => {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    fetch("https://stories.ocean-archive.org/wp-json/wp/v2/posts?_embed")
      .then((res) => res.json())
      .then((stories) => setStories(stories));
  });
  console.log(stories[0]);
  return (
    <div>
      {stories.map((story) => (
        <BlogItem
          key={story.id}
          title={story.title.rendered}
          author={story._embedded.author[0].name}
          body={story.excerpt.rendered}
          date={story.date}
          categories={story._embedded["wp:term"][0].map((tag) => tag.slug)}
          tags={story._embedded["wp:term"][1].map((tag) => tag.slug)}
        ></BlogItem>
      ))}
    </div>
  );
};

export default Stories;
