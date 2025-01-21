#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

const BINARY_NAME = "jstz";
const FALLBACK_BINARY_PATH = path.join(__dirname, BINARY_NAME);
const BINARY_DISTRIBUTION_PACKAGES = {
  darwin_arm64: "jstz_macos_arm64",
  linux_x64: "jstz_linux_amd64",
  linux_arm64: "jstz_linux_arm64"
};


function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            resolve(Buffer.concat(chunks));
          });
        } else if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          // Follow redirects
          makeRequest(response.headers.location).then(resolve, reject);
        } else {
          reject(
            new Error(
              `npm responded with status code ${response.statusCode} when downloading the package!`
            )
          );
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function downloadBinaryFromNpm(packageName) {
  // Download the tarball of the right binary distribution package
  const downloadBuffer = await makeRequest(
    `https://github.com/huancheng-trili/test-cli/releases/download/${process.env.npm_package_version}/${packageName}`
  );

  // Extract binary from package and write to disk
  fs.writeFileSync(
    FALLBACK_BINARY_PATH,
    downloadBuffer
  );

  // Make binary executable
  fs.chmodSync(FALLBACK_BINARY_PATH, "755");
}

function isPlatformSpecificPackageInstalled() {
  try {
    // Resolving will fail if the optionalDependency was not installed
    require.resolve(`${BINARY_NAME}`);
    return true;
  } catch (e) {
    return false;
  }
}

if (!isPlatformSpecificPackageInstalled()) {
  let key = `${process.platform}_${process.arch}`;
  let packageName =
  BINARY_DISTRIBUTION_PACKAGES[key];
  if (packageName === undefined) {
    throw new Error(`Unsupported platform ${key}`);
  }
  downloadBinaryFromNpm(packageName);
}
