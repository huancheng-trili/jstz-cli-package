#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

// Windows binaries end with .exe so we need to special case them.
const binaryName = `jstz_${process.env.npm_package_version}`;

// Compute the path we want to emit the fallback binary to
const fallbackBinaryPath = path.join(__dirname, binaryName);

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

async function downloadBinaryFromNpm() {
  // Download the tarball of the right binary distribution package
  const downloadBuffer = await makeRequest(
    `https://github.com/huancheng-trili/test-cli/releases/download/${process.env.npm_package_version}/jstz_macos_arm64`
  );

  // Extract binary from package and write to disk
  fs.writeFileSync(
    fallbackBinaryPath,
    downloadBuffer
  );

  // Make binary executable
  fs.chmodSync(fallbackBinaryPath, "755");
}

function isPlatformSpecificPackageInstalled() {
  try {
    // Resolving will fail if the optionalDependency was not installed
    require.resolve(`${binaryName}`);
    return true;
  } catch (e) {
    return false;
  }
}

downloadBinaryFromNpm();

console.log('hi');
