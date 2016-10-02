import { Pen } from './pen/index';
import { Turtle } from './turtle/index';
import { ExecQueue } from './exec-queue/index';
import { CommandHandler } from './command-handler/index';
import { CodeRunner } from './code-runner/index';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants/index';

import * as Debug from 'debug';
const debug = Debug('Logotron:Main');

const penCanvas = <HTMLCanvasElement>document.getElementById('p');
const turtleCanvas = <HTMLCanvasElement>document.getElementById('t');
penCanvas.width = turtleCanvas.width = CANVAS_WIDTH;
penCanvas.height = turtleCanvas.height = CANVAS_HEIGHT;
const penCanvasCtx = <CanvasRenderingContext2D>penCanvas.getContext('2d');
const turtleCanvasCtx = <CanvasRenderingContext2D>turtleCanvas.getContext('2d');
const textarea = <HTMLTextAreaElement>document.getElementById('editCommand');
const button = <HTMLButtonElement>document.getElementById('buttonRun');
const turtle = new Turtle(turtleCanvasCtx);
const pen = new Pen(penCanvasCtx);
const callStack = new ExecQueue();
const commandHandler = new CommandHandler(pen, turtle, callStack);

let instance = null;
button.addEventListener('click', function(e) {
  
  if (instance != null && instance.isRunning()) {
    debug('Logo still running commands, isRunning', instance.isRunning);
    return false;
  }

  pen.initialize();
  turtle.initialize();

  const inputs = textarea.value;
  const commands = CommandHandler.parseCommands(inputs);
  debug('Commands: ', commands);
  commands.filter(function(command) {
    return command !== '' && command != null;
  }).forEach(function (command) {
    let commandName = CommandHandler.getCommandName(command);
    let commandArgs = CommandHandler.getCommandArgs(command);
    try {
      commandHandler.register(commandName, commandArgs);
      debug('Command Name: ', commandName);
      debug('Command Args', commandArgs);
    } catch (e) {
      console.warn(e.name);
      console.warn(e.message);
    }
  });

  const codeRunner = new CodeRunner(callStack, 30);
  instance = codeRunner;
  codeRunner.run();

}, false);