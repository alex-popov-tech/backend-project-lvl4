setup:
	rm -rf node_modules; npm install
lint:
	npx eslint server
lint-watch:
	npx nodemon --exec npx eslint server
test-watch:
	npx jest --watch
dev:
	npx nodemon --exec npx babel-node server/bin/index.js
seed:
	npx knex seed:run
migrations:
	npx knex migration:latest
