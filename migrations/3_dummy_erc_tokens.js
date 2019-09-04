const Weth = artifacts.require("Weth");
const Tether = artifacts.require("Tether");
const Leo = artifacts.require("Leo");
const OmiseGo = artifacts.require("OmiseGo");
const BAT = artifacts.require("BAT");
const ZeroX = artifacts.require("ZeroX");
const Golem = artifacts.require("Golem");
const Dai = artifacts.require("Dai");

module.exports = function (deployer) {
  deployer.deploy(Weth)
  deployer.deploy(Tether)
  deployer.deploy(Leo)
  deployer.deploy(Tether)
  deployer.deploy(OmiseGo)
  deployer.deploy(BAT)
  deployer.deploy(ZeroX)
  deployer.deploy(Golem)
  deployer.deploy(Dai)
};
