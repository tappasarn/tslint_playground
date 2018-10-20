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