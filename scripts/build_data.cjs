const fs = require("fs");
const path = require("path");
function w(p, c) { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, c); }

const COURSES = [
  ["english-a1", "\u0627\u0644\u