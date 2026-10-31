import { createCloudinaryDriver } from "./cloudinary";
import { createLocalDriver } from "./local";
import { createS3Driver } from "./s3";
import type { StorageDriver } from "./types";

let driver: StorageDriver | undefined;

export function getStorage() {
  if (!driver) {
    switch (process.env.STORAGE_DRIVER) {
      case "s3":
        driver = createS3Driver();
        break;
      case "cloudinary":
        driver = createCloudinaryDriver();
        break;
      default:
        driver = createLocalDriver();
    }
  }
  return driver;
}
