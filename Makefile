setup:
	rm -rf node_modules; npm install
lint:
	npx eslint server
watch-lint:
	npx esw -w server
dev:
	npx nodemon --exec npx babel-node server/bin/index.js
