import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "styles/components/story.scss";
const Story = ({ match }) => {
  const [html, setHtml] = useState(null);
  useEffect(() => {
    fetch(
      `https://stories.ocean-archive.org/wp-json/wp/v2/posts?slug=${match.params.slug}`
    )
      .then((res) => res.json())
      .then((stories) => setHtml(stories[0].content.rendered));
  }, [match.params.slug]);
  return (
    <div className='story'>
      <p>{match.params.slug}</p>
      {html && <div className='story' dangerouslySetInnerHTML={{__html: html}} />}
    </div>
  );
};

export default Story;
