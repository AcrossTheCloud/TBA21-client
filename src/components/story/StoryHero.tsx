import React, { useState, useEffect } from "react";
import { getStoriesAndTotalStoriesInDatabase } from "../../REST/story";
import { WP_REST_API_Posts } from "wp-types";
import defaultImage from "images/defaults/Unscharfe_Zeitung.jpg";
import { NavLink } from "react-router-dom";
import { Spinner } from "reactstrap";
import { storyURL } from "urls";
import { connect } from "react-redux";
import { StoryListState } from "../../reducers/story/storyList";

const StoryHero = ({ heroRef, authorById }) => {
  const [heroStories, setHeroStories] = useState<WP_REST_API_Posts>([]);
  const [status, setStatus] =
    useState<"LOADING" | "ERROR" | "FETCHED">("LOADING");
  useEffect(() => {
    const getStories = async () => {
      setStatus("LOADING");
      try {
        const result = await getStoriesAndTotalStoriesInDatabase({
          perPage: 3,
          page: 1,
          sticky: true,
        });
        setHeroStories(result.stories);
        setStatus("FETCHED");
      } catch {
        setStatus("ERROR");
      }
    };

    getStories();
  }, []);
  return (
    <div className="stories-hero" ref={heroRef}>
      {status === "ERROR" && <p>Something went wrong</p>}
      {status === "LOADING" && <Spinner color="white" />}
      {status === "FETCHED" && (
        <>
          <div className="stories-hero-header">
            <img src="/svg/ocean-archive-1.svg" alt="" />
            <img src="/svg/ocean-archive-2.svg" alt="" />
          </div>
          <div className="stories-hero-items">
            {heroStories.map((story, idx) => (
              <NavLink to={storyURL(story.slug)} key={story.id}>
                <div className="stories-hero-item">
                  <img
                    className={`stories-hero-item__image--${idx + 1}`}
                    alt=""
                    src={
                      (story.jetpack_featured_media_url as string) ||
                      defaultImage
                    }
                  />
                  <h2
                    dangerouslySetInnerHTML={{ __html: story.title.rendered }}
                  ></h2>
                  {/* @ts-ignore */}
                  <p>{authorById[story.author]?.full_name || ""}</p>
                </div>
              </NavLink>
            ))}
          </div>
          <img
            src="/svg/circular-variant-2.svg"
            alt=""
            className="stories-hero-illustration"
          />
        </>
      )}
    </div>
  );
};

export default connect((state: { storyList: StoryListState }) => ({
  authorById: state.storyList.authorById,
}))(StoryHero);
