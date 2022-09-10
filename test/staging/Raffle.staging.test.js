const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers, waffle } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
developmentChains.includes(network.name)
    ? decribe.skip
    : describe("Raffle", async function () {
          let raffle, entranceFee, deployer, interval
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              entranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })
          describe("fulfillRandomWords", function () {
              it("works with live chainlink keepers and chainlink VRF , we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  let accounts = await ethers.getSigners()
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Event fired")
                          try {
                              let recentWinner = await raffle.getRecentWinner()
                              let raffleState = await raffle.getRaffleState()
                              let winnerBalance = await accounts[0].getBalance()
                              let endingTimeStamp = await raffle.getLastTimeStamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner, accounts[0].address)
                              assert.equal(raffleState, 0)
                            
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (err) {
                              reject(err)
                          }
                      })
                      console.log("Entering Raffle...")
                      let tx = await raffle.enterRaffle({ value: entranceFee })
                      console.log(tx)
                      let winnerStartingBalance = await accounts[0].getBalance()
                  })
              })
          })
      })
