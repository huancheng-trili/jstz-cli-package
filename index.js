const execFile = require('child_process').execFile;
const child = execFile('sh', ['a.sh'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
