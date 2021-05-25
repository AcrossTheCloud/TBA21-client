import React from "react";
import { useState } from "react";
import { useEffect } from "react";
// import { Link } from "react-router-dom"; // comment back in if needed
import "styles/components/story.scss";
import StoryItem from "./StoryItem";

// TODO: fetch author, category, and tag into redux and map it together with selector
const StoryList = () => {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    fetch("https://stories.ocean-archive.org/wp-json/wp/v2/posts?_embed")
      .then((res) => res.json())
      .then((stories) => setStories(stories));
  });

  return (
    <div className='stories__list'>
      <div className="stories__header">
      <h1 className='stories-headline'>~ Dive into stories</h1>
      </div>
      {stories.map((story) => (
        <StoryItem
          key={story.id}
          slug={story.slug}
          title={story.title.rendered}
          author={story._embedded.author[0].name}
          body={story.excerpt.rendered}
          date={story.date}
          categories={story._embedded["wp:term"][0].map((tag) => tag.slug)}
          tags={story._embedded["wp:term"][1].map((tag) => tag.slug)}
        ></StoryItem>
      ))}
    </div>
  );
};

export default StoryList;

