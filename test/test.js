const SimpleERC20Token = artifacts.require('SimpleERC20Token');
const SimpleTimelockUpgradeable = artifacts.require(
  'SimpleTimelockUpgradeable'
);
const TokenTimelockProxy = artifacts.require('TokenTimelockProxy');

contract('Lock', (accounts) => {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const millisToWait = 2500;
  const debatingPeriodMul = 2;

  it('should transfer 100 tokens to alice and bob', async () => {
    const token = await SimpleERC20Token.deployed();
    const amount = new web3.utils.BN(100);

    const resAlice = await token.transfer(alice, amount, {
      from: owner,
    });
    const resBob = await token.transfer(bob, amount, {
      from: owner,
    });
    const balanceAlice = await token.balanceOf(alice);
    const balanceBob = await token.balanceOf(bob);
    assert.equal(balanceAlice, '100', 'Token was not correctly transferred');
    assert.equal(balanceBob, '100', 'Token was not correctly transferred');
  });

  it('should lock 10 tokens each for alice and bob', async () => {
    const token = await SimpleERC20Token.deployed();
    const proxy = await TokenTimelockProxy.deployed();
    const amountToLock = new web3.utils.BN(10);
    const releaseDateNotBN = Math.floor((Date.now() + millisToWait) / 1000);
    const releaseDate = new web3.utils.BN(releaseDateNotBN);

    await token.approve(proxy.address, amountToLock, {
      from: alice,
    });
    const resAlice = await proxy.lockTokens(alice, amountToLock, releaseDate, {
      from: alice,
    });

    await token.approve(proxy.address, amountToLock, {
      from: bob,
    });
    const resBob = await proxy.lockTokens(bob, amountToLock, releaseDate, {
      from: bob,
    });

    const lockAlice = await proxy.checkLockerReleaseTimesAndBalances(alice);
    assert.equal(
      lockAlice[0],
      releaseDateNotBN,
      'Release date was not correctly set'
    );
    assert.equal(lockAlice[1], '10', 'Token was not correctly locked');

    const lockBob = await proxy.checkLockerReleaseTimesAndBalances(bob);
    assert.equal(
      lockBob[0],
      releaseDateNotBN,
      'Release date was not correctly set'
    );
    assert.equal(lockBob[1], '10', 'Token was not correctly locked');
  });

  it('should release 10 tokens each for alice and bob', async () => {
    const token = await SimpleERC20Token.deployed();
    const proxy = await TokenTimelockProxy.deployed();
    const amountLocked = new web3.utils.BN(10);

    const lockAlice = await proxy.checkLocker(alice);
    const lockContractAlice = await SimpleTimelockUpgradeable.at(lockAlice[0]);

    const lockBob = await proxy.checkLocker(bob);
    const lockContractBob = await SimpleTimelockUpgradeable.at(lockBob[0]);

    await new Promise((res) => setTimeout(res, millisToWait));

    const resAlice = await lockContractAlice.release({
      from: alice,
    });
    const balanceAlice = await token.balanceOf(alice);
    assert.equal(balanceAlice, '100', 'Token was not correctly transferred');

    await lockContractBob.release({
      from: bob,
    });
    const balanceBob = await token.balanceOf(bob);
    assert.equal(balanceBob, '100', 'Token was not correctly transferred');
  });
});
