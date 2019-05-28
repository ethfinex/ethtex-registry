const RegistryLookup = artifacts.require("RegistryLookup");

module.exports = function(deployer) {
  deployer.deploy(RegistryLookup);
};
