const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./auth.js');


// const rest = new REST().setToken(token);

// ...

// for guild-based commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error);

// for global commands

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
readline.question("Enter \'delete-global-commands\' to delete all global commands: ", input => {
console.log(`Hello, ${input}!`);
if (input == "delete-global-commands") {
    console.log("Deleting all global commands...");
    const rest = new REST().setToken(token);
    try {
        rest.put(Routes.applicationCommands(clientId), { body: [] })
            .then(() => console.log('Successfully deleted all application commands.'))
            .catch(console.error);
    }
    catch (error) {
        console.log("An error occurred while deleting all global commands.")
        console.error(error);
    }
}
else {
    console.log("Cancelling deletion of all global commands...");
}
readline.close();
});