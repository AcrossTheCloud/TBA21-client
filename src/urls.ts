export const viewProfileURL = (id: string): string => `/profiles/${id}`;

export const itemURL = (id: string): string => `/view/${id}`;

export const collectionURL = (id: string): string => `/collection/${id}`;

export const iframeEmbedCodeURL = (id: string, title: string): string =>
  `<iframe src="https://${window.location.hostname}/embed/${id}" title="${title}"/></iframe>`;
