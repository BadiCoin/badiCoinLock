const SimpleERC20Token = artifacts.require('SimpleERC20Token');
const SimpleTimelockUpgradeable = artifacts.require(
  'SimpleTimelockUpgradeable'
);
const TokenTimelockProxy = artifacts.require('TokenTimelockProxy');

module.exports = async (deployer) => {
  // Migrations
  // await deployer.deploy(Migrations);
  const totalSupply = new web3.utils.BN(22000000000000);

  // ERC20 Token
  await deployer.deploy(SimpleERC20Token, 'Token', 'TOK', totalSupply);
  const token = await SimpleERC20Token.deployed();

  //Timelock implementation
  await deployer.deploy(SimpleTimelockUpgradeable);
  const timelockImplementation = await SimpleTimelockUpgradeable.deployed();

  //Timelock proxy
  await deployer.deploy(
    TokenTimelockProxy,
    token.address, //'0xf1Ed6D99DF458a7ccDEB1a5EF71fFAEfd2DDa1c4' ERC20 token testnet //'0xebe3b325Fe17F8D277809b73D78ECB19049D189a' pancake LP testnet
    timelockImplementation.address //'0x11667e97caA52748752cA00179717f45eB9b31b9' implementation testnet
  );
  const timelockProxy = await TokenTimelockProxy.deployed();
};
