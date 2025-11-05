## About This Project
The Pokémon Team Planner is an open source web app that allows users to create teams for the various Pokémon games.

## Build Instructions
Nothing fancy, the app is built as a static page with all the necessary assets included so it doesn't need any infrastructure to run.

Run `npm install` first to install dependencies.

Use `npm run dev` to run the dev server at `http://localhost:3000`. Note that the dev build is a bit tempermental due React calling reducer functions twice in dev mode.
This causes the history API to try to push states multiple times which most browsers really don't like. Back and forward buttons may behave
unpredicably on debug builds because of this.

For a production build use `npm run build` to build, then `npm run start` to run the app in local server at `http://localhost:3000`.