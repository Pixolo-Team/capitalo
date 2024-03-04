"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNoun = void 0;
const nouns_1 = require("./nouns");
const checkNoun = (word) => {
    return nouns_1.nouns.includes(word);
};
exports.checkNoun = checkNoun;
//# sourceMappingURL=check.util.js.map