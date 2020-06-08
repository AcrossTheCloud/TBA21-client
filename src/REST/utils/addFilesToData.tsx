import { getCDNObject } from '../../components/utils/s3File';
import config from 'config';
import { FileTypes, S3File } from '../../types/s3File';
import { Item } from 'types/Item';
import { HomepageData } from 'reducers/home';
import { Collection } from 'types/Collection';

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */

async function addFilesToData(datas: Item[]): Promise<Item[]>;
async function addFilesToData(datas: Collection[]): Promise<Collection[]>;
async function addFilesToData(datas: HomepageData[]): Promise<HomepageData[]>;

async function addFilesToData(datas: any[]): Promise<any[]> {
  if (datas && datas.length) {
    try {
      // Loop through each object in the array and get it's File from CloudFront
      const files = await Promise.all(datas.map(d => {
        // for collections with item, use the first item image as DataLayout
        let s3Key = d.__typename === "collection" && d.items.length
          ? d.items[0].s3_key
          : d.s3_key
        return getCDNObject(s3Key)
      }))
      let newDatas = files.map((f, i) => {
        let data = datas[i];
        let file = f as S3File
        const s3Key = data.s3_key;
        if (file.type === FileTypes.Image) {
          const thumbnailUrl = `${config.other.THUMBNAIL_URL}${s3Key}`;
          let thumbnails = {};
          if (typeof data.file_dimensions !== 'undefined') {
            const dimensions: number[] = data.file_dimensions as number[];
            if (dimensions && dimensions[0]) {
              if (dimensions[0] > 540) {
                Object.assign(thumbnails, { 540: `${thumbnailUrl}.thumbnail540.png` });
              }
              if (dimensions[0] > 720) {
                Object.assign(thumbnails, { 720: `${thumbnailUrl}.thumbnail720.png` });
              }
              if (dimensions[0] > 960) {
                Object.assign(thumbnails, { 960: `${thumbnailUrl}.thumbnail960.png` });
              }
              if (dimensions[0] > 1140) {
                Object.assign(thumbnails, { 1140: `${thumbnailUrl}.thumbnail1140.png` });
              }
              if (Object.keys(thumbnails).length > 1) {
                Object.assign(file, { thumbnails });
              }
            }
          }
        }
        return {
          ...data,
          file: {
            ...data.file,
            ...file,
          }
        };
      });
      return newDatas;
    }
    catch (e) {
      throw e
    }

  }
  else {
    return [];
  }
};

export default addFilesToData
