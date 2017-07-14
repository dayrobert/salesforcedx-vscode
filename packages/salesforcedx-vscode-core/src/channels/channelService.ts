import * as vscode from 'vscode';
import { localize } from '../messages';

import { CommandExecution } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';

export const DEFAULT_SFDX_CHANNEL = vscode.window.createOutputChannel(
  localize('channel_name')
);

export class ChannelService {
  private readonly channel: vscode.OutputChannel;
  private static instance: ChannelService;

  public constructor(channel?: vscode.OutputChannel) {
    this.channel = channel || DEFAULT_SFDX_CHANNEL;
  }

  public static getInstance(channel?: vscode.OutputChannel) {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService(channel);
    }
    return ChannelService.instance;
  }

  public streamCommandOutput(execution: CommandExecution) {
    this.channel.append(localize('channel_starting_message'));
    this.channel.appendLine(execution.command.toString());
    this.channel.appendLine('');

    execution.stderrSubject.subscribe(data =>
      this.channel.append(data.toString())
    );
    execution.stdoutSubject.subscribe(data =>
      this.channel.append(data.toString())
    );

    execution.processExitSubject.subscribe(data => {
      this.channel.append(execution.command.toString());
      this.channel.append(' ');
      if (data != undefined) {
        this.channel.appendLine(
          localize('channel_end_with_exit_code', data.toString())
        );
      } else {
        this.channel.appendLine(localize('channel_end'));
      }
    });

    execution.processErrorSubject.subscribe(data => {
      this.channel.append(execution.command.toString());
      this.channel.append(' ');
      if (data != undefined) {
        this.channel.appendLine(
          localize('channel_end_with_error', data.toString())
        );

        if (/sfdx.*ENOENT/.test(data.message)) {
          this.channel.appendLine(localize('channel_end_with_sfdx_not_found'));
        }
      } else {
        this.channel.appendLine(localize('channel_end'));
      }
    });
  }
}