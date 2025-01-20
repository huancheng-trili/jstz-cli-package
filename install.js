#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

// Windows binaries end with .exe so we need to special case them.
const binaryName = "jstz_cli";

// Compute the path we want to emit the fallback binary to
const fallbackBinaryPath = "/tmp/hasds";//path.join(__dirname, binaryName);


function downloadBinaryFromNpm() {
  console.log('ha');
  // Download the tarball of the right binary distribution package
  const file = fs.createWriteStream(fallbackBinaryPath);
  https.get(`https://github.com/huancheng-trili/test-cli/releases/download/${process.env.npm_package_version}/jstz_macos_arm64`, function(response) {
    response.pipe(file);
    response.on('data', (d) => {
      file.write(d);
    });
    response.on('end', () => {
      try {
        fs.chmodSync(fallbackBinaryPath, "755");
      } catch (e) {
        console.error(e.message);
      }
    });
  });
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
