#!/usr/bin/env node

const fs = require("fs");
const FileType = require("file-type");
const https = require("https");
const path = require("path");
const notifier = require("node-notifier");
const rl = require("readline");
const args = process.argv;
const chalk = require("chalk");

let currentPath;

const types = ["image", "video", "application", "compressed", "document"];

const downloads = process.env.USERPROFILE + "/Downloads";

const folderNames = {
  images: `${downloads}/Images`,
  videos: `${downloads}/Videos`,
  programs: `${downloads}/Programs`,
  compressed: `${downloads}/Compressed`,
  documents: `${downloads}/Documents`,
  others: `${downloads}/Others`,
};

const usage = () => {
  const usageText = `
  download helps you to download files and automatically
  put the in the right folder

  usage:
    download <command>

    commands can be:

    n means the todo number

    new:              used to create a new download
    help:             used to print the usage guide
    --version or -v:  used to check app version
  `;
  console.log(usageText);
};

//  =================  used to log errors to the console in red color =============
const errorLog = (error) => {
  const eLog = chalk.red(error);
  console.log(eLog);
};

// ===================== we make sure the length of the arguments is exactly three ================
if (args.length > 3) {
  errorLog("only one argument can be accepted");
  usage();
}

const commands = ["new", "help", "--version", "-v"];

// ======================== check if command is in commands array =====================
if (commands.indexOf(args[2]) == -1) {
  // errorLog("invalid command passed\nTry download help");
}

// ======================== prompt ===============================
const prompt = (question) => {
  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  return new Promise((resolve, error) => {
    r.question(question, (answer) => {
      r.close();
      resolve(answer);
    });
  });
};

// ========== check version =============
const appVersion = () => {
  console.log("1.0.0");
};

const download = (file) => {
  return new Promise(async (resolve, reject) => {
    // get file exe and mime
    const fromFile = await FileType.fromFile(file);

    // get file type
    const fileType = fromFile && fromFile.mime.split("/")[0];

    // get file extension
    const fileExt = fromFile && fromFile.ext;

    // check if file exist in my array
    const fileIndex = types.indexOf(fileType);

    // get file name
    const fileName = file?.split("/")[file?.split("/").length - 1];

    // check if directory exist
    // if it exist move the file
    // if it doesn't exist create and move the file
    const moveFile = (path) => {
      try {
        currentPath = `${path}`;
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
          fs.renameSync(file, `${path}/${fileName}`);
        } else {
          fs.renameSync(file, `${path}/${fileName}`);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    // check file type and move it to where it should go
    switch (fileIndex) {
      case 0:
        // ========= image ===========
        moveFile(folderNames.images);
        break;
      case 1:
        // ============ video ========
        moveFile(folderNames.videos);
        break;
      case 2 && fileExt === "exe":
        // ===== apps ========
        moveFile(folderNames.programs);
        break;
      case 2 && fileExt === "zip":
        // ===== zip =========
        moveFile(folderNames.compressed);
        break;
      case 3:
        // ===== zip =========
        moveFile(folderNames.compressed);
        break;
      case 4:
        // ======= docs ========
        moveFile(folderNames.documents);
      default:
        // ======= others ========
        moveFile(folderNames.others);
        break;
    }
    resolve("Download successful");
  });
};

// const url = "https://www.tutorialspoint.com/cg/images/cgbanner.jpg";

const newDownload = () => {
  const qurl = chalk.blue("Type in your todo\n");
  prompt(qurl).then((url) => {
    const qexe = chalk.blue("Enter file name with extension\n");
    prompt(qexe).then((exeName) => {
      console.log("processing...");
      let request = https.get(url, (res) => {
        // let len = parseInt(res.headers["content-length"], 10);
        // let body = "";
        // let cur = 0;
        // let total = len / 1048576;

        // res.on("data", (chunk) => {
        //   body += chunk;
        //   cur += chunk.length;
        //   console.log(
        //     `Downloading ${((100.0 * cur) / len).toFixed(2)}% ${(
        //       cur / 1048576
        //     ).toFixed(2)} mb\r.<br/> Total size: ${total.toFixed(2)} mb`
        //   );
        // });

        // res.on('end', () => {
        //   console.log(chalk.green('DONE') + "download completed");
        // })


        console.log("downloading...");
        const filePath = `income/${exeName}`;
        const writeStream = fs.createWriteStream(filePath);

        res.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close((error) => console.log(error));
          const fileToMove = `${__dirname}/${filePath}`;
          download(fileToMove)
            .then(() => {
              notifier.notify({
                title: "Download completed",
                message: `Thanks for using cli file downloader. Tell your friends about us.`,
                sound: true,
                wait: false,
                icon: path.join(__dirname, "Mark.png"),
                time: 1000,
              });
            })
            .then(() => {
              console.log(chalk.green("Done"));
            });
        });
      });

      request.on('error', () => console.log(error))
    });
  });
};

switch (args[2]) {
  case "help":
    usage();
    break;
  case "--version":
    appVersion();
    break;
  case "-v":
    appVersion();
    break;
  case "new":
    newDownload();
    break;
  default:
    errorLog("Invalid commad passed");
    usage();
    break;
}

notifier.on("click", (window) => {
  const { exec } = require("child_process");
  exec(`start ${currentPath}`);
});
