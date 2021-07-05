import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StoryList from "components/story/StoryList";
import StorySearches from "../story/StorySearches";
import "styles/components/story.scss";
import { debounce, throttle } from "lodash";
import {
  fetchStoriesInitial,
  fetchCategories,
  fetchTags,
} from "../../actions/story/storyList";
import { connect } from "react-redux";
import { StoryListState } from "../../reducers/story/storyList";
import {
  WP_REST_API_Terms,
  WP_REST_API_Tags,
  WP_REST_API_Users,
} from "wp-types";
import { fetchAuthors } from "../../actions/story/storyList";
import StoryHero from "components/story/StoryHero";
import Popup from "reactjs-popup";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import defaultImage from "images/defaults/Unscharfe_Zeitung.jpg";
import { LOCAL_STORAGE_KEY } from "../../constants/index";

type StoriesProps = {
  fetchStoriesInitial: Function;
  fetchCategories: Function;
  fetchTags: Function;
  fetchAuthors: Function;
  categoryById: StoryListState["categoryById"];
  tagById: StoryListState["tagById"];
  authorById: StoryListState["authorById"];
};

const Stories: React.FC<StoriesProps> = ({
  fetchStoriesInitial,
  fetchCategories,
  fetchAuthors,
  fetchTags,
  categoryById,
  tagById,
  authorById,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  useLayoutEffect(() => {
    let elem = heroRef.current;
    const scrollHandler = () => {
      // element is shown on window
      if (filterRef && elem && elem.getBoundingClientRect().bottom <= 0) {
        setIsFilterSticky(true);
      } else {
        setIsFilterSticky(false);
      }
    };

    const throttledScrollHandler = throttle(scrollHandler, 100);

    if (elem) {
      window.addEventListener("scroll", throttledScrollHandler);
    }
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, []);

  const [isOnboardingShown, setIsOnboardingShown] = useState(
    localStorage.getItem(LOCAL_STORAGE_KEY.STORY_ONBOARDING_SHOWN) === "true"
  );

  const [title, setTitle] = useState("");
  const [orderBy, setOrderBy] = useState<"author" | "title" | "date">("date");
  const [orderAuthor, setOrderAuthor] = useState<"asc" | "desc">("asc");
  const [orderTitle, setOrderTitle] = useState<"asc" | "desc">("asc");
  const [selectedCategoryIds, _setSelectedCategoryIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedTagIds, _setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedAuthorIds, _setSelectedAuthorIds] = useState<Set<number>>(
    new Set()
  );

  const setSelectedCategoryIds = useCallback(
    (id) => {
      let newSet = new Set(selectedCategoryIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedCategoryIds(newSet);
    },
    [selectedCategoryIds]
  );

  const setSelectedTagIds = useCallback(
    (id) => {
      let newSet = new Set(selectedTagIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedTagIds(newSet);
    },
    [selectedTagIds]
  );

  const setSelectedAuthorIds = useCallback(
    (id) => {
      let newSet = new Set(selectedAuthorIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedAuthorIds(newSet);
    },
    [selectedAuthorIds]
  );

  const debouncedFetchStoriesInitial = useCallback(
    debounce((...args) => fetchStoriesInitial(...args), 250),
    []
  );

  useEffect(() => {
    let order =
      orderBy === "author"
        ? orderAuthor
        : orderBy === "title"
        ? orderTitle
        : "desc";

    debouncedFetchStoriesInitial({
      title,
      order,
      orderBy,
      categoryIds: Array.from(selectedCategoryIds),
      tagIds: Array.from(selectedTagIds),
      authorIds: Array.from(selectedAuthorIds),
    });
  }, [
    title,
    orderAuthor,
    orderTitle,
    orderBy,
    debouncedFetchStoriesInitial,
    selectedCategoryIds,
    selectedTagIds,
    selectedAuthorIds,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchAuthors();
  }, [fetchCategories, fetchTags, fetchAuthors]);

  const selectedCategories: WP_REST_API_Terms = useMemo(() => {
    return Array.from(selectedCategoryIds)
      .filter((cat) => categoryById[cat])
      .map((categoryId) => {
        let category = categoryById[categoryId];
        return category;
      });
  }, [categoryById, selectedCategoryIds]);

  const selectedTags: WP_REST_API_Tags = useMemo(
    () =>
      Array.from(selectedTagIds)
        .filter((tag) => tagById[tag])
        .map((tagId) => {
          return tagById[tagId];
        }),
    [tagById, selectedTagIds]
  );

  const selectedAuthors: WP_REST_API_Users = useMemo(
    () =>
      Array.from(selectedAuthorIds)
        .filter((authorId) => authorById[authorId])
        .map((authorId) => {
          console.log(authorId);
          return authorById[authorId];
        }),
    [authorById, selectedAuthorIds]
  );

  // set to true on production
  const handleCloseOnboarding = () => {
    setIsOnboardingShown(true);
    // localStorage.setItem(LOCAL_STORAGE_KEY.STORY_ONBOARDING_SHOWN, "true");
  };
  return (
    <div className="stories">
      <StoryHero heroRef={heroRef} />
      <div className="stories__wrapper">
        <StorySearches
          isSticky={isFilterSticky}
          wrapperRef={filterRef}
          title={title}
          setTitle={setTitle}
          selectedCategories={selectedCategories}
          setSelectedCategoryIds={setSelectedCategoryIds}
          selectedTags={selectedTags}
          setSelectedTagIds={setSelectedTagIds}
          selectedAuthors={selectedAuthors}
          setSelectedAuthorIds={setSelectedAuthorIds}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderTitle={orderTitle}
          orderAuthor={orderAuthor}
          setOrderAuthor={setOrderAuthor}
          setOrderTitle={setOrderTitle}
        />
        <StoryList
          setSelectedCategoryIds={setSelectedCategoryIds}
          setSelectedTagIds={setSelectedTagIds}
        />
      </div>
      <Popup
        open={!isOnboardingShown}
        onClose={handleCloseOnboarding}
        overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
      >
        <Slider className={"story-onboarding"} {...settings}>
          {slideItems.map((slideItem, idx) => (
            <div className="story-onboarding-item" key={idx}>
              <div className="story-onboarding-item__image stories-hero-item">
                <img
                  className={"stories-hero-item__image--1"}
                  src={defaultImage}
                  alt=""
                />
              </div>
              <div>
                <h3>{slideItem.title}</h3>
                <div>{slideItem.body}</div>
              </div>
            </div>
          ))}
        </Slider>
        <div className="story-onboarding-close" onClick={handleCloseOnboarding}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </Popup>
    </div>
  );
};

const PrevArrow = (props) => (
  <div className={props.className} onClick={props.onClick}>
    Back
  </div>
);
const NextArrow = (props) => (
  <div className={props.className} onClick={props.onClick}>
    Next
  </div>
);

const slideItem = {
  title: "Hello wanderer!",
  body: (
    <div>
      <div>
        <p>Welcome to ocean archive! a digital organism for wanderer.</p>
        <p>
          Welcome to ocean archive! a digital organism for wanderer.Welcome to
        </p>
        <p>
          Welcome to ocean archive! a digital organism for wanderer.Welcome to
          ocean archive! a digital organism for wanderer.Welcome to ocean
          archive! a digital organism for wanderer.
        </p>
      </div>
    </div>
  ),
};

const slideItems = [
  slideItem,
  slideItem,
  slideItem,
  slideItem,
  slideItem,
  slideItem,
];

const settings = {
  dots: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: false,
  prevArrow: <PrevArrow />,
  nextArrow: <NextArrow />,
};

export default connect(
  (state: { storyList: StoryListState }) => ({
    categoryById: state.storyList.categoryById,
    tagById: state.storyList.tagById,
    authorById: state.storyList.authorById,
  }),
  { fetchStoriesInitial, fetchCategories, fetchTags, fetchAuthors }
)(Stories);
