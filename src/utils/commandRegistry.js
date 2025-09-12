import fs from "node:fs";
import path from "node:path";

const commands = new Map();
const aliasesMap = new Map();

async function loadCommands() {
    const commandsPath = path.join(process.cwd(), "src", "commands");
    const categories = (fs.readdirSync(commandsPath, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = (fs.readdirSync(categoryPath)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(categoryPath, file);
            const { name, aliases } = (await import(commandPath)).default;

            commands.set(name, { path: commandPath, module: null });

            if (aliases && Array.isArray(aliases)) {
                aliases.forEach(alias => aliasesMap.set(alias, { path: commandPath, module: null }));
            }
        }
    }
}

async function getCommand(input) {
    let cmd = null;

    cmd = commands.get(input);

    if (!cmd) cmd = aliasesMap.get(input);
    if (!cmd) return null;

    return (!cmd.module) ? cmd.module = (await import(cmd.path)).default : cmd.module;
}

async function getCommands() {
    const allCommands = new Set();

    const commandsPath = path.join(process.cwd(), "src", "commands");
    const categories = (fs.readdirSync(commandsPath, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = (fs.readdirSync(categoryPath)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(categoryPath, file);
            const { execute, ...object } = (await import(commandPath)).default;
            allCommands.add(object);
        }
    }

    return allCommands;
}

async function getModules() {
    const _commands = await getCommands();
    const modules = new Map();

    for (let command of _commands) {
        if (!modules.has(command.category)) {
            modules.set(command.category, new Array(command));
        } else {
            modules.get(command.category).push(command);
        }
    }

    return { modules, commandsAmount: _commands.size };
}

async function getModule(target) {
    const { modules } = await getModules();

    if (!modules.has(target)) return null;

    return modules.get(target);
}

export {
    loadCommands,
    getCommand,
    getCommands,
    getModules,
    getModule,
    commands
}
