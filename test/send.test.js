var amqp = require('amqplib/callback_api');
const sendMessage = require("../src/send");
const sinon= require("sinon");
const assert = require("chai").assert;


describe("Send.js Unit Test" , function()
{
this.timeout(2000);
this.slow(1000);

it("Error path Test" , () =>
{
const stub = sinon.stub(amqp, "connect");
stub.yields(true, undefined)
assert.throw(() => sendMessage());
sinon.assert.calledOnce(stub);
stub.restore();
});

it("Error path Test using Connection" , () =>
{
  const stub = sinon.stub(amqp, "connect");
  const stubCreateChannel = sinon.stub();
  stubCreateChannel.yields(true,undefined);
  stub.yields(false, {createChannel : stubCreateChannel})
  assert.throw(() => sendMessage());
  stub.restore();
});
it("Happy path Test" ,  (done) =>
{
  const stub = sinon.stub(amqp, "connect");
  const stubCreateChannel = sinon.stub();
  const stubClose = sinon.stub();
  const stubAssertQueue = sinon.stub();
  const stubsendToQueue = sinon.stub();
  const clock = sinon.useFakeTimers();
  const fakeLog = sinon.fake(); // stub calls real console.log and printing in cmd , it was just taking track of function calls
  const fakeprocessExit = sinon.fake();
  sinon.replace(console,"log", fakeLog);
  sinon.replace(process,"exit",fakeprocessExit);
  stubCreateChannel.yields(false,{assertQueue:stubAssertQueue,sendToQueue:stubsendToQueue });
  stub.yields(false, {createChannel:stubCreateChannel,close:stubClose});
  sendMessage();
  clock.tick(500);
  sinon.assert.calledWith(stubsendToQueue,"hello",Buffer.from("Hello World!"));
  sinon.assert.calledTwice(fakeLog);
  assert.equal(fakeLog.args[0][0]," [x] Sent %s");
  assert.equal(fakeLog.args[0][1],"Hello World!");
  assert.equal(fakeLog.args[1][0],"Send.js is Executed");
  sinon.assert.calledOnce(fakeprocessExit);
  assert.equal(fakeprocessExit.args[0][0],0);
  clock.restore();
  sinon.restore();
  stub.restore();
  done();
  });
});