# discord-roguelike

## Getting Started

1. Clone the project from github. `git clone https://github.com/jhhocs/discord-roguelike.git` (Make sure to install git)
2. Make sure you have node.js installed (I am using v18.17.1)
3. Open the project.
4. Once node.js is installed, run `npm install` in the main directory

---

## Running the bot

1. Create a `.env` file and fill out the fields provided in `.env.sample` (DM me for the tokens / IDs)
2. Run `node .` in the main directory. The bot should now be running

---

## Adding / Updating commands

**NOTE:** Include the `dev: true` when working on new commands. This will prevent it from being deployed as a global command

### Dev Commands

1. Run `node deploy-dev-commands.js` to deploy all commands to the dev server

### Global Commands

1. Run `node deploy-global-commands.js` to deploy all commands (with the exception of dev commands with the `dev:true` tag or comands in the `commands/dev` directory) to all servers.

## Deleting Commands

1. Run `node delete-global-commands.js` to delete all global commands. You will be prompted in the terminal to confirm your action.

---

# Resources

- [GitHub Conventional Commit Messages](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13)
- discord.js
  - [Documentation](https://discord.js.org/)
  - [Github](https://github.com/discordjs)
- [Official Discord API](https://discord.com/developers/docs/intro)
