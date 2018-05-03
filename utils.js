const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const babelTypes = require("babel-types");
const generate = require("babel-generator").default;
const prettier = require("prettier");
const { get, set, forEach } = require("lodash");
const consoleRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\(.*[^]\);?/;
function getASTFromCode(code) {
  return babylon.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "flow"]
  });
}
function isLogNode(path) {
  return (
    get(path, "node.type") === "ExpressionStatement" &&
    get(path, "node.expression.type") === "CallExpression" &&
    get(path, "node.expression.callee.type") === "MemberExpression" &&
    get(path, "node.expression.callee.object.type") === "Identifier" &&
    get(path, "node.expression.callee.object.name") === "console"
  );
}
function getCodeFromAST(ast) {
  try {
    return prettier.format(generate(ast, { comments: true }).code);
  } catch (error) {
    console.log(error);
  }
}
function traverseComments(commentsArray, callback) {
  forEach(commentsArray, (comment, index) => {
    const value = get(comment, "value");
    if (consoleRegex.test(value)) {
      callback(commentsArray, comment, index);
    }
  });
}
function traverseAST(ast, callback) {
  try {
    traverse(ast, {
      enter: path => {
        callback(path);
      }
    });
  } catch (Error) {
    console.log(Error);
  }
}
function isLogUncommentedBefore(logsUncommented, value) {
  return logsUncommented.indexOf(value) !== -1;
}
const removeAllLogs = documentText => {
  const ast = getASTFromCode(documentText);
  traverseAST(ast, path => {
    if (isLogNode(path)) {
      path.remove();
    } else if (get(path, "node.leadingComments")) {
      traverseComments(
        get(path, "node.leadingComments"),
        (commentsArray, comment, index) => {
          commentsArray.splice(index, 1);
        }
      );
    } else if (get(path, "node.trailingComments")) {
      traverseComments(
        get(path, "node.trailingComments"),
        (commentsArray, comment, index) => {
          commentsArray.splice(index, 1);
        }
      );
    }
  });
  return getCodeFromAST(ast);
};
const commentAllLogs = documentText => {
  const ast = getASTFromCode(documentText);
  traverseAST(ast, path => {
    if (isLogNode(path)) {
      const code = getCodeFromAST(path.node);
      const textNode = babelTypes.jSXText("");
      const commmentBlock = { type: "CommentLine", value: ` ${code}` };
      set(textNode, "leadingComments", [commmentBlock]);
      path.replaceWith(textNode);
    }
  });
  return getCodeFromAST(ast);
};
const uncommentAllLogs = documentText => {
  const ast = getASTFromCode(documentText);
  let logsUncommented = [];
  traverseAST(ast, path => {
    if (get(path, "node.leadingComments")) {
      traverseComments(
        get(path, "node.leadingComments"),
        (commentsArray, comment, index) => {
          try {
            const value = get(comment, "value");
            // if (!isLogUncommentedBefore(logsUncommented, value)) {
            let commmentAst = getASTFromCode(value);
            // logsUncommented.push(value);
            commmentAst = get(commmentAst, "program.body.0");
            // console.log(commmentAst, "commmentAst");
            path.insertBefore(commmentAst);
            // }
            commentsArray.splice(index, 1);
          } catch (Error) {
            console.log(Error);
          }
        }
      );
    }
    // else if (get(path, "node.trailingComments")) {
    //   traverseComments(
    //     get(path, "node.trailingComments"),
    //     (commentsArray, comment, index) => {
    //       try {
    //         const value = get(comment, "value");
    //         // if (!isLogUncommentedBefore(logsUncommented, value)) {
    //         let commmentAst = getASTFromCode(value);
    //         // logsUncommented.push(value);
    //         commmentAst = get(commmentAst, "program.body.0");
    //         // console.log(commmentAst, "commmentAst");
    //         path.insertAfter(commmentAst);
    //         // }
    //         commentsArray.splice(index, 1);
    //       } catch (Error) {
    //         console.log(Error);
    //       }
    //     }
    //   );
    // }
  });
  return getCodeFromAST(ast);
};
module.exports.removeAllLogs = removeAllLogs;
module.exports.commentAllLogs = commentAllLogs;
module.exports.uncommentAllLogs = uncommentAllLogs;
