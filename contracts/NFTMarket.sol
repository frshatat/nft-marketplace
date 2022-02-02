// SPDX-LICENSE-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner; // listing fee owner of contract make commission on everyone else transaction
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price; 
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    //for when marketItem is created
    event MarketItemCreated (
        uint indexed itemid,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // get listing price
    function getlistingPrice () public view returns (uint256) {
        return listingPrice;
    }

    //price defined by user on the FE application
    // using nonReentrant modifier
    //price must be greater than zero and
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "price must be at least 1 wei");
        require(msg.value == listingPrice, "price must be equal to listing price");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);
        
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId,msg.sender, address(0), price, false);

    }

    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        // tranfer the owner to the sender
        idToMarketItem[itemId].seller.transfer(msg.value);

        // transfer from this contract address to this senderId
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

    }

}