import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName('traffika')
  .commandDir('cmds')
  .help()
  .demandCommand(1)
  .argv;
