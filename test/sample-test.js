const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require('axios');


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
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});

    // skip first address because the initial address used is for deployment accounts
    // we skip the first address using the underscore when instiating the array
    // we dont want the buyer to also to be the seller
    const[_ , buyerAddress] = await ethers.getSigners();

    //use buyer address to connect to market
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    let items = await market.fetchMarketItems();

    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }));

    console.log('items: ', items);
  });
  it("Should fetch items created by current signed in user", async function(){
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
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});

    // skip first address because the initial address used is for deployment accounts
    // we skip the first address using the underscore when instiating the array
    // we dont want the buyer to also to be the seller
    const[_ , buyerAddress] = await ethers.getSigners();

    //use buyer address to connect to market
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    let data = await market.fetchItemsCreated();
    console.log(data);
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      return item
    }));

    console.log('items: ', items);
  })
});
