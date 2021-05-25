import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "styles/components/story.scss";

const Story = ({ match }) => {
  const [story, setStory] = useState(null);
  useEffect(() => {
    fetch(
      `https://stories.ocean-archive.org/wp-json/wp/v2/posts?slug=${match.params.slug}`
    )
    .then((res) => res.json())
    .then((stories) => setStory(stories[0]))
  }, [match.params.slug]);
  console.log(story)
  return (
    <div className='story'>
      <div className="story-content">
      {story && story.title && <h1>{story.title.rendered}</h1>}
      </div>
      {story && story.content && <div className='story-content' dangerouslySetInnerHTML={{__html: story.content.rendered}} />}
    </div>
  );
};

export default Story;