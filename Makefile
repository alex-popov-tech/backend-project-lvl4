setup:
	rm -rf node_modules; npm install
lint:
	npx eslint server
watch-lint:
	npx nodemon --exec npx eslint server
watch-test:
	npx jest --watch
dev:
	npx nodemon --exec npx babel-node server/bin/index.js
