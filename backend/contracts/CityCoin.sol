//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

// Contracts
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Libraries
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/**
 * @title CityCoin Project, an ERC20 with multiple purposes.
 * @author Frenzoid.dev
 */
contract CityCoin is ERC20Pausable, Ownable, ReentrancyGuard {
    /**
    /// @dev Promissory notes map.
    mapping(address => PromissoryNote[]) promissoryNotes;

    /// @dev current mapping of user -> balance.
    mapping(address => uint256) public balances;

    /// @dev Promisory note structure.
    struct PromissoryNote {
        address payable beneficiary;
        uint256 ctcAmount;
        uint256 ethAmount;
        uint256 claimDate;
        uint256 timestamp;
    }

    /// @dev Promissory note creation event.
    event PromissoryNoteCreated(
        address indexed benefactor,
        address indexed beneficiary,
        uint256 ctcAmount,
        uint256 ethAmount,
        uint256 claimDate
    );

    /// @dev Promissory note claim event.
    event PromissoryNoteClaimed(
        address indexed beneficiary,
        uint256 ctcAmount,
        uint256 ethAmount,
        uint256 timestamp
    );
    */

    /// @dev Token Purnchase Event.
    event BuyTokens(address indexed buyer, uint256 ctcAmoun, uint256 ethAmount);

    /// @dev Token Sell Event.
    event SellTokens(
        address indexed seller,
        uint256 ctcAmount,
        uint256 ethAmount
    );

    /// @dev The total amount of tokens in existence.
    uint256 public constant maxTotalSupply = 100000 ether;

    /// @dev Token price in Ether.
    uint256 public constant ctcPrice = 0.001 ether;

    constructor() ERC20("City Coin", "CTC") {
        _mint(address(this), maxTotalSupply);
    }

    /// --- Owner Functions --- ///
    /**
     * @dev Mint new tokens, and send thme somewhere.
     */
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    /**
     * @dev Pauses contract transfers
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses contract transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /// --- Public Functions --- ///
    /**
     * @notice Buy tokens.
     */
    function buyTokens() external payable {
        // Check if the sender sent some eth.
        require(msg.value > 0, "CTC: You didn't send any eth!.");

        // We calculate how many tokens the customer wants to buy
        uint256 amountToBuy = (msg.value / ctcPrice) * 1 ether;

        // Check if we have enough tokens to sell.
        require(
            amountToBuy <= balanceOf(address(this)),
            "RDT-Vendor: We're out of tokens :c."
        );

        // Transfer the tokens.
        _transfer(address(this), msg.sender, amountToBuy);

        // Emit the token purchase Event.
        emit BuyTokens(msg.sender, amountToBuy, msg.value);
    }

    /**
     * @notice Sell tokens.
     */
    function sellTokens(uint256 _tokens) external {
        // Check if _tokens is 0 or negative.
        require(_tokens > 0, "CTC: You need to sell at least 1 token");

        // Check if the sender has enough tokens.
        require(
            _tokens <= balanceOf(msg.sender),
            "CTC: You don't have enough tokens to sell."
        );

        // Transfer tokens.
        _transfer(msg.sender, address(this), _tokens * 1 ether);

        // Calculate eth to transfer.
        uint256 amountEth = _tokens * ctcPrice;

        // check if we have enough Ether (we should, but "things happen").
        require(
            amountEth <= address(this).balance,
            "CTC: We dont have enough ETH for your tokens. Please, contact an Admin."
        );

        // Transfer the eth.
        (bool success, ) = msg.sender.call{value: amountEth}("");
        require(success, "CTC: CRITICAL: sellTokens transfer failed.");

        emit SellTokens(msg.sender, _tokens, amountEth);
    }
}
