setup:
	rm -rf node_modules; npm install
watch-lint:
	npx nodemon --exec npx eslint server
dev: dev-backend
dev-backend:
	npx nodemon --exec npx babel-node server/bin/index.js
dev-frontend:
	npx webpack-dev-server
