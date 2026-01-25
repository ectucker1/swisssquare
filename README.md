# SwissSquare

SwissSquare is (or will be) a web application for hosting swiss-system tournaments, primarily for Magic the Gathering draft events.
It supports generating brackets and match pairings, allows players to submit their match results, and displays the final rankings.

It also supports some basic data collection about the decks drafted, to help cube designers balance the draft environment.

It is built using [Svelte](https://svelte.dev) and [SvelteKit](https://svelte.dev/docs/kit/introduction).

## Developing

After installing dependencies with `npm install`, you can start a development server to host the site locally:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Testing

To run unit tests:

```sh
npm run test
```
