const ItemManager = artifacts.require("./ItemManager.so");

module.exports = function (deployer) {
  deployer.deploy(ItemManager);
};
