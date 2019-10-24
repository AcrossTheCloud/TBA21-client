import { API } from 'aws-amplify';
import config from 'config';
import { random } from 'lodash';

import { HomepageData } from '../types/Home';
import { getCDNObject } from '../components/utils/s3File';
import { FileTypes, S3File } from '../types/s3File';
import { itemType } from '../types/Item';

// Defining our Actions for the reducers
export const LOGO_STATE_HOMEPAGE = 'LOGO_STATE_HOMEPAGE';
export const LOAD_HOMEPAGE = 'LOAD_HOMEPAGE';
export const LOAD_MORE_HOMEPAGE = 'LOAD_MORE_HOMEPAGE';
export const LOAD_COUNT_HOMEPAGE = 'LOAD_COUNT_HOMEPAGE';
export const LOAD_MORE_LOADING = 'LOAD_MORE_LOADING';
export const MODAL_STATE_HOMEPAGE = 'MODAL_STATE_HOMEPAGE';

export const logoDispatch = (state: boolean) => dispatch => {
  dispatch({
    type: LOGO_STATE_HOMEPAGE,
    logoLoaded: state
  });
};

export const loadHomepage = () => async dispatch => {
  const oaHighlights: { oa_highlight: HomepageData[] } = await API.get(
      'tba21',
      'pages/homepage',
      { queryStringParameters: { oa_highlight: true, oaHighlightLimit: 2 } }
    ),
    queryStringParams = {
      oa_highlight: false
    };

  // Push the ID's into the queryString for the next API call, so it excludes them
  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    Object.assign(queryStringParams, {
      id: oaHighlights.oa_highlight.map(o => o.id)
    });
  }

  const response: {
    items: HomepageData[];
    collections: HomepageData[];
  } = await API.get('tba21', 'pages/homepage', {
    queryStringParameters: queryStringParams
  });

  const announcementResponse = await API.get('tba21', 'announcements', {
    queryStringParameters: { limit: '1' }
  });

  const highlightsWithFiles = await addFilesToData(oaHighlights.oa_highlight);

  // const HighlightsItemDetails = (props: { index: number }) => {
  //   const tags = highlightsWithFiles[props.index].concept_tags;
  //   const creators = !!highlightsWithFiles[props.index].creators
  //     ? highlightsWithFiles[props.index].creators
  //     : [];
  //
  //   return (
  //     <>
  //       <div
  //         className="title-wrapper d-flex"
  //         onClick={() => dispatch(openModal(highlightsWithFiles[props.index]))}
  //       >
  //         {creators && creators.length ? (
  //           <div className="creators">
  //             {creators[0]}
  //             {creators.length > 1 ? <em>, et al.</em> : <></>}
  //           </div>
  //         ) : (
  //           <></>
  //         )}
  //         {creators && creators.length ? (
  //           <div className="d-none d-md-block dotwrap">
  //             <FaCircle className="dot" />
  //           </div>
  //         ) : (
  //           <></>
  //         )}
  //         <div
  //           className="title"
  //           onClick={() =>
  //             dispatch(openModal(highlightsWithFiles[props.index]))
  //           }
  //         >
  //           {highlightsWithFiles[props.index].title}
  //         </div>
  //       </div>
  //       <div
  //         className="type"
  //         onClick={() => dispatch(openModal(highlightsWithFiles[props.index]))}
  //       >
  //         {highlightsWithFiles[props.index].item_subtype},{' '}
  //         {dateFromTimeYearProduced(
  //           highlightsWithFiles[props.index].time_produced,
  //           highlightsWithFiles[props.index].year_produced
  //         )}
  //       </div>
  //       {!!tags && tags.length ? (
  //         <div className="tags d-none d-lg-block">
  //           {tags
  //             .map(t => `#${t}`)
  //             .join(' ')
  //             .toString()}
  //         </div>
  //       ) : (
  //         <></>
  //       )}
  //     </>
  //   );
  // };

  // const HighLightsLayout = (props: { index: number }) => {
  //   if (props.index === 0 && !!highlightsWithFiles[0]) {
  //     return (
  //       <Col
  //         xs="12"
  //         lg={highlightsWithFiles.length > 1 ? 8 : 12}
  //         className="item"
  //         onClick={() => {
  //           if (
  //             highlightsWithFiles[0].item_type !== itemType.Audio ||
  //             (highlightsWithFiles[0].file &&
  //               highlightsWithFiles[0].file.type) !== FileTypes.Audio
  //           ) {
  //             dispatch(openModal(highlightsWithFiles[0]));
  //           }
  //         }}
  //       >
  //         <div className="detailPreview">
  //           {highlightsWithFiles[0].file ? (
  //             highlightsWithFiles[0].item_type === itemType.Audio ||
  //             highlightsWithFiles[0].file.type === FileTypes.Audio ? (
  //               <HomePageAudioPreview
  //                 data={highlightsWithFiles[0]}
  //                 openModal={() => dispatch(openModal(highlightsWithFiles[0]))}
  //               />
  //             ) : (
  //               <>
  //                 <FileStaticPreview file={highlightsWithFiles[0].file} />
  //                 <HighlightsItemDetails index={0} />
  //               </>
  //             )
  //           ) : (
  //             <></>
  //           )}
  //           {highlightsWithFiles[0].file.type === FileTypes.Video ? (
  //             <div className="middle">
  //               <FaPlay />
  //             </div>
  //           ) : (
  //             <></>
  //           )}
  //         </div>
  //       </Col>
  //     );
  //   } else if (props.index === 1 && !!highlightsWithFiles[1]) {
  //     return (
  //       <Col
  //         xs="12"
  //         lg="4"
  //         className="item"
  //         onClick={() => {
  //           if (
  //             highlightsWithFiles[1].item_type !== itemType.Audio ||
  //             (highlightsWithFiles[1].file &&
  //               highlightsWithFiles[1].file.type) !== FileTypes.Audio
  //           ) {
  //             dispatch(openModal(highlightsWithFiles[1]));
  //           }
  //         }}
  //       >
  //         <Row className="d-none d-lg-block">
  //           <Col xs="12">
  //             <div className="detailPreview">
  //               {highlightsWithFiles[1].file ? (
  //                 highlightsWithFiles[1].item_type === itemType.Audio ||
  //                 highlightsWithFiles[1].file.type === FileTypes.Audio ? (
  //                   <HomePageAudioPreview
  //                     data={highlightsWithFiles[1]}
  //                     openModal={() =>
  //                       dispatch(openModal(highlightsWithFiles[1]))
  //                     }
  //                   />
  //                 ) : (
  //                   <FileStaticPreview file={highlightsWithFiles[1].file} />
  //                 )
  //               ) : (
  //                 <></>
  //               )}
  //               {highlightsWithFiles[1].file.type === FileTypes.Video ? (
  //                 <div className="middle">
  //                   <FaPlay />
  //                 </div>
  //               ) : (
  //                 <></>
  //               )}
  //             </div>
  //             <HighlightsItemDetails index={1} />
  //           </Col>
  //         </Row>
  //         <Row className="d-lg-none py-4 py-lg-0">
  //           <Col xs="12">
  //             <div className="detailPreview">
  //               {highlightsWithFiles[1].file ? (
  //                 highlightsWithFiles[1].item_type === itemType.Audio ||
  //                 highlightsWithFiles[1].file.type === FileTypes.Audio ? (
  //                   <HomePageAudioPreview
  //                     data={highlightsWithFiles[1]}
  //                     openModal={() =>
  //                       dispatch(openModal(highlightsWithFiles[1]))
  //                     }
  //                   />
  //                 ) : (
  //                   <>
  //                     <FileStaticPreview file={highlightsWithFiles[1].file} />
  //                     <HighlightsItemDetails index={1} />
  //                   </>
  //                 )
  //               ) : (
  //                 <></>
  //               )}
  //               {highlightsWithFiles[1].file.type === FileTypes.Video ? (
  //                 <div className="middle">
  //                   <FaPlay />
  //                 </div>
  //               ) : (
  //                 <></>
  //               )}
  //             </div>
  //           </Col>
  //         </Row>
  //
  //         {announcements && announcements.length ? (
  //           <div className="announcement pt-4 pt-lg-5">
  //             <div className="type">Announcement</div>
  //             <div className="title">{announcements[0].title}</div>
  //             <div className="description">{announcements[0].description}</div>
  //             {!!announcements[0].url ? (
  //               <div>
  //                 <a
  //                   href={announcements[0].url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                 >
  //                   View
  //                   <svg
  //                     width="21px"
  //                     height="17px"
  //                     viewBox="0 0 21 17"
  //                     version="1.1"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     xmlnsXlink="http://www.w3.org/1999/xlink"
  //                   >
  //                     <g
  //                       stroke="none"
  //                       strokeWidth="1"
  //                       fill="none"
  //                       fillRule="evenodd"
  //                     >
  //                       <g transform="translate(-1114.000000, -760.000000)">
  //                         <g transform="translate(1.000000, 0.000000)">
  //                           <g transform="translate(1113.000000, 760.000000)">
  //                             <path
  //                               d="M14.3596565,16.9833984 C14.277748,16.9833984 14.198766,16.9695639 14.1227082,16.9418945 C14.0466503,16.9142251 13.9793693,16.8727216 13.9208632,16.8173828 C13.8038511,16.7067052 13.7453459,16.573894 13.7453459,16.4189453 C13.7453459,16.2639966 13.8038511,16.1311854 13.9208632,16.0205078 L19.5456081,9.56692708 L14.0437254,3.24615885 C13.9267132,3.13548122 13.8682081,2.99990315 13.8682081,2.83942057 C13.8682081,2.678938 13.9267132,2.54335993 14.0437254,2.43268229 C14.1607375,2.32200465 14.3040752,2.26666667 14.4737428,2.26666667 C14.6434104,2.26666667 14.7867481,2.32200465 14.9037602,2.43268229 L20.8093328,9.16848958 C20.9263449,9.27916722 20.9848501,9.41197839 20.9848501,9.56692708 C20.9848501,9.72187577 20.9263449,9.85468695 20.8093328,9.96536458 L14.7808981,16.8173828 C14.722392,16.8727216 14.6551111,16.9142251 14.5790532,16.9418945 C14.5029953,16.9695639 14.4298638,16.9833984 14.3596565,16.9833984 Z"
  //                               fill="#FFFFFF"
  //                               fillRule="nonzero"
  //                             ></path>
  //                             <path
  //                               d="M1.38568046,9.70416667 L19.3586534,9.70416667"
  //                               stroke="#FFFFFF"
  //                               strokeWidth="1.14932327"
  //                               strokeLinecap="round"
  //                             ></path>
  //                             <path
  //                               d="M1.38568046,0.6375 L1.38568046,9.70416667"
  //                               stroke="#FFFFFF"
  //                               strokeWidth="1.14932327"
  //                               strokeLinecap="round"
  //                             ></path>
  //                           </g>
  //                         </g>
  //                       </g>
  //                     </g>
  //                   </svg>
  //                 </a>
  //               </div>
  //             ) : (
  //               <></>
  //             )}
  //           </div>
  //         ) : (
  //           <></>
  //         )}
  //       </Col>
  //     );
  //   } else {
  //     return <></>;
  //   }
  // };

  const items = response.items,
    collections = response.collections,
    announcements = announcementResponse.announcements;
  // loadedHighlights = highlightsWithFiles.map(
  //   (oa: HomepageData, i: number) => <HighLightsLayout index={i} key={i} />
  // );

  // Put all audio files into another list.
  const audio: HomepageData[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].item_type === itemType.Audio) {
      audio.push(items[i]);
      items.splice(i, 1);
    }
  }

  dispatch({
    type: LOAD_HOMEPAGE,
    items,
    audio,
    collections,
    announcements,
    highlights: highlightsWithFiles
  });
};

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */
export const addFilesToData = async (
  data: HomepageData[]
): Promise<HomepageData[]> => {
  if (data && data.length) {
    // Loop through each object in the array and get it's File from CloudFront
    for (let i = 0; i < data.length; i++) {
      const isCollection: boolean = !!data[i].count,
        s3Key = isCollection ? data[i].s3_key[0] : data[i].s3_key, // if collection get the first s3_key
        result = await getCDNObject(s3Key);

      if (result) {
        const file: S3File = result;

        if (file.type === FileTypes.Image) {
          const thumbnailUrl = `${config.other.THUMBNAIL_URL}${s3Key}`;
          let thumbnails = {};

          if (typeof data[i].file_dimensions !== 'undefined') {
            const dimensions: number[] = data[i].file_dimensions as number[];

            if (dimensions && dimensions[0]) {
              if (dimensions[0] > 540) {
                Object.assign(thumbnails, {
                  540: `${thumbnailUrl}.thumbnail540.png`
                });
              }
              if (dimensions[0] > 720) {
                Object.assign(thumbnails, {
                  720: `${thumbnailUrl}.thumbnail720.png`
                });
              }
              if (dimensions[0] > 960) {
                Object.assign(thumbnails, {
                  960: `${thumbnailUrl}.thumbnail960.png`
                });
              }
              if (dimensions[0] > 1140) {
                Object.assign(thumbnails, {
                  1140: `${thumbnailUrl}.thumbnail1140.png`
                });
              }

              if (Object.keys(thumbnails).length > 1) {
                Object.assign(file, { thumbnails });
              }
            }
          }
        }

        Object.assign(data[i], { file: { ...data[i].file, ...file } });
      }
    }
    return data;
  } else {
    return [];
  }
};

export const loadMore = () => async (dispatch, getState) => {
  dispatch({ type: LOAD_MORE_LOADING, loading: true });
  const itemRand = random(2, 3),
    collectionRand = random(2, 3),
    state = getState(),
    { items, collections, audio, loadedItems } = state.home;

  let data: HomepageData[] = [
    ...(items.length > itemRand
      ? items.splice(0, itemRand)
      : items.splice(0, items.length)),
    ...(collections.length > collectionRand
      ? collections.splice(0, collectionRand)
      : collections.splice(0, collections.length))
  ];

  // Push the audio to the end
  if (audio && audio.length) {
    data.push(...audio.splice(0, 1));
  }

  data = await addFilesToData(data);

  // const Layout = (props: { data: HomepageData }): JSX.Element => {
  //   const { file, item_type } = props.data;
  //
  //   if (!file) {
  //     return <></>;
  //   }
  //
  //   const colSize = (fileType: string): number => {
  //     switch (fileType) {
  //       case 'Audio':
  //         return 12;
  //
  //       case 'Video':
  //         return 8;
  //
  //       default:
  //         return 4;
  //     }
  //   };
  //
  //   return (
  //     <Col lg={colSize(!!file ? file.type : '')} className="pt-4">
  //       {item_type === itemType.Audio || file.type === FileTypes.Audio ? (
  //         <HomePageAudioPreview
  //           data={props.data}
  //           openModal={() => dispatch(openModal(props.data))}
  //         />
  //       ) : (
  //         <div onClick={() => dispatch(openModal(props.data))}>
  //           <DetailPreview
  //             data={props.data}
  //             onLoad={() => dispatch(waitForLoad(loadedCount - 1))}
  //           />
  //         </div>
  //       )}
  //     </Col>
  //   );
  // };
  //
  // const allItems = [
  //   ...loadedItems,
  //   ...data.map((e: HomepageData, i: number) => (
  //     <Layout key={loadedItems.length + i} data={e} />
  //   ))
  // ];
  const allItems = [...loadedItems, ...data];

  dispatch({
    type: LOAD_MORE_HOMEPAGE,
    items: items,
    collections: collections,
    audio: audio,
    loadedMore: true,
    loadedCount: allItems.length,
    loadedItems: allItems
  });
  dispatch({ type: LOAD_MORE_LOADING, loading: false });
};

export const waitForLoad = (loadedCount: number) => dispatch => {
  dispatch({ type: LOAD_COUNT_HOMEPAGE, loadedCount: loadedCount });
};
