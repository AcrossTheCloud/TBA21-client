import type { WP_REST_API_Categories, WP_REST_API_Post, WP_REST_API_Posts } from "wp-types";

const ROOT_WP_URL = "https://stories.ocean-archive.org/wp-json/wp/v2";

export const getStory = async (slug: string): Promise<WP_REST_API_Post> => {
  const response = await fetch(`${ROOT_WP_URL}/posts?slug=${slug}`);
  const [story] = await response.json();
  return story;
};

export const getStoriesAndTotalStoriesInDatabase = async (
  params: SearchStoryParams
): Promise<{
  stories: WP_REST_API_Posts;
  totalStoriesInDatabase: number;
}> => {
  let url = `${ROOT_WP_URL}/posts?_embed`;
  if (params) {
    if (params.title) {
      url += `&search=${params.title}`;
    }

    if (params.orderBy) {
      url += `&orderby=${params.orderBy}`;
    }

    if (params.order) {
      url += `&order=${params.order}`;
    }
  }
  const response = await fetch(url);
  const stories = await response.json();

  return {
    stories,
    totalStoriesInDatabase: Number(response.headers.get("x-wp-total")) || 0,
  };
};

export const getCategories = async (): Promise<WP_REST_API_Categories> => {
  // fetch 100 categories (default to 10). If there are more than 100 categories, we should update this logic to do multiple fetches on redux reducer
  const response = await fetch(`${ROOT_WP_URL}/categories?per_page=100`);
  return await response.json();
};

export type SearchStoryParams = {
  title: string;
  order: "asc" | "desc";
  orderBy: "date" | "author" | "title";
};
