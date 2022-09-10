const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
let BASE_FEE = ethers.utils.parseEther("0.25")
let GAS_PRICE_LINK = 1e9
module.exports = async function ({ getNamedAccounts, deployments }) {
    let { deploy, log } = deployments
    let { deployer } = await getNamedAccounts()
    let chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        log("Local network detected! deploying mock")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Contract deployed")
    }
}
module.exports.tags = ["all", "mocks"]
