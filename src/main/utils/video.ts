import fs from "fs";
import path from "path";

const getVideoList = async (inputPath: string): Promise<Video[]> => {
  const videoPaths = await getVideoPaths(inputPath);
  return videoPaths;
};

const getVideoPaths = async (
  inputPath: string,
  maxDepth = 2,
  depth = 0
): Promise<Video[]> => {
  let videos: Video[] = [];
  const files = await fs.promises.readdir(inputPath);

  for (const file of files) {
    const fullPath = path.join(inputPath, file);
    const stat = await fs.promises.stat(fullPath);

    if (stat.isDirectory() && depth < maxDepth) {
      const subVideos = await getVideoPaths(fullPath, maxDepth, depth + 1);
      videos = videos.concat(subVideos);
    } else if (
      stat.isFile() &&
      (file.endsWith(".mp4") || file.endsWith(".mov"))
    ) {
      videos.push({
        name: file,
        path: fullPath,
        extension: path.parse(file).ext,
        directory: fullPath.split(path.sep),
      });
    }
  }

  return videos;
};

export { getVideoList };
