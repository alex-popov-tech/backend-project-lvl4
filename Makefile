setup:
	rm -rf node_modules; npm install
lint:
	npx eslint .
lint-fix:
	npx eslint --fix .
lint-watch:
	npx nodemon --exec npx eslint .
test-watch:
	npx jest --watch
dev:
	npx nodemon --exec npx babel-node server/bin/index.js
seed:
	npx knex seed:run
migrations:
	npx knex migration:latest
