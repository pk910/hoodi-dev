# Hoodi Testnet Developer Portal

This repository contains the source code for [hoodi.dev](https://hoodi.dev), the developer portal for the Hoodi Ethereum testnet.

## About Hoodi

Hoodi is the second long-standing, merged-from-genesis, public Ethereum testnet. It serves as the staking, infrastructure, and protocol-developer testnet, replacing Holesky.

- **Chain ID:** 560048
- **Launch Date:** March 17, 2025
- **LTS:** December 2027
- **EOL:** December 2028

## Local Development

This is a static website with no build step required. To run locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Or simply open index.html in your browser
```

Then open `http://localhost:8000` in your browser.

## Contributing

Contributions are welcome! If you'd like to add resources, fix bugs, or improve the site:

1. Fork this repository
2. Create a feature branch (`git checkout -b add-new-resource`)
3. Make your changes
4. Submit a pull request

### Adding Resources

Resources are organized in `index.html` under the Resources section. Common additions include:

- **RPC Endpoints** - Public JSON-RPC providers
- **Checkpoint Sync Providers** - Beacon chain checkpoint sync URLs
- **Block Explorers** - EL and CL explorers
- **Faucets** - Testnet ETH faucets

### Project Structure

```
hoodi-dev/
├── index.html      # Main page
├── css/
│   └── style.css   # Styles
├── js/
│   ├── config.js   # Network configuration
│   └── main.js     # Application logic
└── img/            # Images and logos
```

## Related Links

- [Hoodi Homepage](https://hoodi.ethpandaops.io) - Official Hoodi information
- [Hoodi GitHub](https://github.com/eth-clients/hoodi) - Network configuration and specs

## License

This project is open source and available under the [MIT License](LICENSE).
