import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection, getVoiceConnection } from '@discordjs/voice';
import { EventEmitter } from 'events';

export class DiscordSoundBot extends EventEmitter {
    private client: Client;
    private player = createAudioPlayer();
    private connection: VoiceConnection | null = null;
  
    constructor(
      token: string,
      private readonly guildId: string, 
      private readonly channelId: string
    ) {
      super();
      this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
      this.client.once('ready', this.onReady.bind(this));
      this.client.login(token);
    }
  
    private onReady() {
      console.log('Bot is ready!');
  
      const guild = this.client.guilds.cache.get(this.guildId);
      if (!guild) {
        console.error('Guild not found');
        return;
      }
  
      const channel = guild.channels.cache.get(this.channelId);
      if (!channel || channel.type !== 2) { // 2 is the type for voice channels
        console.error('Voice channel not found');
        return;
      }
  
      this.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      this.connection.subscribe(this.player);
  
      this.player.on(AudioPlayerStatus.Idle, () => {
        // console.log('Audio player is idle');
      });

      this.emit('ready');
    }
  
    public async disconnect() {
      getVoiceConnection(this.guildId)?.disconnect();
      this.client.destroy();
    }

    public playSound(soundFilepath: string) {
      if (!this.connection) {
        console.error('No voice connection available');
        return;
      }
  
      console.log('Playing sound:', soundFilepath);
      const resource = createAudioResource(soundFilepath);
      this.player.play(resource);
    }
  }