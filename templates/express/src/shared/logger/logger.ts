function ts() {
  return new Date().toISOString();
}

export const info = (msg: string, meta?: any) => {
  console.log(
    `${ts()} INFO: ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ""),
  );
};
export const warn = (msg: string, meta?: any) => {
  console.warn(
    `${ts()} WARN: ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ""),
  );
};
export const error = (msg: string, meta?: any) => {
  console.error(
    `${ts()} ERROR: ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ""),
  );
};
export const debug = (msg: string, meta?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.debug(
      `${ts()} DEBUG: ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ""),
    );
  }
};

export default { info, warn, error, debug };
