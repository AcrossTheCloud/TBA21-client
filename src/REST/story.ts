import type { WP_REST_API_Post, WP_REST_API_Posts } from "wp-types";

const ROOT_WP_URL = "https://stories.ocean-archive.org/wp-json/wp/v2";

export const getStory = async (slug: string): Promise<WP_REST_API_Post> => {
  const response = await fetch(`${ROOT_WP_URL}/posts?slug=${slug}`);
  const [story] = await response.json();
  return story;
};

export const getStories = async (params: SearchStoryParams | null): Promise<WP_REST_API_Posts> => {
  let url = `${ROOT_WP_URL}/posts?_embed`
  if (params) {
    if (params.title) {
      url += `&search=${params.title}`
    }
  }
  const response = await fetch(url);


  const stories = await response.json();
  return stories;
};

export type SearchStoryParams = {
  title: string;
};
