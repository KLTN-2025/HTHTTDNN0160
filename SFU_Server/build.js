// build.js
import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["./node_modules/mediasoup-client/lib/index.js"],
    bundle: true,
    minify: true,
    format: "iife",
    globalName: "mediasoupClient",
    outfile: "./public/modules/mediasoupclient.min.js",
});

console.log("Build hoàn tất: public/modules/mediasoupclient.min.js");
