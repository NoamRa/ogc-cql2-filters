import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CODE_EXAMPLES_DIR = path.resolve(__dirname, "code-examples");
const CODE_IMAGES_DIR = path.resolve(__dirname, "code-images");
const CONFIG_PATH = path.resolve(__dirname, "carbon-config.json");

async function getSourceFilePaths(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  return files
    .filter((dirent) => dirent.isFile() && /\.(js|mjs|ts|json|jsonc|text)$/.test(dirent.name))
    .map((dirent) => path.join(dir, dirent.name));
}

function extractSnippet(content) {
  const lines = content.split("\n");
  const startMarker = /^\s*\/\/\s*start\s*$/i;
  const endMarker = /^\s*\/\/\s*end\s*$/i;
  const startIndex = lines.findIndex((line) => startMarker.test(line));
  const endIndex = lines.findIndex((line) => endMarker.test(line));
  if (startIndex === -1 && endIndex === -1) {
    return content.trim();
  }
  const relevantLines = lines.slice(startIndex !== -1 ? startIndex + 1 : 0, endIndex !== -1 ? endIndex : undefined);
  return relevantLines.join("\n").trim();
}

async function runCarbonNow(settings, inputFile, outputFileName) {
  return new Promise((resolve, reject) => {
    const argPairs = {
      "--settings": JSON.stringify(settings),
      "--save-to": CODE_IMAGES_DIR,
      "--save-as": outputFileName,
      "--type": "png",
    };
    const args = [inputFile, ...Object.entries(argPairs).flat()];

    execFile("carbon-now", args, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

function getLanguage(extension) {
  const languageMap = {
    ".text": "javascript",
    ".jsonc": "json",
  };
  return languageMap[extension] || "auto";
}

async function main() {
  try {
    await fs.mkdir(CODE_IMAGES_DIR, { recursive: true });
    const sourceFilePaths = await getSourceFilePaths(CODE_EXAMPLES_DIR);
    if (sourceFilePaths.length === 0) {
      console.log(`No source files found in ${CODE_EXAMPLES_DIR}`);
      return;
    }
    const settings = JSON.parse(await fs.readFile(CONFIG_PATH, "utf-8"));

    console.log(`Found ${sourceFilePaths.length} files to process.`);
    for (const filePath of sourceFilePaths) {
      try {
        console.log(`Processing ${path.basename(filePath)}...`);
        const content = await fs.readFile(filePath, "utf-8");
        const snippet = extractSnippet(content);
        if (!snippet) {
          console.log(`Skipping ${path.basename(filePath)} as it is empty after extraction.`);
          continue;
        }
        let inputFile = filePath;
        let tempFile = null;
        // If snippet is not the whole file, write to temp file
        if (snippet !== content) {
          tempFile = path.join(os.tmpdir(), `carbon-now-tmp-${path.basename(filePath)}`);
          await fs.writeFile(tempFile, snippet);
          inputFile = tempFile;
        }

        const extension = path.extname(filePath);
        const title = path.basename(filePath, extension);
        await runCarbonNow({ ...settings, language: getLanguage(extension) }, inputFile, title);
        if (tempFile) {
          await fs.unlink(tempFile);
        }
        console.log(`Successfully generated ${path.join(CODE_IMAGES_DIR, title + ".png")}`);
      } catch (error) {
        console.error(`Failed to process file ${filePath}:`, error);
        console.error("Stopping.");
        process.exit(1);
      }
    }
    console.log("\nAll files processed.");
    process.exit(0);
  } catch (error) {
    if (error.code === "ENOENT" && error.path === CODE_EXAMPLES_DIR) {
      console.error(`Error: The directory ${CODE_EXAMPLES_DIR} does not exist.`);
      console.error("Please make sure the code-examples directory is in the same directory as the script.");
    } else {
      console.error("An error occurred during the process:", error);
    }
    process.exit(1);
  }
}

main();
