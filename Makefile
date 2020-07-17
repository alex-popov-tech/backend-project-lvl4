setup:
	rm -rf node_modules; npm install
start:
	npm run start
dev:
	npx nodemon --verbose index.js
dev-webpack:
	npx webpack-dev-server --mode=development
