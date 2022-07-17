const ItemManager = artifacts.require("ItemManager");

contract("ItemManager", accounts => {

    it("... should let you create new Items.", async () => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test1";
        const itemPrice = 500;

        const result = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0] });
        console.log(result);
        assert.equal(result.logs[0].args._itemIndex, 0, "There should be one time index in there");
        const item = await itemManagerInstance.items(0);
        assert.equal(item._identifier, itemName, "The item has a different idetifer");
    });
    it("....should trigger payment", async () => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test2";
        const itemPrice = 500;

        const result = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0] });
        await web3.eth.sendTransaction({from: accounts[0], to: result.logs[0].args._address, value: 500 });
        const item = await itemManagerInstance.items(result.logs[0].args._itemIndex);
        console.log(item._step);
        assert.equal(item._step, 1, "The Item index should be 1 which means paid");
    })
});