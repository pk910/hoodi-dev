const HOODI_CONFIG = {
    // API configuration
    api: {
        baseUrl: 'https://light-hoodi.beaconcha.in/api/v1',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaG9vZGkuZGV2IiwicmF0ZV9saW1pdCI6MTAsImNvcnNfb3JpZ2lucyI6WyJodHRwczovL2hvb2RpLmRldiIsImh0dHBzOi8vd3d3Lmhvb2RpLmRldiJdLCJzdWIiOiJhcGktYWNjZXNzIiwiZXhwIjoxODI5MDAwNjU2LCJpYXQiOjE3NjY3OTI2NTZ9.4aqSjgmvjii1CgXYSv5tTZ2zD6NeqXTiKYtyztqbJmw',
        endpoints: {
            overview: '/network/overview',
            splits: '/network/splits'
        }
    },

    network: {
        name: 'Hoodi Testnet',
        chainId: 560048,
        networkId: 560048,
        launchDate: '2025-03-17',
        launchTimestamp: 1742213400,
        consensus: 'Proof of Stake',
        lts: 'December 2027',
        eol: 'December 2028'
    },

    // Forks ordered by activation time
    // Each fork has: name, timestamp (null = at genesis), elVersion, clVersion
    forks: [
        {
            name: 'Merge / Shapella / Dencun',
            timestamp: null, // At genesis
            epoch: 0,
            elVersion: 'Cancun',
            clVersion: 'Deneb',
            isGenesis: true
        },
        {
            name: 'Pectra (Prague/Electra)',
            timestamp: 1742999832,
            epoch: 2048,
            elVersion: 'Prague',
            clVersion: 'Electra'
        },
        {
            name: 'Fusaka (Osaka/Fulu)',
            timestamp: 1761677592,
            epoch: 50688,
            elVersion: 'Osaka',
            clVersion: 'Fulu'
        },
        {
            name: 'BPO 1',
            timestamp: 1762365720,
            epoch: 52480,
            elVersion: 'Osaka',
            clVersion: 'Fulu'
        },
        {
            name: 'BPO 2',
            timestamp: 1762955544,
            epoch: 54016,
            elVersion: 'Osaka',
            clVersion: 'Fulu'
        }
    ],

    // MetaMask configuration
    metamask: {
        chainId: '0x88B30', // 560048 in hex
        chainName: 'Hoodi Testnet',
        nativeCurrency: {
            name: 'Hoodi Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://rpc.hoodi.ethpandaops.io'],
        blockExplorerUrls: ['https://hoodi.etherscan.io']
    }
};
