setup: preparation dependency migration
dependency:
	rm -rf node_modules; npm ci
preparation:
	npm run preparation

migration:
	npx knex migrate:latest
seed:
	npx knex seed:run

build:
	npm run build
start:
	npm run start

dev:
	npx nodemon --exec npx babel-node server/bin/index.js

lint:
	npx eslint .
lint-fix:
	npx eslint --fix .

test:
	npx jest
