const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
let { verify } = require("../utils/verify")
const VRF_FUND_AMOUNT = ethers.utils.parseEther("30")
module.exports = async function ({ getNamedAccounts, deployments }) {
    let { deploy, log } = deployments
    let { deployer } = await getNamedAccounts()
    let vrfCoordinatorV2Address, subscriptionId
    if (developmentChains.includes(network.name)) {
        let vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        let txResponse = await vrfCoordinatorV2Mock.createSubscription()
        let txReceipt = await txResponse.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinator"]
        subscriptionId = networkConfig[network.config.chainId]["subscriptionId"]
    }
    const entranceFee = networkConfig[network.config.chainId]["entranceFee"]
    let gasLane = networkConfig[network.config.chainId]["gasLane"]
    let callbackGasLimit = networkConfig[network.config.chainId]["callbackGasLimit"]
    let interval = networkConfig[network.config.chainId]["interval"]
    let args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    let raffle = await deploy("Raffle", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmation || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API) {
        log("Verifying...")
        await verify(raffle.address, args)
    }
}
module.exports.tags = ["all", "raffle"]
