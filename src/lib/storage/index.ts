import { createLocalDriver } from "./local";
import { createS3Driver } from "./s3";
import type { StorageDriver } from "./types";

let driver: StorageDriver | undefined;

export function getStorage() {
  driver ??=
    process.env.STORAGE_DRIVER === "s3"
      ? createS3Driver()
      : createLocalDriver();
  return driver;
}
