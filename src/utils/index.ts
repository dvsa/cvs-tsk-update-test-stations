const createMajorVersionNumber = (num: string): string => {
  if (!num) {
    throw new Error('Invalid format number given, it must match \'x.x.x\' format.');
  }
  return num.split('.')[0];
};
const createHandlerBasePath = (s: string): string => `v${s}`;

export { createMajorVersionNumber, createHandlerBasePath };
