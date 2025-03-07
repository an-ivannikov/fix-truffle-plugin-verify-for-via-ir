"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logObject = exports.getLibraries = exports.getInputJSON = exports.extractCompilerVersion = exports.getArtifact = exports.getApiKey = exports.getPlatform = exports.getAddressFromStorage = exports.deepCopy = exports.getRpcSendFunction = exports.getImplementationAddress = exports.getNetwork = exports.getAbsolutePath = exports.normaliseContractPath = exports.enforceOrThrow = exports.enforce = exports.abort = void 0;
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const constants_1 = require("./constants");
const abort = (message, logger = console, code = 1) => {
    logger.error(message);
    process.exit(code);
};
exports.abort = abort;
const enforce = (condition, message, logger, code) => {
    if (!condition)
        (0, exports.abort)(message, logger, code);
};
exports.enforce = enforce;
const enforceOrThrow = (condition, message) => {
    if (!condition)
        throw new Error(message);
};
exports.enforceOrThrow = enforceOrThrow;
/**
 * The metadata in the Truffle artifact file changes source paths on Windows. Instead of
 * D:\Hello\World.sol, it looks like /D/Hello/World.sol. When trying to read this path,
 * Windows cannot find it, since it is not a valid path. This function changes
 * /D/Hello/World.sol to D:\Hello\World.sol. This way, Windows is able to read these source
 * files. It does not change regular Unix paths, only Unixified Windows paths. It also does
 * not make any changes on platforms that aren't Windows.
 */
const normaliseContractPath = (contractPath, options) => {
    // Replace the 'project:' prefix that was added in Truffle v5.3.14 with the actual project path
    const absolutePath = (0, exports.getAbsolutePath)(contractPath, options);
    // If the current platform is not Windows, the path does not need to be changed
    if (process.platform !== 'win32')
        return absolutePath;
    // If the contract path doesn't start with '/[A-Z]/' it is not a Unixified Windows path
    if (!absolutePath.match(/^\/[A-Z]\//i))
        return absolutePath;
    const driveLetter = absolutePath.substring(1, 2);
    const normalisedContractPath = path_1.default.resolve(`${driveLetter}:/${absolutePath.substring(3)}`);
    return normalisedContractPath;
};
exports.normaliseContractPath = normaliseContractPath;
const getAbsolutePath = (contractPath, options) => {
    // Older versions of truffle already used the absolute path
    // Also node_modules contracts don't use the project: prefix
    if (!contractPath.startsWith('project:/'))
        return contractPath;
    const relativeContractPath = contractPath.replace('project:/', '');
    const absolutePath = path_1.default.join(options.projectDir, relativeContractPath);
    return absolutePath;
};
exports.getAbsolutePath = getAbsolutePath;
/**
 * If the network config includes a provider we use it to retrieve the network info
 * for the network. If that fails, we fall back to the config's network ID.
 */
const getNetwork = (config, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const send = (0, exports.getRpcSendFunction)(config.provider);
    const fallback = { chainId: config.network_id, networkId: config.network_id };
    if (!send) {
        logger.debug('No (valid) provider configured, using config network ID as fallback');
        return fallback;
    }
    try {
        logger.debug("Retrieving network's network ID & chain ID");
        const chainIdResult = yield send({ jsonrpc: '2.0', id: Date.now(), method: 'eth_chainId', params: [] });
        const networkIdResult = yield send({ jsonrpc: '2.0', id: Date.now(), method: 'net_version', params: [] });
        const chainId = chainIdResult && Number.parseInt(chainIdResult.result, 16);
        const networkId = networkIdResult && Number.parseInt(networkIdResult.result, 10);
        // Throw an error that gets caught by the try-catch
        if (!networkId || !chainId) {
            throw new Error('Could not retrieve network chain ID or network ID');
        }
        return { chainId, networkId };
    }
    catch (_a) {
        logger.debug('Failed to retrieve network information, using configurated network ID instead');
        return fallback;
    }
});
exports.getNetwork = getNetwork;
/**
 * Check whether the address is an EIP1967 proxy and if so, return its implementation address. Note that only the LOGIC
 * variety of EIP1967 is supported, not the BEACON variety. If support for BEACON proxies is added to the openzeppelin
 * plugin, I will add it here as well
 */
const getImplementationAddress = (address, logger, provider) => __awaiter(void 0, void 0, void 0, function* () {
    const send = (0, exports.getRpcSendFunction)(provider);
    if (!send) {
        logger.debug('No (valid) provider configured, assuming no proxy');
        return undefined;
    }
    try {
        const { result } = yield send({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'eth_getStorageAt',
            params: [address, constants_1.StorageSlot.LOGIC, 'latest'],
        });
        const implementationAddress = (0, exports.getAddressFromStorage)(result);
        if (typeof result === 'string' && implementationAddress !== constants_1.NULL_ADDRESS) {
            return implementationAddress;
        }
    }
    catch (_b) {
        // ignored
    }
    return undefined;
});
exports.getImplementationAddress = getImplementationAddress;
const getRpcSendFunction = (provider) => (provider === null || provider === void 0 ? void 0 : provider.sendAsync)
    ? (0, util_1.promisify)(provider.sendAsync.bind(provider))
    : (provider === null || provider === void 0 ? void 0 : provider.send)
        ? (0, util_1.promisify)(provider.send.bind(provider))
        : undefined;
exports.getRpcSendFunction = getRpcSendFunction;
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
exports.deepCopy = deepCopy;
const getAddressFromStorage = (storage) => `0x${storage.slice(2).slice(-40).padStart(40, '0')}`;
exports.getAddressFromStorage = getAddressFromStorage;
const getPlatform = (apiUrl) => {
    var _a;
    const splitHostname = new URL(apiUrl).hostname.split('.');
    const platform = splitHostname[splitHostname.length - 2];
    let subPlatform = (_a = splitHostname[splitHostname.length - 3]) === null || _a === void 0 ? void 0 : _a.split('-').pop();
    // For some reason Etherscan uses both optimistic.etherscan.io and optimism.etherscan.io
    if (subPlatform === 'optimism')
        subPlatform = 'optimistic';
    return { platform, subPlatform };
};
exports.getPlatform = getPlatform;
const getApiKey = (config, apiUrl) => {
    var _a, _b;
    const networkConfig = config.networks[config.network];
    if ((_a = networkConfig === null || networkConfig === void 0 ? void 0 : networkConfig.verify) === null || _a === void 0 ? void 0 : _a.apiKey) {
        return networkConfig.verify.apiKey;
    }
    if (!config.api_keys || !apiUrl)
        return undefined;
    const { platform, subPlatform } = (0, exports.getPlatform)(apiUrl);
    const apiKey = (_b = config.api_keys[`${subPlatform}_${platform}`]) !== null && _b !== void 0 ? _b : config.api_keys[platform];
    return apiKey;
};
exports.getApiKey = getApiKey;
const getArtifact = (contractName, options, logger) => {
    logger.debug(`Resolving artifact for contract ${contractName}`);
    const abstraction = options.resolver.require(contractName);
    // Stringify + parse to make a deep copy (to avoid bugs with PR #19)
    return JSON.parse(JSON.stringify(abstraction._json));
};
exports.getArtifact = getArtifact;
const extractCompilerVersion = (artifact) => {
    const metadata = JSON.parse(artifact.metadata);
    const compilerVersion = `v${metadata.compiler.version}`;
    return compilerVersion;
};
exports.extractCompilerVersion = extractCompilerVersion;
const getInputJSON = (artifact, options, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const metadata = JSON.parse(artifact.metadata);
    const libraries = (0, exports.getLibraries)(artifact, options, logger);
    // Sort the source files so that the "main" contract is on top
    const orderedSources = Object.keys(metadata.sources)
        .reverse()
        .sort((a, b) => {
            if (a === artifact.ast.absolutePath)
                return -1;
            if (b === artifact.ast.absolutePath)
                return 1;
            return 0;
        });
    const sources = {};
    for (const contractPath of orderedSources) {
        // If we're on Windows we need to de-Unixify the path so that Windows can read the file
        // We also need to replace the 'project:' prefix so that the file can be read
        const normalisedContractPath = (0, exports.normaliseContractPath)(contractPath, options);
        let absolutePath;
        try {
            absolutePath = require.resolve(normalisedContractPath, { paths: [options.projectDir] });
        }
        catch (_c) {
            // handle case where the contractPath refers to some ephemeral source
            // (e.g., truffle/console.sol)
            absolutePath = contractPath;
        }
        const { body: content } = yield options.resolver.resolve(absolutePath);
        if (!content) {
            throw new Error(`Content missing for contract at ${contractPath}`);
        }
        // Remove the 'project:' prefix that was added in Truffle v5.3.14
        const relativeContractPath = contractPath.replace('project:', '');
        sources[relativeContractPath] = { content };
    }
    const inputJSON = {
        language: metadata.language,
        sources,
        settings: {
            remappings: metadata.settings.remappings,
            optimizer: metadata.settings.optimizer,
            evmVersion: metadata.settings.evmVersion,
            viaIR: true,
            libraries,
        },
    };
    return inputJSON;
});
exports.getInputJSON = getInputJSON;
const getLibraries = (artifact, options, logger) => {
    const libraries = {
        // Example data structure of libraries object in Standard Input JSON
        // 'ConvertLib.sol': {
        //   'ConvertLib': '0x...',
        //   'OtherLibInSameSourceFile': '0x...'
        // }
    };
    const links = artifact.networks[`${options.networkId}`].links || {};
    for (const libraryName in links) {
        // Retrieve the source path for this library
        const libraryArtifact = (0, exports.getArtifact)(libraryName, options, logger);
        // Remove the 'project:' prefix that was added in Truffle v5.3.14
        const librarySourceFile = libraryArtifact.ast.absolutePath.replace('project:', '');
        // Add the library to the object of libraries for this source path
        const librariesForSourceFile = libraries[librarySourceFile] || {};
        librariesForSourceFile[libraryName] = links[libraryName];
        libraries[librarySourceFile] = librariesForSourceFile;
    }
    return libraries;
};
exports.getLibraries = getLibraries;
const logObject = (logger, level, obj, indent) => {
    const prefix = constants_1.INDENT.repeat(Math.min(indent - 1));
    const stringified = `${prefix}${JSON.stringify(obj, null, 2).replace(/\n/g, `\n${constants_1.INDENT.repeat(indent)}`)}`;
    logger[level](stringified);
};
exports.logObject = logObject;
