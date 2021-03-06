'use strict';

const os = require('os');
const path = require('path');
const fs = require('fsxt');
const asar = require('asar');
const inquirer = require('inquirer');
const clog = require('clog');
const proc = require('mz/child_process');
const ws = require('windows-shortcuts-promise');

(async () => {
  async function input(question) {
    const answers = await inquirer.prompt([{name: 'zero', message: question}]);
    return answers.zero;
  }
  
  async function prompt(inquiry) {
    const answers = await inquirer.prompt([Object.assign({name: 'zero'}, inquiry)]);
    return answers.zero;
  }
  async function yesNo(inquiry) {
    return (await inquirer.prompt({
      name: 'confirm',
      type: 'confirm',
      message: inquiry,
    })).confirm;
  }

  const discordLocation = process.env.LOCALAPPDATA;

  const baseDir = {
    'Discord': discordLocation + '/Discord',
    'Discord PTB': discordLocation + '/DiscordPTB',
    'Canary': discordLocation + '/DiscordCanary',
  }[await prompt({
    type: 'list',
    message: 'Install on which Discord version?',
    choices: ['Discord', 'Discord PTB', 'Canary'],
  })];
  
  console.log('Copying tree to directory...');
  
  await fs.copy('./tree', baseDir);
  
  if (await yesNo('Install my personal CSS? (Includes blob emoji)')) {
    await fs.copy('./tree-my-css', baseDir);
  }
  
  if (await yesNo('Install my personal plugins? (Includes WhatsApp client)')) {
    await fs.copy('./tree-my-plugins', baseDir);
  }
  
  console.log('Installing electron...');
  console.log(await proc.exec('npm install -g electron@2.0.0 --arch=ia32'));
  
  console.log('Installing node modules...');
  console.log(await proc.exec('npm install', {cwd: baseDir + '/injectedNodeModules'}));
  
  try {
    await ws.create(os.homedir() + '/Desktop/Scriptycord.lnk', {
      target: '%APPDATA%/npm/node_modules/electron/dist/electron.exe',
      args: baseDir + '/injectedElectronLoader', // doesn't seem that i can use just '.' here
      workingDir: baseDir + '/injectedElectronLoader',
      icon: baseDir + '/app2.ico'
    });
  } catch (e) {
    console.error('failed to write shortcut, writing a batch file for you instead...');
    await fs.writeFile(os.homedir() + '/Desktop/Launch Discord.bat', 'electron ' + path.resolve(baseDir + '/injectedElectronLoader'));
  }
  
  
  console.log('discord patched! START DISCORD FROM THE DESKTOP SHORTCUT/BATCH FILE');

})().catch(e => {
  console.error(e);
});