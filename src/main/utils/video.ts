import fs from "fs";
import path from "path";

const getVideoList = (inputPath: string): Video[] => {
  const videoPaths: Video[] = getVideoPaths(inputPath);
  return videoPaths;
};

const getVideoPaths = (inputPath: string, maxDepth = 2, depth = 0): Video[] => {
  let videos: Video[] = [];
  const files = fs.readdirSync(inputPath);

  files.forEach((file) => {
    const fullPath = path.join(inputPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && depth < maxDepth) {
      videos = videos.concat(getVideoPaths(fullPath, maxDepth, depth + 1));
    } else if (
      stat.isFile() &&
      (file.endsWith(".mp4") || file.endsWith(".mov"))
    ) {
      videos.push({
        name: file,
        path: fullPath,
        extension: path.parse(file).ext,
        directory: fullPath.split("\\"),
        thumbnail: "",
      });
    }
  });

  return videos;
};

export { getVideoList };
