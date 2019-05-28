const ERCTest1 = artifacts.require("ERCTest1");
const ERCTest2 = artifacts.require("ERCTest2");
const ERCTest3 = artifacts.require("ERCTest3");
const ERCTest4 = artifacts.require("ERCTest4");
const ERCTest5 = artifacts.require("ERCTest5");

module.exports = function(deployer) {
  deployer.deploy(ERCTest1);
  deployer.deploy(ERCTest2);
  deployer.deploy(ERCTest3);
  deployer.deploy(ERCTest4);
  deployer.deploy(ERCTest5);
};
