var amqp = require('amqplib/callback_api');
const receiveMessage = require("../src/receive");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("Receiver.js Test" , function()
{
this.timeout(2000);
this.slow(1000);

it("Error Path Test" , () =>
{
 const stubAmqp = sinon.stub(amqp , "connect");
 stubAmqp.yields(true, undefined);
 assert.throw(() => receiveMessage());
 stubAmqp.restore();
});

it("Error Path Test using createChannel" , () =>
{
 const stubAmqp = sinon.stub(amqp , "connect");
 const stubCreateChannel = sinon.stub();
 stubCreateChannel.yields(true, undefined);
 stubAmqp.yields(false, { createChannel: stubCreateChannel});
 assert.throw(() => receiveMessage());
 stubAmqp.restore();
});

it("Happy Path test" , () =>
{
 const stubAmqp = sinon.stub(amqp , "connect");
 const stubCreateChannel = sinon.stub();
 const stubAssertQueue = sinon.stub();
 const fakeConsoleLog = sinon.fake();
 const stubConsume = sinon.stub();
 stubConsume.yields({ content: "Hello World!" });
 sinon.replace(console,"log",fakeConsoleLog);
 stubCreateChannel.yields(false, { assertQueue: stubAssertQueue , consume: stubConsume});
 stubAmqp.yields(false, { createChannel: stubCreateChannel});
 receiveMessage();
 sinon.assert.calledTwice(fakeConsoleLog);
 assert.equal(fakeConsoleLog.args[0][0] ," [*] Waiting for messages in %s. To exit press CTRL+C");
 assert.equal(fakeConsoleLog.args[0][1] ,"hello");
 assert.equal(fakeConsoleLog.args[1][0] ," [x] Received %s");
 assert.equal(fakeConsoleLog.args[1][1] ,"Hello World!");
 stubAmqp.restore();
 sinon.restore();
});
});
