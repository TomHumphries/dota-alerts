# DotA 2 Audio Reminders
Plays audio cues in a browser window to remind you about recurring events during your DotA 2 matches using Game State Integration.  
A Discord bot can also be configured to play the events in a channel.  

## Setup

### 1. Enable DotA 2 Game State Integration in Steam
This tells DotA 2 to send updates about it's state.  
Game State Integration is not enabled by default because [game state integration can have a small per-frame performance impact](https://www.dota2.com/newsentry/4491783379124370818).
1. Open Steam
2. Find DotA 2 in your Steam Library (in the list on the left)
3. Right click on DotA 2 and select _Properties_.
4. Under the _General_ settings page, under the _Launch Options_ section, add `-gamestateintegration` to the text box.  

### 2. Create a Game State Integration config file
This tells dota where to send the game events.  
1. Navigate to the directory where Game State Integration files are stored. If Steam is configured to be installed on your C drive, this is ususally:  
`C:\\Program Files (x86)\Steam\steampapps\common\dota 2 beta\game\dota\cfg\gamestate_integration`
2. Create a new config file in this directory that ends with `.cfg`.  
The name is not important but I recommend calling it something like `home-assistant-lighting.cfg`
3. Open the file in a text editor (e.g. notepad) and enter the following config (or copy the `gsi-alerts.cfg` file included in this project):
    ```
    "Dota 2 Game State Integration Configuration"
    {
        "uri"          "http://localhost:8080/dota-gsi"
        "timeout"      "5.0"
        "buffer"       "0.1"
        "throttle"     "0.1"
        "heartbeat"    "30.0"
        "data"
        {
            "provider"        "1"
            "map"             "1"
            "player"          "1"
            "hero"            "1"
            "abilities"       "1"
            "items"           "1"
            "events"          "1"
            "buildings"       "1"
            "league"          "1"
            "draft"           "1"
            "wearables"       "1"
            "minimap"         "1"
            "roshan"          "1"
            "couriers"        "1"
            "neutralitems"    "1"
        }
    }
    ```
    This tells dota which game events to send and where to send them. If you are hosting on a different port to `8080`, make sure you update the `uri`.

### 3. Install the dependencies
Navigate to the project directory.  
Run:
```
npm install
```

### 4. Run the application
Navigate to the project directory.  
Execute `npm start` in the console.  
Go to http://localhost:8080 in your browser.  
A webpage should load.  Once you've interacted with the webpage in some way (e.g. clicking on it), your browser will let it play sounds.  

### 5. Optional - configure the Discord bot
- Create a [Discord bot](https://discord.com/developers/applications/)
- Add the bot to your server  
- Copy and rename `config.example.json` to `config.json` and fill in the fields

## Configuration
The app comes pre-configured to send audio alerts based on certain events.  
These can be found in the `./alerts.json` file.  
You can customise when and what to play by editing `alerts.json`.  

The `interval` is the frequency which the event occurs.  
e.g. `"interval": 180` is every 300 seconds, or 5 minutes.  

`secondsToPlayBefore` is how long before the event you want to play the audio cue.  
e.g. `"secondsToPlayBefore": 25` will play the sound 25 seconds before the recurring event occurs.  

`audioFile` is the filename to play in the `./sounds/` directory.  

## Example `alerts.json`
An example config that plays alerts:
- 60 seconds before the XP runes spawn (every 7 minutes)
- 15 seconds before the day/night cycle changes (every 5 minutes)  

The `name` property is just to help you to remember what the alert is for.  

```json
[
    {
        "name": "XP rune spawn",
        "interval": 420,
        "audioFile": "XP.mp3",
        "secondsToPlayBefore": 60
    },
    {
        "name": "Day night cycle",
        "interval": 300,
        "audioFile": "day-night.mp3",
        "secondsToPlayBefore": 15
    }
]
```
