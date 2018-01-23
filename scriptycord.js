'use strict';

const os = require('os');
const path = require('path');
const fs = require('fsxt');
const asar = require('asar');
const inquirer = require('inquirer');
const clog = require('clog');
const proc = require('mz/child_process');

(async () => {
  async function input(question) {
    const answers = await inquirer.prompt([{name: 'zero', message: question}]);
    return answers.zero;
  }
  
  async function prompt(inquiry) {
    const answers = await inquirer.prompt([Object.assign({name: 'zero'}, inquiry)]);
    return answers.zero;
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
  
  await fs.copy('./tree', baseDir);
  
  console.log(await proc.exec('npm install -g electron@1.6.15 --arch=ia32'));
  console.log(await proc.exec('npm install', {cwd: baseDir + '/injectedNodeModules'}));
  
  await fs.writeFile(os.homedir() + '/Desktop/Launch Discord.bat', 'electron ' + path.resolve(baseDir + '/injectedElectronLoader'));
  
  console.log('discord patched! START DISCORD FROM THE DESKTOP SHORTCUT');

})().catch(e => {
  console.error(e);
});