# TSLint playground

This is a project that help you kick start with TSLint basic setup.

Before getting started, let's spin up the project.

## Building and running on localhost

First install dependencies:

```sh
npm install
```

To create a production build:

```sh
npm run build-prod
```

To create a development build:

```sh
npm run build-dev
```

## Running

Open the file `dist/index.html` in your browser

## TSLint
### Install TSLint with from the package manager
```
npm install tslint typescript --save-dev
# or
yarn add tslint typescript --dev

# with this project, we will just use npm
```
For the simplicity of this project, we will use rules provided from Airbnb

run the following command to get the config from npm
```
npm install tslint-config-airbnb --save-dev

# similar to above commands, you can do it with Yarn.
```
Since we did not install tslint globally, we will not be able to run tslint command from the command line. To be able to execute tslint, we will have to manually add the script into package.json

In package.json script property add the following line
```json
  "scripts": {
    "clean": "rm dist/bundle.js",
    "build-dev": "webpack -d --mode development",
    "build-prod": "webpack -p --mode production",
    "lint": "tslint" // Add this line !
  },
```
Create a file name tslint.json in the outer most level of the project

Add the following lines into tslint.json. To extends the rules from airbnb's rule set. And exclude some directory that we would not want to execute TSLint.
```json
{
    "extends": ["tslint:recommended", "tslint-config-airbnb"],
    "linterOptions": {
        "exclude":[
            "node_modules/**/*.ts",
            "config/**/*.js"
        ]
    }
}
```
Now you should be able to run tslint from the npm command.

```
npm run lint ./src/index.tsx
```

After the run completes, it will display the list of rules that our file does not follow.

Right now, we are able to run tslint on a single files that we have specify its path in the command.

We would like it to be able to run on the project level.

Add the following into package.json scripts property

```json
"scripts": {
  "clean": "rm dist/bundle.js",
  "build-dev": "webpack -d --mode development",
  "build-prod": "webpack -p --mode production",
  "lint": "tslint",
  "lint-proj": "tslint -p tsconfig.json" // add this line !
},
```

Now run 
```
npm run lint-proj
```
This will give you the result of your entire project along with the path of the files that errors occur.

## VSCode integration
For Visual Studio code use you can get real time linting by adding an extension call "TSLint".

## Creating your own rule
There will be time where you want to create special rules that is just for your project. Something like banning specific usage of some functions.

Here we will use an example provided by [tslint's site](https://palantir.github.io/tslint/develop/custom-rules/).

let's first create a directory of the outer most of the project. Let's name it *lint*. This will be the place where we keep our special rules.

Now, for this example, we will create a rule to ban the *import* statements.

Inside *lint* directory create a file name noImportsRule.ts (the file MUST contain suffix *Rule* and written in camelCase). 

paste a following code inside noImportsRule.ts
```ts
import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "import statement forbidden";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        // create a failure at the current position
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));

        // call the base version of this visitor to actually parse this node
        super.visitImportDeclaration(node);
    }
}

```
Since TSLint executes on Abstract Syntax Tree of the program. The code above will visit the source files of your program and apply the rule that you have written in *NoImportsWalker* class. The specific walker class that you wrote will have to be extended from Lint.RuleWalker. Lint.RuleWalker is a base class that provide you with the visiter pattern methods which you can override. For us, since we want to ban all the import statement we will pick to override *visitImportDeclaration* method.

In order in know the visiter method to override, you will have to know the type of node that you want to apply the rule to. 

but, before that list compile noImportsRule.ts into JavaScript
```
cd lint/
tsc --lib es2015 noImportsRule.ts
```

### A bit on AST

Let's spend a bit of time looking at the [AST](https://astexplorer.net/).

If you paste your code from index.tsx in the link above, you will be able to hover around and see the type of each node.

![ast](https://user-images.githubusercontent.com/11821799/47257888-ea52c300-d4bd-11e8-8dc4-69efc41703ba.png)

*to see more visiter methods [click here](https://github.com/palantir/tslint/blob/master/src/language/walker/syntaxWalker.ts#L217).

Now each of the import declaration on our file this being walk will get passed into visitImportDeclaration and we can add failure message to them.

After we added the rule file, we can see that in the index.tsx, they are not yet being applied.

We will have to enable them in our tslint.json. Add the following line to enable the rule and hook tslint.json file with the rules directory.
```json
    "rules": {
        "indent": [true, "spaces", 4],
        "max-classes-per-file": false,
        "no-imports": true // add this line
    },
    "rulesDirectory": "lint" // add this line to hook up the lint folder 
```
Right now, if we go to index.tsx in src folder, you will see that tslint is reporting our 2 import statements with our custom message *import statement forbidden*.

### Let's do something more specific
Now let's take a step further. Let's try to block only the import statement that import *react*.

If we go back to the AST explorer and click on the line that import react. You will see a section call moduleSpecifier which contain the text property "react".

We can apply the same step in *noImportsRule.ts. Make changes as follow.
```js
import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'import statement forbidden';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
  }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  public visitImportDeclaration(node: ts.ImportDeclaration) {
    // create a failure at the current position
    // ADD IF statement here !!!
    if (node.moduleSpecifier.getText() === "\'react\'") {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}
```
Recompile with the same command.

Now you should see TSLint only reports on the import statement of *react*.

## Debug with VSCode
In the case that your custom rules do not work as expected, you can always add console.log() in your someRule.ts file and recompile. Then hit f1 and type TSLint: Show output in VSCode.

## Create an NPM package
There will be times where you want to share the rules that you have created to different projects. Instead of copying rules into the new project over and over again, it might be a better idea to create a custom npm package for it.

1) Go to your github account and create a new repository for this tslint npm package.
![new-repo](https://user-images.githubusercontent.com/11821799/48848368-520a6f80-edd6-11e8-822f-932dafd98c85.png)


2) Clone the project into your local machine. 

3) Inside your project directory run the following command.
```sh
npm init
```

4) Let's name the entry point (main) as yourname-tslint.json. For the rest of the option it is totally up to you.

5) On the top level of the project's directory create yourname-tslint.json. This is where we will put the default rules.

6) Create folder called rules on the top level of the project as well. We will keep our custom rules inside this folder.

7) Create file name disallowedInTestsRule.ts in rules folder and add the following code. (Spend sometime with it, and see what it does. It is not too hard).
``` ts
import * as ts from "typescript";
import * as Lint from "tslint";

interface ICustomOption {
    name: string;
    message: string;
}

export class Rule extends Lint.Rules.AbstractRule {
    public static DEFAULT_FAILURE_STRING = "This method invocation is not allowed to be used on test files";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new DisallowedInTestsWalker(sourceFile, this.getOptions()));
    }
}

class DisallowedInTestsWalker extends Lint.RuleWalker {
    public visitCallExpression(node: ts.CallExpression) {
        const fileName: string = node && node.getSourceFile().fileName || "";
        const isTestFile: boolean = new RegExp("\\b" + ".test" + "\\b").test(fileName);
        const functionName: string = node && node.expression && node.expression.getText() || "";
        const verifiedCustomOptions: ICustomOption[] = this.verifyAndGetCustomOptions(functionName);

        if (isTestFile && verifiedCustomOptions.length > 0) {
            this.addFailure(
                this.createFailure(node.getStart(),
                node.getWidth(),
                verifiedCustomOptions[0].message || Rule.DEFAULT_FAILURE_STRING));
        }
        super.visitCallExpression(node);
    }

    private verifyAndGetCustomOptions(functionName: string): ICustomOption[] {
        const customOptionSetInTslintJson: ICustomOption[] = this.getOptions();
        const verifiedCustomOptions: ICustomOption[] = customOptionSetInTslintJson.filter(option => option && option.name === functionName);
        return verifiedCustomOptions;
    }
}
```

8) Since the code above requires typescript and tslint. We will have to install them.
```sh
npm install tslint typescript --save-dev
```

9) Now compile your rules into JavaScript with the following command. But, dont forget the change directory to rules folder first.
```sh
tsc --lib es2015 disallowedInTestsRule.ts
```

10) Now you will see a JS file got created.

11) Go to 'yourname-tslint.json' and add the following code.
``` json
{
    "rulesDirectory": "./rules",
    "rules": {
        "disallowed-in-tests": false
    }
}
```

12) you are set. Let's publish the npm package with 
```sh
npm publish
```

