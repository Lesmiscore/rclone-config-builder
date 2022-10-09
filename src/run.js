const yaml = require("yaml");
const ini = require("ini");
const fs = require("fs");
const { ConfigBuilder } = require("./index");
const { reveal } = require("./util");

const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers');

let configLocation;
if (process.platform === "win32") {
    configLocation = path.join(process.env.APPDATA, "rclone/rclone.conf");
} else {
    let dotConfig;
    if (process.env.XDG_CONFIG_HOME) {
        dotConfig = process.env.XDG_CONFIG_HOME;
    } else {
        dotConfig = path.join(process.env.HOME, ".config");
    }
    configLocation = path.join(dotConfig, "rclone/rclone.conf");
}

yargs(hideBin(process.argv))
    .command('convert [yaml] [conf]', 'create a rclone config from yaml', yar =>
        yar.positional("yaml", {
            describe: "input yaml file",
        }).positional("conf", {
            describe: "output rclone config file",
            default: configLocation,
        }),
        ({ conf, yaml: yamlPath }) => {
            const inputFile = fs.readFileSync(yamlPath, { encoding: "utf-8" });
            const loaded = yaml.parse(inputFile);
            const builder = new ConfigBuilder();
            builder.loadRawRemotes(loaded);
            const remotes = builder.getRemotes();
            // console.log(ini.encode(remotes));
            fs.writeFileSync(conf, ini.encode(remotes));
        },
    )
    .command('reveal [text]', 'reveal the obscured password', yar =>
        yar.positional("text", {
            describe: "the obscured text",
        }),
        ({ text }) => {
            if (!text) return;
            console.log(reveal(text));
        },
    )
    .strictCommands()
    .demandCommand(1)
    .parse();

// console.log(parsed._)
