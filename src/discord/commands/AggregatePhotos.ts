import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  Message,
  User,
} from "discord.js";
import { ContextMenuCommand } from "./Command";

class AggregatePhotoManager {
  public static default: AggregatePhotoManager = new AggregatePhotoManager();

  public hasMessage(user: User, message: Message<boolean>): boolean {
    return false;
  }

  private addMessage(user: User, message: Message<boolean>) {}

  private removeMessage(user: User, message: Message<boolean>) {}

  public addOrRemoveMessage(user: User, message: Message<boolean>): boolean {
    let hasMessage = this.hasMessage(user, message);
    if (hasMessage) {
      this.addMessage(user, message);
    } else {
      this.removeMessage(user, message);
    }
    
    return hasMessage;
  }

  public publish(user: User) {}

  public getMessageCount(user: User): number {
    return 0;
  }
}

/**
 * This menu context command allows users to aggregate photo links across
 * multiple messages into a single post in a specified forum channel.
 */
export const AggregatePhotosContextMenuCommand: ContextMenuCommand = {
  type: "context",
  data: new ContextMenuCommandBuilder()
    .setName("Aggregate Photos")
    .setType(ApplicationCommandType.Message),
  onInvoke: async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    let manager = AggregatePhotoManager.default;

    let didAddMessage = manager.addOrRemoveMessage(
      interaction.user,
      interaction.targetMessage
    );

    let numberPhotos = manager.getMessageCount(interaction.user);

    interaction.reply({
      ephemeral: true,
      content: `${didAddMessage ? "Added" : "Removed"} this message to your photo messages. You now have ${numberPhotos} messages to publish.`
    })
  },
};
