'use client';

import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import BlockumVaultABI from '../web3/constants/BlockumVaultABI.json';
import FGOLDistributionABI from '../web3/constants/FGOLDistributionABI.json';
import BlockumDAOABI from '../web3/constants/BlockumDAOABI.json';
import LPTokenABI from '../web3/constants/LPTokenABI.json';
import FGOLTokenABI from '../web3/constants/FGOLTokenABI.json';
import axios from 'axios';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [_web3, setWeb3] = useState();
  const [walletAddress, setWalletAddress] = useState();
  const [LPTokenContract, setLPTokenContract] = useState();
  const [FGOLTokenContract, setFGOLTokenContract] = useState();
  const [BlockumVaultContract, setBlockumVaultContract] = useState();
  const [FGOLDistributionContract, setFGOLDistributionContract] = useState();
  const [BlockumDAOContract, setBlockumDAOContract] = useState();
  const [lpTokenEth, setLPTokenEth] = useState();
  const [fgolTokenEth, setFGOLTokenEth] = useState();
  // const [depositHistory, setDepositHistory] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isMember, setIsMember] = useState(false);

  async function connectMetaMask() {
    let tempProposalId = 0;
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const walletAccount = await _web3.eth.getAccounts();
      console.log(walletAccount[0]);
      await axios.post('/users/connect', { walletAddress: walletAccount[0] });

      const tempBlockumVaultContract = new _web3.eth.Contract(
        BlockumVaultABI,
        addressOfBlockumVault
      );
      const tempFGOLDistributionContract = new _web3.eth.Contract(
        FGOLDistributionABI,
        addressOfFGOLDistribution
      );
      const tempBlockumDAOContract = new _web3.eth.Contract(
        BlockumDAOABI,
        addressOfBlockumDAO
      );

      const tempLPTokenContract = new _web3.eth.Contract(
        LPTokenABI,
        addressOfLPToken
      );
      const tempFGOLTokenContract = new _web3.eth.Contract(
        FGOLTokenABI,
        addressOfFGOLToken
      );
      const isMember_ = await tempBlockumDAOContract.methods
        .isMember(walletAccount[0])
        .call();
      if (isMember_) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
      const tempLpTokenWei = await tempLPTokenContract.methods
        .balanceOf(walletAccount[0])
        .call();
      const tempFGOLTokenWei = await tempFGOLTokenContract.methods
        .balanceOf(walletAccount[0])
        .call();
      const lpTokenEth = _web3.utils.fromWei(tempLpTokenWei, 'ether');
      const fgolTokenEth = _web3.utils.fromWei(tempFGOLTokenWei, 'ether');

      // while (true) {
      //   try {
      //     const tempDepositHistory = await tempBlockumVaultContract.methods
      //       .memberDeposits(walletAccount[0], temp)
      //       .call();
      //     if (tempDepositHistory.amount == 0) {
      //       temp += 1;
      //       continue;
      //     }
      //     depositHistory.push(tempDepositHistory);
      //     temp += 1;
      //   } catch (err) {
      //     console.log(err);
      //     break;
      //   }
      // }

      // while (true) {
      //   try {
      //     const tempDistributionHistory =
      //       await tempFGOLDistributionContract.methods
      //         .memberDeposits(walletAccount[0], temp)
      //         .call();
      //     if (tempDistributionHistory.amount == 0) {
      //       break;
      //     }
      //     depositHistory.push(tempDistributionHistory);
      //     temp += 1;
      //   } catch (err) {
      //     console.log(err);
      //     break;
      //   }
      // }
      // console.log(tempDistributionHistory);

      while (true) {
        try {
          const tempProposals = await tempBlockumDAOContract.methods
            .proposalDetails(tempProposalId)
            .call();
          if (
            tempProposals.proposer ==
            '0x0000000000000000000000000000000000000000'
          ) {
            tempProposalId += 1;
            continue;
          }
          console.log(tempProposals);
          proposals.push(tempProposals);
          
          tempProposalId += 1;
        } catch (err) {
          console.log(err);
          break;
        }
      }
      setProposals(proposals.reverse());
      setLPTokenContract(tempLPTokenContract);
      setFGOLTokenContract(tempFGOLTokenContract);
      setBlockumVaultContract(tempBlockumVaultContract);
      setFGOLDistributionContract(tempFGOLDistributionContract);
      setBlockumDAOContract(tempBlockumDAOContract);
      setLPTokenEth(lpTokenEth);
      setFGOLTokenEth(fgolTokenEth);
      setWalletAddress(walletAccount[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const addressOfBlockumVault =
    '0x696dA2B5968f33F8C60e02F660e84B04709Da30b'.toLocaleLowerCase();
  const addressOfFGOLDistribution =
    '0xdAd37C0FB1A095bc9D237BB4A55F5FD6eab2B54e'.toLocaleLowerCase();
  const addressOfBlockumDAO =
    '0xF713C86d5e5560D5F69A1B1d1DA3E4d45e9c5F3a'.toLocaleLowerCase();
  const addressOfLPToken =
    '0x6007485F7329166d699824765554F4ca5baF5b58'.toLocaleLowerCase();
  const addressOfFGOLToken =
    '0x7Ab4CD9d41b7577198ac6aaD84E5f3F5C7EF1bd9'.toLocaleLowerCase();

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
  }, []);
  return (
    <Web3Context.Provider
      value={{
        _web3,
        connectMetaMask,
        setWalletAddress,
        walletAddress,
        lpTokenEth,
        fgolTokenEth,
        BlockumVaultContract,
        // depositHistory,
        proposals,
        isMember,
        FGOLDistributionContract,
        LPTokenContract,
        FGOLTokenContract,
        addressOfBlockumVault,
        addressOfFGOLDistribution,
        BlockumDAOContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;