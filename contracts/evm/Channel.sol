// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { ud60x18 } from "@prb/math/src/UD60x18.sol";
import { ISablierV2LockupLinear } from "@sablier/v2-core/src/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/v2-core/src/types/DataTypes.sol";

contract Interflow {
    ISablierV2LockupLinear public immutable SABLIER;

    // URI hash -> hosted subflows mapping.
    mapping(bytes32 => address[]) subflows;
    // not-so-decentralized link-to-resource entrypoint (stored as kv entry that maps dynamically)
    // global chats are settled entirely off-chain
    mapping(address => string) entrypoints;
    // several checks hoops
    mapping(address => address) guards;

    modifier celestial { _; }
    modifier authorized { _; }
    modifier once { _; }

    constructor(ISablierV2LockupLinear _sablier) {
        SABLIER = _sablier;
    }

    function enable_entrypoint(address subflow, string memory url) external authorized once {
        entrypoints[subflow] = url;
    }

    function join(address subflow, bytes32 supreme) external celestial {
        subflows[supreme].push(subflow);
    }

    function getSablierAddress() external view returns (address) {
        return address(SABLIER);
    }
}

contract SubflowFactory {
    Interflow public immutable SINGULARITY;
    
    constructor(Interflow _singularity) {
        SINGULARITY = _singularity;
    }

    function spawn(string memory title, uint32 member_limit, bytes32 supreme, IERC20 asset, uint256 entry/*, address[] calldata guards*/) public {
        Subflow subflow = new Subflow(msg.sender, title, member_limit, asset, entry);
        address account = address(subflow);

        SINGULARITY.join(account, supreme);
    }
}

/** Subflow is ERC721 representation of dedicated, user-created chats.
 *  Features:
 *  - Fixed supply membership system
    - Whtielisting
    - Storage rent |stream-powered (0~0)?|

    Off-chain part consists of storage entrypoint creation composed of:
    - URI: youtu.be/some_random_id
    - Inner ID: <calculated_address> ([empty] for default)
 */
error MembershipLimit();
error NotAMember();

contract Subflow is ERC721 {
    Interflow public immutable SINGULARITY;
    uint32 immutable public supply;
    IERC20 immutable asset;

    address private creator;
    uint256 private last_id = 0;

    string public title;
    uint256 public entry;

    mapping(address => bool) whitelist;
    mapping(address => uint256) membership_id;
    mapping(address => uint256) subscriptions;

    constructor(address _creator, string memory _title, uint32 _members_limit, IERC20 _asset, uint256 _entry) ERC721("Subflow", "STRML") {
        creator = _creator;
        title = _title;
        supply = _members_limit;

        asset = _asset;
        entry = _entry;
    }

    function join() public {
        if(last_id + 1 == supply) revert MembershipLimit();

        _subscribe();
        _safeMint(msg.sender, ++last_id);
    }

    function leave() public {
        uint256 id = membership_id[msg.sender];

        if(id == 0) revert NotAMember();

        _unsubscribe();
        _burn(id);
    }

    function present(address member) public view returns (bool) {
        return membership_id[member] != 0;
    }

    function _subscribe() internal returns (uint256) {
        address sablier = SINGULARITY.getSablierAddress();

        asset.transferFrom(msg.sender, address(this), entry);
        asset.approve(sablier, entry);

        LockupLinear.CreateWithDurations memory obj;

        obj.sender = msg.sender;
        obj.recipient = creator;
        obj.totalAmount = uint128(entry);
        obj.asset = asset;
        obj.transferable = false;
        obj.cancelable = true;
        obj.durations = LockupLinear.Durations({
            total: 12 weeks,
            cliff: 3 weeks
        });
        obj.broker = Broker(address(0), ud60x18(0));

        return ISablierV2LockupLinear(sablier).createWithDurations(obj);
    }

    function _unsubscribe() internal {
        address sablier = SINGULARITY.getSablierAddress();

        // TBD
    }
}