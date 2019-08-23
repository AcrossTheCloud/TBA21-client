import { Auth } from 'aws-amplify';
import { config as AWSConfig, S3 } from 'aws-sdk';
import { HeadObjectOutput } from 'aws-sdk/clients/s3';

import config from 'config';
import { FileTypes, S3File } from 'types/s3File';

import defaultVideoImage from 'images/defaults/video.jpg';

export const fileType = (type: string): FileTypes | null => {
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
  const downloadTextTypes = [
    'msword',
    'vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'vnd.ms-', // vnd.ms-powerpoint , excel etc
    'vnd.openxmlformats', // pptx powerpoint
    'vnd.oasis.opendocument', // OpenDocument
    'epub+zip',
    'rtf', // Rich text
    'xml',
    'vnd.amazon',
  ];
  if (type.includes('image')) {
    return FileTypes.image;
  } else if (type.includes('audio')) {
    return FileTypes.audio;
  } else if (type.includes('video')) {
    return FileTypes.video;
  } else if (downloadTextTypes.some(el => type.includes(el))) {
    return FileTypes.downloadText;
  } else if (type.includes('text')) {
    return FileTypes.text;
  }  else if (type.includes('pdf')) {
    return FileTypes.pdf;
  } else {
    return null;
  }
};

/**
 *
 * Gets the S3 Object from any UUID "folder"
 *
 * Converts it to a URL if the contentType is an image.
 *
 * @param key { string }
 */
export const getCDNObject = async (key: string): Promise<S3File | false> => {
  try {

    const
      url = `${config.other.BASE_CONTENT_URL}${key}`,
      result = await fetch(url, {
        mode: 'cors',
        method: 'HEAD'
      });

    let contentType: string | null = null;

    if (result.headers) {
      contentType = result.headers.get('content-type');
    }

    if (result && contentType !== null) {
      const
        type = fileType(contentType),
        response: S3File = {
          url,
          type: FileTypes.downloadText
        };

      if (type) {
        Object.assign(response, {type});

        if (type === 'text') {
          const body = await fetch(url);
          Object.assign(response, {body});
        }

        if (type === 'video') {
          const videoFiles = await getVideoFiles(key);
          // We always have a poster.
          Object.assign(response, { poster: videoFiles.poster });

          if (!!videoFiles.playlist) {
            Object.assign(response, { playlist: videoFiles.playlist });
          }
        }
      }

      return response;
    } else {
      return false;
    }

  } catch (e) {
    console.log('e', e);
    return false;
  }
};

/**
 *
 * Gets the S3 Object from any UUID "folder"
 *
 * Converts it to a URL if the contentType is an image.
 *
 * @param key { string }
 */
export const sdkGetObject = async (key: string): Promise<S3File | false> => {
  try {

    if (!AWSConfig.credentials) {
      AWSConfig.credentials = await Auth.currentCredentials();
    } else {
      AWSConfig.update({
       credentials: await Auth.currentCredentials()
     });
    }

    const s3 = new S3(
      {
        params: {
          Bucket: config.s3.BUCKET
        }
      }
    );

    const
      params = {
        Bucket: config.s3.BUCKET,
        Key: key
      },
      head: HeadObjectOutput = await s3.headObject({ Bucket: config.s3.BUCKET , Key: key}).promise();

    if (head && head.ContentType ) {
      const url = await s3.getSignedUrl('getObject', params);

      const type = fileType(head.ContentType);
      if (type) {
        return {
          url,
          type
        };
      }
    }

    return false;

    // return await contentType();
  } catch (e) {
    console.log('e', e);
    return false;
  }
};

export const getVideoFiles = async (key: string): Promise<{poster: string, playlist?: string}> => {
  const response = {
      poster: defaultVideoImage
    };
  try {
    const
      steamingURL = config.other.VIDEO_STREAMING_URL,
      privateUUID = key.split('/').slice(0, 2).join('/'),
      locationKeys = key.split('/').slice(2).join('/'),
      fileNameWithoutExtension = locationKeys.split('.'),
      // Poster
      posterFileName = fileNameWithoutExtension.slice(0, fileNameWithoutExtension.length - 1).join('.'),
      posterURL = `${steamingURL}${privateUUID}/thumbnails/${posterFileName}_thumb.0000001.jpg`,
      // Playlist
      playlistURLFileName = fileNameWithoutExtension.slice(0, fileNameWithoutExtension.length - 1).join('.'),
      playlistURL = `${steamingURL}${privateUUID}/hls/${playlistURLFileName}.m3u8`;

    // Fetch the thumbnail to see if it exists.
    const poster = await fetch(posterURL, {method: 'HEAD', mode: 'cors'});
    if (poster) {
      Object.assign(response, {poster: posterURL});
    }
    // Fetch the thumbnail to see if it exists.
    const playlist = await fetch(playlistURL, {method: 'HEAD', mode: 'cors'});
    if (playlist) {
      Object.assign(response, {playlist: playlistURL});
    }

    return response;
  } catch (e) {
    return response;
  }
};
