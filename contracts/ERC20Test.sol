pragma solidity 0.5.0;


contract SafeMath {

    /* function assert(bool assertion) internal { */
    /*   if (!assertion) { */
    /*     throw; */
    /*   } */
    /* }      // assert no longer needed once solidity is on 0.4.10 */

    function safeAdd(uint256 x, uint256 y) internal pure returns(uint256) {
      uint256 z = x + y;
      assert((z >= x) && (z >= y));
      return z;
    }

    function safeSubtract(uint256 x, uint256 y) internal pure returns(uint256) {
      assert(x >= y);
      uint256 z = x - y;
      return z;
    }

    function safeMult(uint256 x, uint256 y) internal pure returns(uint256) {
      uint256 z = x * y;
      assert((x == 0)||(z/x == y));
      return z;
    }

}

contract Token {
    uint256 public totalSupply = 10000000;
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public  returns (bool success);
    function approve(address _spender, uint256 _value) public  returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract StandardToken is Token {

    constructor() public {
      balances[msg.sender] = totalSupply;               // Give the creator all initial tokens
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
      if (balances[msg.sender] >= _value && _value > 0) {
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
      } else {
        return false;
      }
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
        balances[_to] += _value;
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
      } else {
        return false;
      }
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
}


contract WEth is StandardToken, SafeMath {
  string public name = "Wrapped Ether";
  string public symbol = "WETH";
  uint public decimals = 20;
}

contract Leo is StandardToken, SafeMath {
  string public name = "Bitfinex LEO Token";
  string public symbol = "LEO";
  uint public decimals = 20;
}

contract Tether is StandardToken, SafeMath {
  string public name = "Tether USD";
  string public symbol = "USDt";
  uint public decimals = 2;
}

contract OmiseGo is StandardToken, SafeMath {
  string public name = "OmiseGo";
  string public symbol = "OMG";
  uint public decimals = 10;
}

contract BAT is StandardToken, SafeMath {
  string public name = "Basic Attention Token";
  string public symbol = "BAT";
  uint public decimals = 3;
}

contract ZeroX is StandardToken, SafeMath {
  string public name = "0x";
  string public symbol = "ZRX";
  uint public decimals = 4;
}

contract Golem is StandardToken, SafeMath {
  string public name = "Golem";
  string public symbol = "GNT";
  uint public decimals = 1;
}

contract Dai is StandardToken, SafeMath {
  bytes32 public name = "Dai Stablecoin";
  bytes32 public symbol = "DAI";
  uint public decimals = 1;
}