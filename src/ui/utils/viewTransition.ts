export const startViewTransition = (cb: () => void) => {
  if (document.startViewTransition) document.startViewTransition(cb);
  else cb();
};
