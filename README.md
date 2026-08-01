[![wakatime](https://wakatime.com/badge/user/df445858-58a6-4172-a4be-3b67be4d426e/project/018ec8ca-be34-48bb-88ab-d459c882cc42.svg)](https://wakatime.com/badge/user/df445858-58a6-4172-a4be-3b67be4d426e/project/018ec8ca-be34-48bb-88ab-d459c882cc42)

## Description

Poring adventure discord integration

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Slash commands

Discord only learns about a new, renamed or removed command when the command
list is pushed to it, so deploying is a manual step after changing anything
under `src/discord/commands` or `src/discord/context`.

The easiest way to drive this is the page at **`localhost:5000/discord`**: paste
the admin token, optionally set a guild id, and preview every command with its
description and options before deploying it.

The routes behind it are guarded by `ADMIN_TOKEN`, sent either as an
`x-admin-token` header or a `?token=` query parameter. With no `ADMIN_TOKEN` set
they reject every request. The page itself is unauthenticated — it holds no
secrets and is where the token gets typed — so keep port 5000 off the public
internet.

```bash
# preview what would be deployed, without touching Discord
$ curl "localhost:5000/discord/commands?token=$ADMIN_TOKEN"

# deploy to DISCORD_GUILD_ID (instant, best while iterating)
$ curl -X POST "localhost:5000/discord/commands?token=$ADMIN_TOKEN"

# deploy to a specific guild, or to every server (up to an hour to propagate)
$ curl -X POST "localhost:5000/discord/commands?token=$ADMIN_TOKEN&guildId=123"
$ curl -X POST "localhost:5000/discord/commands?token=$ADMIN_TOKEN&global=true"

# clear one scope — guild and global are separate lists
$ curl -X DELETE "localhost:5000/discord/commands?token=$ADMIN_TOKEN"
```

A command may declare `defaultMemberPermissions` to limit who sees it
(`HIDE_FROM_EVERYONE` restricts it to administrators) and `dmPermission` to
control whether it works outside a server. Both are defaults that a guild
administrator can override in Server Settings, so neither is a security
boundary — anything that must not run for a player is enforced by the API.

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
