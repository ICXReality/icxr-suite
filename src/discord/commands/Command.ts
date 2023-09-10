import {
  CacheType,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;

export interface BaseCommandData {
  execOnly?: boolean;
}

export interface SlashCommand extends BaseCommandData {
  type: "slash";
  data: SlashCommandData;
  onInvoke: (interaction: ChatInputCommandInteraction<CacheType>) => void;
}

export type ContextMenuCommandData = ContextMenuCommandBuilder;

export interface ContextMenuCommand extends BaseCommandData {
  type: "context";
  data: ContextMenuCommandData;
  onInvoke: (interaction: ContextMenuCommandInteraction<CacheType>) => void;
}

export type Command = SlashCommand | ContextMenuCommand;
