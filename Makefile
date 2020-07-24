setup:
	rm -rf node_modules; npm install
build-frontend:
	npx webpack -p
build-backend:
	NODE_ENV=production npx babel server --out-dir dist/server
build: build-frontend build-backend
lint:
	npx eslint server
watch-lint:
	npx nodemon --exec npx eslint server
dev: dev-backend
dev-backend:
	npx nodemon --exec npx babel-node server/bin/index.js
dev-frontend:
	npx webpack-dev-server
