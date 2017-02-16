1 - Setup
---------

```
npm init -y
npm install --save-dev typescript
./node_modules/.bin/tsc.cmd --init

mkdir src
touch src/slackbot.ts
```

```
tsconfig.json += 
"rootDir": "src",
"outDir": "dist"
```

```
package.json +=
"build": "tsc"
```

```npm run build: tsc```
```npm run dev: tsc --watch```
```npm run start: node dist/slackbot.js```

2 - Code
--------

https://www.npmjs.com/package/slack-node

npm install --save slack-node
npm install --save-dev @types/slack-node

cd dist && ln -s ../node_modules node_modules