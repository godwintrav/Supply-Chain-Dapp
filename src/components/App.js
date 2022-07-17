import React, { Component } from "react";
import ItemManager from "../truffle_abis/ItemManager.json";
import Item from "../truffle_abis/Item.json";
import "./App.css";
import Web3 from 'web3';

class App extends Component {

    state = {cost: 0, itemName: "exampleItem1", loaded: false, itemManager: {}, item: {}};

    componentDidMount = async () => {
        try{
            //load web3 instance
            await this.loadWeb3();

            this.web3  = window.web3;

            this.accounts = await this.web3.eth.getAccounts();
            console.log(this.accounts[0]);

            const networkId = await this.web3.eth.net.getId();

            const itemManagerData = ItemManager.networks[networkId];
            if(itemManagerData){
                const itemManager = new this.web3.eth.Contract(
                    ItemManager.abi, itemManagerData.address);
                    this.setState({itemManager});
            }else{
                window.alert('Error! Tether Contract not deployed - no detected network');
            }

            const itemData = Item.networks[networkId];
            if(itemData) {
                const item =  this.web3.eth.Contract(
                    Item.abi, itemData.address
                );   
                this.setState({item}); 
            }

            this.listenToPaymentEvent();
            
              
            this.setState({loaded: true});
        } catch(error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
              );
              console.error(error);
        }
    };

    async loadWeb3() {
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }else if(window.web3){
            window.web3 = new Web3(window.web3.currentProvider);
        }else{
            window.alert('No ethereum browser detected! you can check out metamask');
        }
    }

    handleSubmit = async () => {
        const {cost, itemName} = this.state;
        console.log(itemName, cost, this.itemManager);
        let result = await this.state.itemManager.methods.createItem(itemName, cost).send({from: this.accounts[0] });
        console.log(result);
        alert("Send" +cost+"Wei to "+result.events.SupplyChainStep.returnValues._address);
    }

    handleInputChange = async (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    listenToPaymentEvent = () => {
        let self = this;
        this.state.itemManager.events.SupplyChainStep().on("dat", async function(evt) {
            if(evt.returnValues._step == 1){
                let item = await self.state.itemManager.methods.items(evt.returnValues._itemIndex).call();
                console.log(item);
                alert("Item " + item._identifier + "was paid, deliver it now!");
            };
            console.log(evt);
        });
    }

    render() {
        if(!this.state.loaded){
            return <div>Loading Web3, accounts, and contract....</div>;
        }
        return(
            <div className="App">
                <h1>Simple Decentralized Payment/Supply Chain Example!</h1>
                <h2>Items</h2>

                <h2>Add Element</h2>
                Cost: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
                Item Name: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange} />
                <button type="button" onClick={this.handleSubmit}>Create New Item</button>
            </div>
        );
    }
}

export default App;
