const { workerData, parentPort } = require("worker_threads");
const { exec } = require("child_process");
const fs = require("fs");

const ffmpegPath = workerData.ffmpegPath;

const filePath = workerData.filePath;
const outputDir = workerData.outputDir;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const outputFile = workerData.outputFile;

const command = `${ffmpegPath} -i "${filePath}" -vf scale=250:-2 -c:v libx264 -start_number 0 -hls_time 1 -hls_list_size 0 -f hls "${outputFile}"`;

exec(command, (err, stdout, stderr) => {
  if (err) {
    parentPort.postMessage({ success: false, error: stderr });
  } else {
    parentPort.postMessage({ success: true, output: outputFile });
  }
});
