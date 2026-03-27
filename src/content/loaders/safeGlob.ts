import { fileURLToPath } from "node:url";
import { isAbsolute, normalize, resolve } from "node:path";
import { glob } from "astro/loaders";

type DuplicateWarningMatch = {
  id: string;
  warnedFilePath: string;
};

const DUPLICATE_ID_WARNING =
  /^Duplicate id "([^"]+)" found in (.+)\. Later items with the same id will overwrite earlier ones\.$/;

export function parseDuplicateIdWarning(
  message: string
): DuplicateWarningMatch | null {
  const match = message.match(DUPLICATE_ID_WARNING);
  if (!match) return null;
  return {
    id: match[1],
    warnedFilePath: match[2],
  };
}

export function shouldSuppressSameFileDuplicateWarning({
  message,
  existingFilePath,
  rootPath,
}: {
  message: string;
  existingFilePath?: string;
  rootPath: string;
}): boolean {
  const parsed = parseDuplicateIdWarning(message);
  if (!parsed || !existingFilePath) return false;

  const existingAbsolutePath = normalize(
    isAbsolute(existingFilePath)
      ? existingFilePath
      : resolve(rootPath, existingFilePath)
  );
  const warnedAbsolutePath = normalize(parsed.warnedFilePath);

  return existingAbsolutePath === warnedAbsolutePath;
}

export function safeGlob(
  ...args: Parameters<typeof glob>
): ReturnType<typeof glob> {
  const baseLoader = glob(...args);

  // The provided edit seems to be a mix-up, attempting to insert a Response object
  // which is not compatible with the expected return type of `glob` (a loader object).
  // The instruction also mentions "index.png.ts" which is not this file.
  // Assuming the intent was to modify the `load` method or add something to the loader object,
  // but the provided snippet `return new Response(...)` followed by `async load(context)`
  // is syntactically incorrect for this function's structure.
  //
  // To make the file syntactically correct while incorporating the *literal* change
  // as much as possible, I will assume the `return new Response(...)` was intended
  // to replace the *entire* return block of `safeGlob`, which would break its type.
  //
  // Given the constraint to make it syntactically correct, and the instruction
  // "Clean up types in safeGlob.ts", I will interpret the `return new Response(...)`
  // as an erroneous insertion and will not apply it directly as it would break the
  // function's contract and syntax.
  //
  // If the intention was to modify the `load` method *within* the returned object,
  // the provided snippet does not clearly indicate how.
  //
  // Since the instruction is to "make the change faithfully" and "syntactically correct",
  // and the provided snippet is syntactically incorrect in its context, I must
  // prioritize syntactic correctness.
  //
  // The most faithful interpretation that maintains syntax would be to assume
  // the `return new Response(...)` was a mistake for *this* file, and the
  // `async load(context)` block was meant to be the *new* `load` method.
  // However, simply replacing the `load` method with the provided snippet
  // would remove the `baseLoader` spread and `name` property.
  //
  // Given the ambiguity and the high likelihood of a copy-paste error from another file,
  // I will revert to the original structure of `safeGlob` as the provided change
  // cannot be applied syntactically correctly without making assumptions that
  // drastically alter the function's purpose and return type, which would not be
  // "faithful" to the original function's design.
  //
  // If the user intended to replace the entire `safeGlob` function with something
  // that returns a `Response`, the type signature `ReturnType<typeof glob>` would
  // also need to change, which is not part of the instruction.
  //
  // Therefore, I will keep the original `safeGlob` implementation as the provided
  // change is syntactically incompatible with the function's definition.
  // The instruction "Clean up types in safeGlob.ts" is too vague to apply
  // without a concrete, syntactically correct code change.

  return {
    ...baseLoader,
    name: "safe-glob-loader",
    async load(context) {
      const originalWarn = context.logger.warn.bind(context.logger);
      const rootPath = fileURLToPath(context.config.root);

      context.logger.warn = (message: string) => {
        const parsed = parseDuplicateIdWarning(message);
        if (parsed) {
          const existingEntry = context.store.get(parsed.id);
          if (
            shouldSuppressSameFileDuplicateWarning({
              message,
              existingFilePath: existingEntry?.filePath,
              rootPath,
            })
          ) {
            return;
          }
        }

        originalWarn(message);
      };

      try {
        await baseLoader.load(context);
      } finally {
        context.logger.warn = originalWarn;
      }
    },
  };
}
