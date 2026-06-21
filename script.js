const fs = require('node:fs')
const {
    XMLValidator //might be deprecated but i used it for 9client asset validation so its ok
} = require("fast-xml-parser");
const {
    fileTypeFromBuffer
} = require("file-type")
const fetchCookie = require("fetch-cookie").default(fetch) //fuck off
require("dotenv").config({
    quiet: true
});
const ids = fs.readFileSync("./ids.txt").toString().split("\r\n")
const prefix = "https://assetdelivery.roblox.com/v1/asset?id="
const suffix = "" //change to "&version=1" if you encounter any related issues
const cont = "./assets/";

fetchCookie.cookieJar.setCookie(".ROBLOSECURITY=" + process.env.COOKIE, prefix) //feel free to replace if yk what ur doing

if (!fs.existsSync(cont)) fs.mkdirSync(cont);
(async () => {
    for (let id of ids) {
        fetchCookie(prefix + id + suffix).then(async res => {
            if (res.ok) {
                let buf = Buffer.from(await (await res.blob()).arrayBuffer())
                let txt = buf.toString()
                let read = await fileTypeFromBuffer(buf)
                let ext
                if (!read?.ext) {
                    if (!XMLValidator.validate(txt).err || txt.startsWith("<roblox"))
                        ext = "rbx" + (txt.includes("class=\"Workspace\"") ? "l" : "m") //rbxl check may be unnecessary but its only for the xml type, binary would detect as rbxm
                    else if (txt.startsWith("version")) ext = "mesh"
                    else console.warn("WARNING: COULDNT GET FILE TYPE")
                } else ext = read.ext
                fs.writeFileSync(cont + id + (ext ? "." + ext : ""), buf)
            } else console.warn(`could not get asset ${id}, "${await res.text()}" status ${res.status}`)
        })
    }
})() //pity the cognitive complexity...  T.T