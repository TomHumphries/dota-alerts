# DotA 2 Audio Reminders
Plays audio cues in a browser window to remind you about recurring events during your DotA 2 matches using Game State Integration.  

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
