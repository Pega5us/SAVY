# SAVY: A web app to play local videos in sync

## Access application [here!](https://savy-player.herokuapp.com/)

## SAVY Player provides service to watch local video in a synchronised way.

---

### Convert .mkv to .mp4

```bash
sudo apt install ffmpeg

ffmpeg -i input.mkv -c copy output.mp4

```

### Convert .srt to .vtt [here](https://www.happyscribe.com/subtitle-tools/convert-srt-to-vtt)

### Change Default Audio Track of .mp4 
```bash
sudo apt install ffmpeg

ffmpeg -i input.mp4 -map 0:v:0 -map 0:a:[index] -map 0:a:0 -c copy output.mp4
```
where,   [index] = index of audio track which you want to set as default (in zero based indexing)  

---
### Server side dependencies

```
 Socket.io

 Node.js

 Express
```

---

## How to run locally


#### How to run the server

```bash
git clone https://github.com/abhay-666/SAVY.git

cd SAVY

```

#### Install Dependencies

```bash
 npm install
```

#### Run the server

```bash
 npm run dev
```

Server will be running on your PORT environment variable || PORT 5000

---
