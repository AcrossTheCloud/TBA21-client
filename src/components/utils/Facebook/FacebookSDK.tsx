import config from '../../../config';

export const loadFacebookSDK = () => {
  const theWindow: any = window;  // tslint:disable-line: no-any
  theWindow.fbAsyncInit = () => {
    theWindow.FB.init({
      appId            : config.social.FB,
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v3.1'
    });
  };
  (function (d: Document, s: string, id: string) { // tslint:disable-line: no-any
       let js: any, fjs: any = d.getElementsByTagName(s)[0]; // tslint:disable-line: no-any
       if (d.getElementById(id)) { return; }
       js = d.createElement(s); js.id = id;
       js.src = 'https://connect.facebook.net/en_US/sdk.js';
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
};

export const waitForInit = () => { // loading the fb dialog box
  const
    theWindow: any = window;  // tslint:disable-line: no-any
  let tryCounter: number = 0;
  return new Promise((res, _rej) => {
    const hasFbLoaded = () => {
      tryCounter ++;
      if (theWindow.FB) {
        res(true);
      } else {
        if (tryCounter < 15) {
          setTimeout(hasFbLoaded, 300);
        } else {
          res(false);
        }
      }
    };
    hasFbLoaded();
  });
};
