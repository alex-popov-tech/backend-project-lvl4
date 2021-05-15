setup: preparation dependency migration
dependency:
	rm -rf node_modules; npm ci
preparation:
	npm run preparation

migration:
	npx knex migrate:latest
seed:
	npx knex seed:run

dev:
	npx nodemon --exec npx babel-node server/bin/index.js
build:
	npm run build

lint:
	npx eslint .
lint-fix:
	npx eslint --fix .
lint-watch:
	npx nodemon --exec npx eslint .

test:
	npx jest
test-watch:
	npx jest --watch
