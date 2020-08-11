setup:
	rm -rf node_modules; npm install
lint:
	npx eslint server
lint-watch:
	npx nodemon --exec npx eslint server
dev:
	npx nodemon --exec npx babel-node server/bin/index.js
