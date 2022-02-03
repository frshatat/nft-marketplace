const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    //reference to market address
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com");

    //pass in nft contract address of the nft deployment
    // pass in tokenId of the nft deployment
    // pass the auction price in metic currenncy
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});

    // skip first address because the initial address used is for deployment accounts
    // we skip the first address using the underscore when instiating the array
    // we dont want the buyer to also to be the seller
    const[_ , buyerAddress] = await ethers.getSigners();

    await market.connect(buyerAddress).createMarketItem(nftContractAddress, 1, {value: auctionPrice});

    const items = await market.fetchMarketItems();

    console.log('items: ', items);
  });
});
