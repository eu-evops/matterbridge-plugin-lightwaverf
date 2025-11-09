/**
 * This file contains the plugin template.
 *
 * @file module.ts
 * @author Luca Liguori
 * @created 2025-06-15
 * @version 1.3.0
 * @license Apache-2.0
 *
 * Copyright 2025, 2026, 2027 Luca Liguori.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import LightwaveClient from '@evops/lightwaverf';
import { CommandHandlerData, dimmableLight, MatterbridgeDynamicPlatform, MatterbridgeEndpoint, onOffLight, onOffOutlet, PlatformConfig, PlatformMatterbridge } from 'matterbridge';
import { AnsiLogger, LogLevel } from 'matterbridge/logger';
import { LevelControl } from 'matterbridge/matter/clusters';

/**
 * This is the standard interface for Matterbridge plugins.
 * Each plugin should export a default function that follows this signature.
 *
 * @param {PlatformMatterbridge} matterbridge - An instance of MatterBridge.
 * @param {AnsiLogger} log - An instance of AnsiLogger. This is used for logging messages in a format that can be displayed with ANSI color codes and in the frontend.
 * @param {PlatformConfig} config - The platform configuration.
 * @returns {LightwaveRfPlatform} - An instance of the MatterbridgeAccessory or MatterbridgeDynamicPlatform class. This is the main interface for interacting with the Matterbridge system.
 */
export default function initializePlugin(matterbridge: PlatformMatterbridge, log: AnsiLogger, config: PlatformConfig): LightwaveRfPlatform {
  return new LightwaveRfPlatform(matterbridge, log, config);
}

// Here we define the TemplatePlatform class, which extends the MatterbridgeDynamicPlatform.
// If you want to create an Accessory platform plugin, you should extend the MatterbridgeAccessoryPlatform class instead.
export class LightwaveRfPlatform extends MatterbridgeDynamicPlatform {
  private client: LightwaveClient.default;

  constructor(matterbridge: PlatformMatterbridge, log: AnsiLogger, config: PlatformConfig) {
    // Always call super(matterbridge, log, config)
    super(matterbridge, log, config);

    // Verify that Matterbridge is the correct version
    if (this.verifyMatterbridgeVersion === undefined || typeof this.verifyMatterbridgeVersion !== 'function' || !this.verifyMatterbridgeVersion('3.3.0')) {
      throw new Error(
        `This plugin requires Matterbridge version >= "3.3.0". Please update Matterbridge from ${this.matterbridge.matterbridgeVersion} to the latest version in the frontend."`,
      );
    }

    this.log.info(`Initializing Platform...`);
    this.client = new LightwaveClient.default({
      email: this.config.email,
      pin: this.config.pin,
    });
  }

  override async onStart(reason?: string) {
    this.log.info(`onStart called with reason: ${reason ?? 'none'}`);

    // Wait for the platform to fully load the select
    await this.ready;

    // Clean the selectDevice and selectEntity maps, if you want to reset the select.
    await this.clearSelect();

    // Implements your own logic there
    await this.establishConnection();
  }

  override async onConfigure() {
    // Always call super.onConfigure()
    await super.onConfigure();

    this.log.info('onConfigure called, what do we do here?');

    // Configure all your devices. The persisted attributes need to be updated.
    for (const device of this.getDevices()) {
      this.log.info(`Configuring device: ${device.uniqueId}`);
      // You can update the device configuration here, for example:
      // device.updateConfiguration({ key: 'value' });
    }
  }

  override async onChangeLoggerLevel(logLevel: LogLevel) {
    this.log.info(`onChangeLoggerLevel called with: ${logLevel}`);
    // Change here the logger level of the api you use or of your devices
  }

  override async onShutdown(reason?: string) {
    // Always call super.onShutdown(reason)
    await super.onShutdown(reason);

    this.log.info(`onShutdown called with reason: ${reason ?? 'none'}`);
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }

  private async establishConnection() {
    this.log.info('Discovering devices...');
    // Implement device discovery logic here.
    // For example, you might fetch devices from an API.
    // and register them with the Matterbridge instance.

    await this.client.connect();
    this.log.info('Connected to LightwaveRF');

    const isRegistered = await this.client.isRegistered();

    if (isRegistered) {
      this.updateDevices();
      return;
    }

    const registerButton = new MatterbridgeEndpoint(onOffOutlet, { uniqueStorageKey: 'registerButton1' })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        'Register Button',
        'SN000002',
        this.matterbridge.aggregatorVendorId,
        'Matterbridge',
        'Matterbridge Register Button',
        10000,
        '1.0.0',
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async (data) => {
        this.log.info(`Command on called on cluster ${data.cluster}`);
        await this.client.ensureRegistration();

        // Fireoff device discovery
        this.updateDevices();

        this.log.info('Registered with LightwaveRF');
        registerButton.updateAttribute(data.cluster, 'onOff', false, this.log);
        setImmediate(() => {
          // Remove button after successful registration
          this.unregisterDevice(registerButton);
        });
      })
      .addCommandHandler('off', (data) => {
        this.log.info(`Command off called on cluster ${data.cluster}`);
      });

    await this.registerDevice(registerButton);
  }

  private async updateDevices() {
    const devices = await this.client.getDevices();
    for (const device of devices) {
      const uniqueDeviceId = `${device.roomId}-${device.deviceId}`;
      const deviceName = `${device.roomName} ${device.deviceName}`;

      const deviceOff = this.client.turnOff.bind(this.client, device);
      const deviceOn = this.client.turnOn.bind(this.client, device);
      const deviceDim = (data: CommandHandlerData) => {
        this.log.info('Move to level request');
        const request = data.request as LevelControl.MoveToLevelRequest;
        this.log.info('Move to level request: %o', request);
        const percentage = (request.level / 254) * 100;
        this.log.info(`Command moveToLevel called on cluster ${data.cluster} with level ${JSON.stringify(data)}`, {
          percentage,
        });

        this.client.dim(device, percentage);
      };

      if (device.deviceType === 'D') {
        const dimmer = new MatterbridgeEndpoint(dimmableLight, { uniqueStorageKey: uniqueDeviceId })
          .createDefaultBridgedDeviceBasicInformationClusterServer(
            deviceName,
            this.client.version ?? 'SN000001',
            this.matterbridge.aggregatorVendorId,
            'Lightwave',
            'Dimmer',
            10000,
            this.client.version ?? '1.0.0',
          )
          .createDefaultPowerSourceWiredClusterServer()
          .addRequiredClusterServers()
          .addCommandHandler('on', deviceOn)
          .addCommandHandler('off', deviceOff)
          .addCommandHandler('moveToLevel', deviceDim)
          .addCommandHandler('moveToLevelWithOnOff', deviceDim);

        await this.registerDevice(dimmer);
      } else {
        const onOff = new MatterbridgeEndpoint(onOffLight, { uniqueStorageKey: uniqueDeviceId })
          .createDefaultBridgedDeviceBasicInformationClusterServer(
            deviceName,
            this.client.version ?? 'SN000001',
            this.matterbridge.aggregatorVendorId,
            'Lightwave',
            'Light switch',
            10000,
            this.client.version ?? '1.0.0',
          )
          .createDefaultPowerSourceWiredClusterServer()
          .addRequiredClusterServers()
          .addCommandHandler('on', deviceOn)
          .addCommandHandler('off', deviceOff);

        await this.registerDevice(onOff);
      }
    }
  }
}
