var amqp = require('amqplib/callback_api');
const sendMessage = require("../src/send.js");
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
  const clock = sinon.useFakeTimers();  // does not work
  const spyLog= sinon.spy(console,"log");
  stubCreateChannel.yields(false,{assertQueue:stubAssertQueue,sendToQueue:stubsendToQueue });
  stub.yields(false, {createChannel:stubCreateChannel,close:stubClose});
  sendMessage();
  clock.tick(500);
  sinon.assert.calledWith(stubsendToQueue,"hello",Buffer.from("Hello World!"));
  sinon.assert.calledTwice(spyLog);
  assert.equal(spyLog.args[0][0]," [x] Sent %s" ,"Hello World!");
  assert.equal(spyLog.args[1][0],"Send.js is Executed");
  clock.restore();
  spyLog.restore();
  stub.restore();
  done();
  });
});