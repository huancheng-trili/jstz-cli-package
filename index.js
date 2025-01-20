const execFile = require('child_process').execFile;
const child = execFile('sh', ['/home/pi/Desktop/twitter/test'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
