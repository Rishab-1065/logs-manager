const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const babelTypes = require("babel-types");
const generate = require("@babel/generator").default;
const { get, set, forEach } = require("lodash");
const consoleRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\(.*[^]\);?/;
function getASTFromCode(code) {
  try {
    return babylon.parse(code, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowAwaitOutsideFunction: false,
      plugins: [
        "jsx",
        // "flow",
        "flowComments",
        "typescript",
        "doExpressions",
        "objectRestSpread",
        "decorators",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "throwExpressions"
      ]
    });
  } catch (Error) {
    throw new Error("Something went wrong");
  }
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
    return generate(ast, { comments: true, compact: false }).code;
  } catch (error) {
    throw new Error("Something went wrong");
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
    throw new Error("Something went wrong");
  }
}
function isLogUncommentedBefore(logsUncommented, value) {
  return logsUncommented.indexOf(value) !== -1;
}
const removeAllLogs = documentText => {
  const ast = getASTFromCode(documentText);
  traverseAST(ast, path => {
    if (get(path, "node.leadingComments")) {
      traverseComments(
        get(path, "node.leadingComments"),
        (commentsArray, comment, index) => {
          commentsArray.splice(index, 1);
        }
      );
    }
    if (get(path, "node.trailingComments")) {
      traverseComments(
        get(path, "node.trailingComments"),
        (commentsArray, comment, index) => {
          commentsArray.splice(index, 1);
        }
      );
    }
    if (get(path, "node.innerComments")) {
      traverseComments(
        get(path, "node.innerComments"),
        (commentsArray, comment, index) => {
          commentsArray.splice(index, 1);
        }
      );
    }
    if (isLogNode(path)) {
      if (
        get(path, "node.leadingComments") ||
        get(path, "node.trailingComments")
      ) {
        const logNode = get(path, "node");
        const nodeLeadingComments = get(logNode, "leadingComments", []);
        const nodeTrailingComments = get(logNode, "trailingComments", []);
        const identifier = babelTypes.identifier("");
        set(identifier, "leadingComments", nodeLeadingComments);
        set(identifier, "trailingComments", nodeTrailingComments);
        const expresssionNode = babelTypes.expressionStatement(identifier);
        path.replaceWith(expresssionNode);
      } else {
        path.remove();
      }
    }
  });
  return getCodeFromAST(ast);
};
const commentAllLogs = documentText => {
  const ast = getASTFromCode(documentText);
  traverseAST(ast, path => {
    if (isLogNode(path)) {
      const logNode = get(path, "node");
      const nodeLeadingComments = get(logNode, "leadingComments", []);
      set(logNode, "leadingComments", []);
      const nodeTrailingComments = get(logNode, "trailingComments", []);
      set(logNode, "trailingComments", []);
      const code = getCodeFromAST(logNode);
      const jSXText = babelTypes.jSXText("");
      const commmentBlock = { type: "CommentBlock", value: ` ${code}` };
      nodeLeadingComments.push(commmentBlock);
      set(jSXText, "leadingComments", nodeLeadingComments);
      set(jSXText, "trailingComments", nodeTrailingComments);
      path.replaceWith(jSXText);
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
          } catch (Error) {}
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

    //         path.insertAfter(commmentAst);
    //         // }
    //         commentsArray.splice(index, 1);
    //       } catch (Error) {

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
