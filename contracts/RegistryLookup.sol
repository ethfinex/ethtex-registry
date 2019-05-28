pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

contract Ownable {
  address private _owner;

  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() internal {
    _owner = msg.sender;
    emit OwnershipTransferred(address(0), _owner);
  }

  /**
   * @return the address of the owner.
   */
  function owner() public view returns(address) {
    return _owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner());
    _;
  }
  
  /**
   * @return true if `msg.sender` is the owner of the contract.
   */
  function isOwner() public view returns(bool) {
    return msg.sender == _owner;
  }
}

contract ERC20Interface {
  function name() public view returns (string memory);
  function symbol() public view returns (string memory);
  function decimals() public view returns (uint8);
}

contract RegistryLookup is Ownable{

    mapping (address => bool) public authorisedStatus;
    event AddNewToken(address newToken);
    event RemoveToken(address token);

    address[] public authorisedTokens;

    function addNewTokens(address[] memory _tokens) public onlyOwner {
        for (uint i = 0; i < _tokens.length; i++) {
            authorisedStatus[_tokens[i]] = true;
            authorisedTokens.push(_tokens[i]);
            emit AddNewToken(_tokens[i]);
        }
    }

    function removeTokens(address[] memory _tokens) public onlyOwner {
        for (uint i = 0; i < _tokens.length; i++) {
            require(authorisedStatus[_tokens[i]] == true, "token already removed");
            authorisedStatus[_tokens[i]] = false;
            emit RemoveToken(_tokens[i]);
        }
    }

    function getAvailableTokens() public view returns(address[] memory tokens) {
        tokens = new address[](authorisedTokens.length);

        for (uint i = 0; i < authorisedTokens.length; i++) {
            if (authorisedStatus[authorisedTokens[i]]) {
                tokens[i] = authorisedTokens[i];
            } else {
                tokens[i] = address(0);
            }
        }
    }

    mapping (uint => uint[]) public pairs;
    uint[] public tokensWithPairsLUT;

    // Adds N pairs for a given token (by index stored on authorisedTokens)
    function addPairs(uint _tokenIndex, uint[] memory _tokenPairsIndexes) public onlyOwner {
      require(_tokenIndex < authorisedTokens.length, "token doesn't exist on tokenIndex ");
      for( uint i = 0; i < _tokenPairsIndexes.length; i++ ){
        require(_tokenPairsIndexes[i] < authorisedTokens.length, "a token doesn't exist on tokenPairsIndexes");
        require(_tokenPairsIndexes[i] != _tokenIndex, "a token can't have a pair with itself");
        if(pairs[_tokenIndex].length == 0) {
          tokensWithPairsLUT.push(_tokenIndex);
        }
        pairs[_tokenIndex].push(_tokenPairsIndexes[i]);
      }
    }

    function removePairs( uint _tokenIndex ) public onlyOwner {
      delete pairs[_tokenIndex];
    }

    function getTokenIndexesWithPairs() public view returns(uint[] memory) {
      return tokensWithPairsLUT;
    }

    function getPairsForTokenByIndex(uint _index) public view returns(uint[] memory result) {
      result = new uint[](pairs[_index].length);
      for( uint i = 0; i < pairs[_index].length; i++ ) {
        if(authorisedStatus[authorisedTokens[pairs[_index][i]]] == true){
          result[i] = pairs[_index][i];
        } else {
          // removed tokens will be sent as _index (better than 0, because tokens cant have a pair with itself, while 0 is a valid index)
          result[i] = _index;
        }
      }
    }

    function getTokenData(address[] memory _tokens) public view returns (
      string[] memory names, string[] memory symbols, uint[] memory decimals
      ) {
      names = new string[](_tokens.length);
      symbols = new string[](_tokens.length);
      decimals = new uint[](_tokens.length);
      for (uint i = 0; i < _tokens.length; i++) {
          names[i] = ERC20Interface(_tokens[i]).name();
          symbols[i] = ERC20Interface(_tokens[i]).symbol();
          decimals[i] = ERC20Interface(_tokens[i]).decimals();
      }
    }

}