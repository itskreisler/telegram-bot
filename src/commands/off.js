const cmdOffRegExp = /^\/off/g;

const cmdOffFn = async () => {
  console.log("Apagando...");
  throw new Error("Apagando...");
};

export { cmdOffFn, cmdOffRegExp };
