const path = require("path");
const mm = require("micromatch");
const { analyze, print } = require("../lib");

const getAbsoultePath = statsPath =>
  path.isAbsolute(statsPath) ? statsPath : path.join(process.cwd(), statsPath);

module.exports = function defaultCommand(statsFilePath, flags, pattern) {
  const stats = require(getAbsoultePath(statsFilePath));
  const report = analyze(stats).filter(module => {
    if (pattern && mm.isMatch(module.name, pattern)) {
      return true;
    } else if (pattern) {
      return false;
    }

    if (flags.filesOnly && module.type !== "file") return false;
    if (flags.moduleOnly && module.type !== "module") return false;

    if (flags.directOnly && module.depsType !== "direct") return false;
    if (flags.transitiveOnly && module.depsType !== "transitive") return false;
    if (flags.duplicatesOnly && (module.locations || []).length < 2)
      return false;

    return true;
  });

  const limit = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  print(report, flags, limit);
};