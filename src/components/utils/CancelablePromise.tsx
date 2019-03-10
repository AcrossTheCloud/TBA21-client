// https://medium.com/trabe/avoid-updates-on-unmounted-react-components-2fbadab17ad2

export const cancelablePromise = (promise) => {
    let hasCanceled: boolean = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            value => (hasCanceled ? reject({ isCanceled: true, value }) : resolve(value)),
            error => reject({ isCanceled: hasCanceled, error }),
        );
    });

    return {
        promise: wrappedPromise,
        cancel: () => (hasCanceled = true),
    };
};

export const appendPendingPromise = (self, promise) => {
    self.pendingPromises = [...self.pendingPromises, promise];
};

export const removePendingPromise = (self, promise) => {
    self.pendingPromises = self.pendingPromises.filter(p => p !== promise);
};
