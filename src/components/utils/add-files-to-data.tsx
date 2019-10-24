import config from 'config';
import { getCDNObject } from './s3File';
import { FileTypes, S3File } from '../../types/s3File';
import { HomepageData } from '../../types/Home';

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */
export default async (data: HomepageData[]): Promise<HomepageData[]> => {
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
