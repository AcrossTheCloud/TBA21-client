import React from "react";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import "styles/components/story.scss";
import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";
import { ViewStoryState } from "../../reducers/story/viewStory";
import { connect } from "react-redux";
import { fetchStory } from "../../actions/story/viewStory";
import {
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import useStoryTheme from "hooks/useStoryTheme";
import { NavLink } from "react-router-dom";
import { storiesURL } from "urls";
import {
  addUserFavourite,
  deleteUserFavourite,
} from "../../actions/user/profile";
import { ProfileState } from "../../reducers/user/profile";
import { TiStar, TiStarOutline } from "react-icons/ti";
import $ from "jquery";
import { throttle } from "lodash";

type ViewStory = {
  status: typeof FETCH_STORY_SUCCESS | typeof FETCH_STORY_LOADING;
  favouriteStatus: "LOADING" | "FAVOURITED" | "IDLE";
  title: string;
  html: string;
  id: number;
};

type ViewStoryWithMatch = ViewStory & {
  fetchStory: Function;
  addUserFavourite: Function;
  deleteUserFavourite: Function;
  match: {
    params: { slug: string };
  };
};

type ViewStorySection = { key: string; level: number; title: string };

type ViewStoryBreadcrumbProps = {
  isBreadcrumbSticky: boolean;
  activeSection: ViewStorySection;
  sections: ViewStorySection[];
};
const ViewStoryBreadcrumb: React.FC<ViewStoryBreadcrumbProps> = ({
  isBreadcrumbSticky,
  activeSection,
  sections,
}) => {
  return (
    <div
      className={`story-breadcrumb ${
        isBreadcrumbSticky ? "story-breadcrumb--sticky" : ""
      }`}
    >
      <span>Ocean Archives</span>
      <span>{">"}</span>
      <NavLink to={storiesURL()}>Stories</NavLink>
      <span>{">"}</span>
      <UncontrolledDropdown>
        <DropdownToggle nav caret>
          <span
            dangerouslySetInnerHTML={{ __html: activeSection.title }}
          ></span>
        </DropdownToggle>
        <DropdownMenu
          style={{
            maxHeight: "28rem",
            maxWidth: "30rem",
            overflowY: "scroll",
          }}
        >
          {sections.map((section) => (
            <a key={section.key} href={`#${section.key}`}>
              <DropdownItem>
                <span
                  dangerouslySetInnerHTML={{ __html: section.title }}
                  style={{ marginLeft: `${(section.level - 1) * 1}rem` }}
                />
              </DropdownItem>
            </a>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};

const ViewStoryHeader = (props) => <div {...props} />;

const HEADER_TAGS = ["H1", "H2", "H3", "H4", "H5", "H6"];
const MAIN_HEADER_ID = "MAIN_HEADER";
const SUBHEADING_CLASS = "story-content__subheading";
const ViewStory: React.FC<ViewStoryWithMatch> = ({
  id,
  match,
  title,
  html,
  status,
  fetchStory,
  addUserFavourite,
  deleteUserFavourite,
  favouriteStatus,
}) => {
  const { theme, setTheme, themes, themeClassName } = useStoryTheme();

  let [sections, setSections] = useState<ViewStorySection[]>([
    { key: MAIN_HEADER_ID, level: 1, title },
  ]);
  let [activeSection, setActiveSection] = useState(sections[0]);
  let [manipulatedHTML, setManipulatedHTML] = useState("");
  let [isBreadcrumbSticky, setIsBreadcrumbSticky] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchStory(match.params.slug);
  }, [fetchStory, match.params.slug, title]);

  useLayoutEffect(() => {
    let elem = wrapperRef.current;
    const scrollHandler = () => {
      // element is shown on window
      if (elem && elem.getBoundingClientRect().top <= 0) {
        setIsBreadcrumbSticky(true);
      } else {
        setIsBreadcrumbSticky(false);
      }
    };

    const throttledScrollHandler = throttle(scrollHandler, 100);

    if (elem) {
      window.addEventListener("scroll", throttledScrollHandler);
    }
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [wrapperRef.current]);

  useEffect(() => {
    let temporarySections: ViewStorySection[] = [
      { key: MAIN_HEADER_ID, level: 1, title },
    ];
    let $parsedHTML = $.parseHTML(html);
    $parsedHTML.forEach((node) => {
      let $node = $(node);
      let tagName = $node.prop("tagName");
      let isHeader = HEADER_TAGS.includes(tagName);
      if (isHeader) {
        let text = $node.text();
        // unique identifier
        let key = [tagName, text].join("_");
        // append ID to each heading tag[]
        $node.attr("id", key);
        $node.addClass(SUBHEADING_CLASS);
        temporarySections.push({
          key,
          level: parseInt(tagName.split("")[1]),
          title: text,
        });
      }
    });
    setManipulatedHTML($("<div>").append($parsedHTML).html());
    setSections(temporarySections);
    setActiveSection(temporarySections[0]);
  }, [html, title]);

  useEffect(() => {
    const scrollHandler = () => {
      if (!wrapperRef.current) {
        return;
      }

      let elements = $(wrapperRef.current).find(`.${SUBHEADING_CLASS}`);
      let nearestElement: HTMLElement | null = null;
      let iter = 0;
      while (iter < elements.length) {
        let element = elements[iter];
        let rect = element.getBoundingClientRect();
        // 8px is arbitary buffer for sensitivity
        if (rect.top >= 12) {
          // default to first element heading if it's not scrolled yet
          if (iter === 0) nearestElement = element;
          break;
        }
        nearestElement = element;
        iter++;
      }
      if (nearestElement != null) {
        let activeSection = sections.find(
          (section) => section.key === nearestElement?.getAttribute("id")
        );

        if (activeSection) {
          setActiveSection(activeSection);
        }
      }
    };
    const throttledScrollHandler = throttle(scrollHandler, 250);
    document.addEventListener("scroll", throttledScrollHandler);
    return () => document.removeEventListener("scroll", throttledScrollHandler);
  }, [sections]);

  return (
    <div className={`story ${themeClassName}`}>
      {status === FETCH_STORY_LOADING && (
        <div className="story-spinner-wrapper">
          <Spinner />
        </div>
      )}
      {status === FETCH_STORY_SUCCESS && (
        <>
          <ViewStoryHeader
            className={`story-header ${
              isBreadcrumbSticky ? "story-header--sticky" : ""
            }`}
          >
            <ViewStoryBreadcrumb
              isBreadcrumbSticky={isBreadcrumbSticky}
              activeSection={activeSection}
              sections={sections}
            />
            <div className="story-header__right">
              {favouriteStatus === "FAVOURITED" && (
                <TiStar
                  color="yellow"
                  onClick={() => {
                    deleteUserFavourite("stories", id);
                  }}
                />
              )}
              {favouriteStatus === "LOADING" && <Spinner />}
              {favouriteStatus === "IDLE" && (
                <TiStarOutline
                  onClick={() => {
                    addUserFavourite("stories", id);
                  }}
                />
              )}
              <UncontrolledDropdown>
                <DropdownToggle />
                <DropdownMenu right={true}>
                  {themes.map((t) => (
                    <DropdownItem
                      style={{
                        fontWeight: theme === t ? "bold" : "normal",
                        display: "inline-block",
                        marginRight: "1rem",
                      }}
                      key={t}
                      onClick={() => {
                        setTheme(t);
                      }}
                    >
                      {t}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </ViewStoryHeader>
          <div className="story-content" ref={wrapperRef}>
            <h1
              className={SUBHEADING_CLASS}
              id={MAIN_HEADER_ID}
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <div dangerouslySetInnerHTML={{ __html: manipulatedHTML }} />
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (
  state: { viewStory: ViewStoryState; profile: ProfileState },
  props: ViewStory
): ViewStory => {
  const isFavourited = (
    (state.profile &&
      state.profile.details &&
      state.profile.details.favourites &&
      state.profile.details.favourites["stories"]) ||
    []
  ).includes(state.viewStory.story.id)
    ? "FAVOURITED"
    : "IDLE";
  return {
    status: state.viewStory.status,
    ...state.viewStory.story,
    favouriteStatus: state.profile.favouriteIsLoading
      ? "LOADING"
      : isFavourited,
  };
};

export default connect(mapStateToProps, {
  fetchStory,
  addUserFavourite,
  deleteUserFavourite,
})(ViewStory);
