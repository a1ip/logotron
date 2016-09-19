;(function() {

  'use strict';

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 800;
  const canvas = <HTMLCanvasElement>document.getElementById('c');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  window.ctx = ctx; // for debug

  class Point2d {

    public x;
    public y;
    public constructor(x : number, y : number) {
      this.x = x;
      this.y = y;
    }

  }

  class CanvasHandler {

    private ctx: CanvasRenderingContext2D = null;
    private origin: Point2d = {
      x: 0,
      y: 0
    };
    private posX: number = 0;
    private posY: number = 0;
    private degree: number = 90;
    private queue: Array<Function> = [];
    private isDrawable: boolean = true;

    public constructor(posX : number, posY : number, ctx : CanvasRenderingContext2D) {
      this.posX = posX;
      this.posY = posY;
      this.ctx = ctx;

      let width = this.ctx.canvas.width;
      let height = this.ctx.canvas.height;
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.origin.x = width / 2;
      this.origin.y = height / 2;
    }

    private resetCanvas() {
      let width = this.ctx.canvas.width;
      let height = this.ctx.canvas.height;
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    public run() {

      this.resetCanvas();

      this.posX = this.origin.x;
      this.posY = this.origin.y;
      this.ctx.moveTo(this.posX, this.posY);

      this.queue.forEach(function(command) {
        command();
      });

      console.log('--- finish exec command, stroke it ---');
      this.ctx.stroke();
    }

    private transformX(x : number) : number {
      return this.posX + x;
    }

    private transformY(y : number) : number {
      return this.posY + y;
    }

    public enqueue(func) {
      this.queue.push(func);
    }

    public setDrawableTo(isDrawable : boolean) : void {
      this.isDrawable = isDrawable;
      console.log('set isDrawable to : ', this.isDrawable);
    }

    public moveForward(length : number) {

      let radian = deg2rad(this.degree);
      this.posX = this.transformX(Math.cos(radian) * length);
      this.posY = this.transformY(Math.sin(radian) * length);

      if (this.isDrawable) {
        this.ctx.lineTo(this.posX, this.posY);
      } else {
        this.ctx.moveTo(this.posX, this.posY);
      }

      console.log('move to :', this.posX, this.posY);

    }

    public moveBackward(length : number) {
      this.moveForward(-length);
    }

    public rotateRight(degree : number) {
      this.degree = this.degree - degree;
      console.log('rotate right: ', this.degree);
    }

    public rotateLeft(degree : number) {
      this.degree = this.degree + degree;
      console.log('rotate left: ', this.degree);
    }

  }

  const INPUT_PARSE_REGEXP = /^(PU|PD|FD|BK|RT|LT)\((.*)\).*$/;
  class InputHandler {

    private handler: CanvasHandler;

    public constructor(c : CanvasHandler) {
      this.handler = c;
    }
    public PU() {
      console.log('--- input command: pen up ---');
      this.handler.enqueue(this.handler.setDrawableTo.bind(this.handler, false));
    }
    public PD() {
      console.log('--- input command: pen down ---');
      this.handler.enqueue(this.handler.setDrawableTo.bind(this.handler, true));
    }
    public FD(length : number) {
      console.log('--- input command: forward ---');
      this.handler.enqueue(this.handler.moveForward.bind(this.handler, length));
    }
    public BK(length : number) {
      console.log('--- input command: backward ---');
      this.handler.enqueue(this.handler.moveBackward.bind(this.handler, length));
    }
    public RT(degree : number) {
      console.log('--- input command: rotate right ---');
      this.handler.enqueue(this.handler.rotateRight.bind(this.handler, degree));
    }
    public LT(degree : number) {
      console.log('--- input command: rotate left ---');
      this.handler.enqueue(this.handler.rotateLeft.bind(this.handler, degree));
    }
    public static getCommandName(str) {
      return str.replace(INPUT_PARSE_REGEXP, "$1");
    }
    public static getCommandArgs(str) {
      return str.replace(INPUT_PARSE_REGEXP, "$2").split(',');
    }
  }

  const textarea = <HTMLTextAreaElement>document.getElementById('editCommand');
  const button = <HTMLButtonElement>document.getElementById('buttonRun');

  button.addEventListener('click', function(e) {

    const canvasHandler = new CanvasHandler(canvas.width/2, canvas.height/2, ctx);
    const inputHandler = new InputHandler(canvasHandler);

    const inputs = textarea.value;
    const commands = parseCommands(inputs);
    console.log(commands);
    commands.filter(function(command) {
      return command !== '' && command != null;
    }).forEach(function (command) {
      let commandName = InputHandler.getCommandName(command);
      let commandArgs = InputHandler.getCommandArgs(command);
      try {
        inputHandler[commandName].apply(inputHandler, commandArgs);
        console.log(commandName);
        console.log(commandArgs);
      } catch (e) {
        console.warn(e.name);
        console.warn(e.message);
        console.warn(commandName);
        console.warn(commandArgs);
      }
    });

    console.log('--- finish enqueue commands ---');
    canvasHandler.run();

  }, false);

  function parseCommands(commands : string) : Array<string> {

    if (commands === '' || commands.length < 1) return [];
    const parsed = commands.split(/\r\n|\r|\n/);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];

  }

  function deg2rad(degree : number) : number {

    // 半径を1としたときの直径は2でその円周の長さは2 * 1 * Math.PI
    // したがって、弧度法で測った場合の角度degreeは degree / 360 * 2 * 1 * Math.PI
    let radian = degree / 180 * Math.PI;
    console.log(radian);
    return radian;

  }

})();