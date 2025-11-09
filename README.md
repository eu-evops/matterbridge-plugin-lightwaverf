# <img src="matterbridge.svg" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp;Matterbridge LightWaveRF Plugin

[![npm version](https://img.shields.io/npm/v/matterbridge-plugin-lightwaverf.svg)](https://www.npmjs.com/package/matterbridge-plugin-lightwaverf)
[![npm downloads](https://img.shields.io/npm/dt/matterbridge-plugin-lightwaverf.svg)](https://www.npmjs.com/package/matterbridge-plugin-lightwaverf)

[![powered by](https://img.shields.io/badge/powered%20by-matterbridge-blue)](https://www.npmjs.com/package/matterbridge)
[![powered by](https://img.shields.io/badge/powered%20by-@evops/lightwaverf-blue)](https://www.npmjs.com/package/@evops/lightwaverf)
[![powered by](https://img.shields.io/badge/powered%20by-node--ansi--logger-blue)](https://www.npmjs.com/package/node-ansi-logger)
[![powered by](https://img.shields.io/badge/powered%20by-node--persist--manager-blue)](https://www.npmjs.com/package/node-persist-manager)

Connect your LightWaveRF smart home devices to the Matter ecosystem, enabling control via Apple HomeKit, Google Home, Amazon Alexa, Home Assistant, SmartThings, and other Matter-compatible platforms.

If you like this project and find it useful, please consider giving it a star on GitHub at [matterbridge-plugin-lightwaverf](https://github.com/sponte/matterbridge-plugin-lightwaverf).

<a href="https://www.buymeacoffee.com/evops">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="120">
</a>

## What This Plugin Does

This Matterbridge plugin bridges LightWaveRF devices to the Matter protocol, allowing you to:

- Control LightWaveRF lights, dimmers, and switches through Matter-compatible apps
- Use HomeKit/Siri, Google Home, and Alexa voice control
- Integrate with Home Assistant, SmartThings, and other Matter ecosystems
- Manage all your LightWaveRF devices from a single interface
- Maintain local network control while leveraging cloud device discovery

## How It Works

```
LightWaveRF Cloud Account (Email + PIN)
    ↓
LightWaveRF Link/Link Plus Device (Local Network)
    ↓
Your LightWaveRF Devices (Lights, Dimmers, Switches)
    ↓
Matterbridge Plugin (This Plugin)
    ↓
Matter Protocol
    ↓
HomeKit, Google Home, Alexa, etc.
```

The plugin connects to your LightWaveRF Link device on your local network, discovers all paired devices from your LightWaveRF cloud account, and exposes them as Matter devices that can be controlled by any Matter-compatible platform.

## Requirements

Before installing this plugin, ensure you have:

- **LightWaveRF Link or Link Plus** device on your network
- **LightWaveRF account** with devices already paired in the LightWaveRF app
- **Matterbridge** v3.3.0 or later installed and running
- **Node.js** version 20, 22, or 24
- Your LightWaveRF account **email** and **PIN**

## Installation

### 1. Install via Matterbridge UI

1. Open the Matterbridge web interface
2. Go to the **Plugins** section
3. Search for `matterbridge-plugin-lightwaverf`
4. Click **Install**

### 2. Install via Command Line

```bash
npm install -g matterbridge-plugin-lightwaverf
```

## Configuration

After installation, configure the plugin with your LightWaveRF credentials:

### Required Settings

- **Email**: Your LightWaveRF cloud account email address
- **PIN**: Your LightWaveRF account PIN (the security code you use in the LightWaveRF app)

### Optional Settings

- **Debug**: Enable detailed logging for troubleshooting (default: `false`)
- **Unregister on Shutdown**: Remove all devices when Matterbridge stops - useful for development only (default: `false`)

### Configuration Example

In the Matterbridge UI or configuration file:

```json
{
  "email": "your-email@example.com",
  "pin": "1234",
  "debug": false,
  "unregisterOnShutdown": false
}
```

## First Time Setup & Device Registration

The first time you run the plugin, you'll need to register it with your LightWaveRF Link device:

1. **Configure the plugin** with your email and PIN (see Configuration above)
2. **Restart Matterbridge** to load the plugin
3. A virtual **"Register Button"** device will appear in your Matter controller (HomeKit, Google Home, etc.)
4. **Simultaneously**:
   - Click/activate the virtual "Register Button" in your Matter app
   - Press the **physical pairing button** on your LightWaveRF Link device
5. Wait a few seconds for registration to complete
6. **Restart Matterbridge** again
7. All your LightWaveRF devices will automatically appear in your Matter controller

### Troubleshooting Registration

If registration fails:

- Ensure your Link device is powered on and connected to the network
- Check that your email and PIN are correct in the configuration
- Make sure you press both buttons (virtual and physical) at the same time
- Try restarting Matterbridge and repeating the process
- Enable debug logging to see detailed connection information

## Supported Devices & Features

### Device Types

- **Dimmers** (LightWaveRF Type "D")

  - Full on/off control
  - Brightness adjustment (0-100%)
  - Appears as "Dimmable Light" in Matter apps

- **On/Off Devices** (Switches, non-dimmable lights)
  - On/off control
  - Appears as "Light" or "Switch" in Matter apps

### Supported Operations

- Turn on/off individual devices
- Adjust brightness for dimmers
- Control devices via voice (Siri, Google Assistant, Alexa)
- Create scenes and automations in your Matter controller
- View device status in real-time

### Device Information

Each device displays:

- Device name (as configured in LightWaveRF app)
- Room name
- Unique identifier
- Power state
- Brightness level (for dimmers)

## Network Requirements

The plugin communicates with your LightWaveRF Link device using UDP on ports **9760** and **9761**. Ensure:

- Matterbridge and the Link device are on the **same local network**
- No firewall blocks UDP ports 9760/9761
- The Link device has a stable network connection

The plugin can auto-discover the Link device, or you can specify its IP address if needed.

## Compatibility

This plugin works with:

- **Matter Controllers**: Apple Home, Google Home, Amazon Alexa, SmartThings, Home Assistant
- **Operating Systems**: Linux, macOS, Windows, WSL2
- **Node.js Versions**: 20.x, 22.x, 24.x
- **Matterbridge Versions**: 3.3.0 and later

## Troubleshooting

### Devices Not Appearing

- Verify devices are paired in the LightWaveRF app first
- Check email and PIN are correct in plugin configuration
- Ensure Link device is powered on and on the same network
- Try restarting Matterbridge
- Enable debug logging to see detailed discovery information

### Commands Not Working

- Check network connectivity to Link device
- Verify UDP ports 9760/9761 are not blocked
- Ensure Link device firmware is up to date
- Try unpairing and re-pairing the device in LightWaveRF app

### Registration Failed

- Press both buttons (virtual and physical) simultaneously
- Ensure Link device is in pairing mode (press physical button)
- Check Link device is accessible on the network
- Try the registration process again after restarting Matterbridge

### Enable Debug Logging

Set `"debug": true` in the plugin configuration and restart Matterbridge to see detailed logs that can help diagnose issues.

## Support & Contributing

- **Issues**: Report bugs at [GitHub Issues](https://github.com/sponte/matterbridge-plugin-lightwaverf/issues)
- **Source Code**: [GitHub Repository](https://github.com/sponte/matterbridge-plugin-lightwaverf)
- **Support**: [Buy me a coffee](https://www.buymeacoffee.com/evops)

## Credits

- Built with [Matterbridge](https://github.com/Luligu/matterbridge)
- Uses [@evops/lightwaverf](https://www.npmjs.com/package/@evops/lightwaverf) client library
- Developed by [@sponte](https://github.com/sponte)

## License

Apache-2.0

---

**Note**: This plugin requires physical LightWaveRF hardware (Link/Link Plus device) and a LightWaveRF account with paired devices. The plugin does not work with LightWaveRF RF-only devices that require the separate RF bridge.
