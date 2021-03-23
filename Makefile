setup: preparations dependencies migrations
dependencies:
	rm -rf node_modules; npm install
preparations:
	cp -n .env.example .env;

migrations:
	npx knex migrate:latest
seeds:
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
